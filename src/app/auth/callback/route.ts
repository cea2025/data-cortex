import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const SUPER_ADMIN_EMAILS = [
  "cea@glb.org.il",
  "a0504105090@gmail.com",
];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const email = user.email ?? "";
        const domain = email.split("@")[1] ?? "";
        const isPreApprovedSuperAdmin = SUPER_ADMIN_EMAILS.includes(email.toLowerCase());

        let organizationId: string | null = null;
        let orgSlug: string | null = null;

        if (domain) {
          const org = await prisma.organization.findFirst({
            where: { domainMappings: { has: domain } },
            select: { id: true, slug: true },
          });
          if (org) {
            organizationId = org.id;
            orgSlug = org.slug;
          }
        }

        const profile = await prisma.userProfile.upsert({
          where: { id: user.id },
          update: {
            email,
            displayName:
              user.user_metadata?.full_name ??
              user.user_metadata?.name ??
              email ??
              "Unknown",
            avatarUrl: user.user_metadata?.avatar_url ?? null,
            ...(organizationId ? { organizationId } : {}),
            ...(isPreApprovedSuperAdmin ? { isSuperAdmin: true, role: "admin", status: "ACTIVE" } : {}),
          },
          create: {
            id: user.id,
            email,
            displayName:
              user.user_metadata?.full_name ??
              user.user_metadata?.name ??
              email ??
              "Unknown",
            avatarUrl: user.user_metadata?.avatar_url ?? null,
            role: isPreApprovedSuperAdmin ? "admin" : "viewer",
            status: isPreApprovedSuperAdmin ? "ACTIVE" : "PENDING",
            isSuperAdmin: isPreApprovedSuperAdmin,
            organizationId,
          },
        });

        const redirectBase = getRedirectBase(request, origin);

        if (profile.status === "PENDING") {
          return NextResponse.redirect(`${redirectBase}/pending`);
        }
        if (profile.status === "SUSPENDED") {
          return NextResponse.redirect(`${redirectBase}/suspended`);
        }

        const redirectPath = orgSlug ? `/${orgSlug}/` : "/";
        return NextResponse.redirect(`${redirectBase}${redirectPath}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}

function getRedirectBase(request: Request, origin: string): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  if (isLocalEnv) return origin;
  if (forwardedHost) return `https://${forwardedHost}`;
  return origin;
}
