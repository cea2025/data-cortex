import { Sidebar } from "@/components/sidebar";
import { Omnibar } from "@/components/omnibar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
      <Omnibar />
    </div>
  );
}
