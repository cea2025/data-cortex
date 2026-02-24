#!/usr/bin/env tsx
/**
 * Seeds sample knowledge items for important tables after SQL import.
 * Run AFTER parse-sql-dumps.ts
 */
import "dotenv/config";
import { PrismaClient, type KnowledgeItemType, type KnowledgeStatus } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const org = await prisma.organization.findUnique({ where: { slug: "glb" } });
  if (!org) throw new Error("Organization 'glb' not found. Run parse-sql-dumps.ts first.");

  // Ensure admin + contributor users exist
  const adminUser = await prisma.userProfile.upsert({
    where: { email: "admin@datacortex.dev" },
    update: {},
    create: {
      email: "admin@datacortex.dev",
      displayName: "דוד כהן",
      role: "admin",
      status: "ACTIVE",
      organizationId: org.id,
    },
  });

  const contributorUser = await prisma.userProfile.upsert({
    where: { email: "contributor@datacortex.dev" },
    update: {},
    create: {
      email: "contributor@datacortex.dev",
      displayName: "רונית לוי",
      role: "contributor",
      status: "ACTIVE",
      organizationId: org.id,
    },
  });

  const viewerUser = await prisma.userProfile.upsert({
    where: { email: "viewer@datacortex.dev" },
    update: {},
    create: {
      email: "viewer@datacortex.dev",
      displayName: "משה ישראלי",
      role: "viewer",
      status: "ACTIVE",
      organizationId: org.id,
    },
  });

  console.log(`✅ Users ensured: ${adminUser.displayName}, ${contributorUser.displayName}, ${viewerUser.displayName}`);

  // Helper: find table asset
  async function findTable(systemName: string, tableName: string) {
    return prisma.dataAsset.findFirst({
      where: { organizationId: org!.id, assetType: "table", systemName, tableName },
    });
  }

  // Helper: find column asset
  async function findColumn(systemName: string, tableName: string, columnName: string) {
    return prisma.dataAsset.findFirst({
      where: { organizationId: org!.id, assetType: "column", systemName, tableName, columnName },
    });
  }

  // Delete existing knowledge items (safe to re-run)
  await prisma.knowledgeItem.deleteMany({ where: { organizationId: org.id } });
  console.log("🗑️  Cleared existing knowledge items");

  const knowledgeData: Array<{
    system: string;
    table: string;
    column?: string;
    itemType: KnowledgeItemType;
    status: KnowledgeStatus;
    title: string;
    contentHebrew: string;
    contentEnglish?: string;
    authorId: string;
    reviewerId?: string;
    isCanonical?: boolean;
  }> = [
    // ─── Gemach system ────────────────────────────────────────
    {
      system: "Gemach", table: "Alfon", itemType: "business_rule", status: "approved",
      title: "טבלת אלפון – טבלת בסיס של כל הלקוחות",
      contentHebrew: "טבלת Alfon היא טבלת האב המרכזית של כל הלקוחות במערכת. כל לקוח חייב שורה בטבלה זו. שדה ID הוא המזהה הייחודי שמשמש כ-FK בכל שאר הטבלאות.",
      contentEnglish: "Alfon is the master customer table. Every customer must have a row here. The ID field serves as FK across all related tables.",
      authorId: adminUser.id, reviewerId: contributorUser.id, isCanonical: true,
    },
    {
      system: "Gemach", table: "Alfon", column: "ת_זהות", itemType: "warning", status: "approved",
      title: "שדה ת.ז. – מכיל ערכים לא ולידיים",
      contentHebrew: "שדה ת_זהות מכיל ערכים עם אפסים מובילים שנחתכו, ת.ז. עם 8 ספרות במקום 9, וערכי NULL. יש לבצע validation לפני שימוש בדוחות רגולטוריים.",
      authorId: contributorUser.id,
    },
    {
      system: "Gemach", table: "תיקים", itemType: "business_rule", status: "approved",
      title: "טבלת תיקים – תיק הלוואה ראשי",
      contentHebrew: "כל שורה מייצגת תיק הלוואה. שדה מס_תיק הוא PK. שדה מס_כרטיס מקשר לטבלת Alfon. סטטוס תיק: 1=פעיל, 2=סגור, 3=בפיגור, 4=בהליך משפטי.",
      contentEnglish: "Each row represents a loan case. מס_תיק is the PK. מס_כרטיס links to Alfon. Status: 1=Active, 2=Closed, 3=Delinquent, 4=Legal.",
      authorId: adminUser.id, reviewerId: contributorUser.id, isCanonical: true,
    },
    {
      system: "Gemach", table: "תנועות", itemType: "calculation_logic", status: "approved",
      title: "תנועות – לוגיקת חישוב יתרה",
      contentHebrew: "יתרת תיק = סכום כל התנועות מסוג 'זכות' פחות סכום כל התנועות מסוג 'חובה'. חישוב מתבצע ב-trigger לאחר כל INSERT. עדכון ידני אסור.",
      authorId: adminUser.id,
    },
    {
      system: "Gemach", table: "תנועות", column: "סכום", itemType: "warning", status: "approved",
      title: "שדה סכום – ערכים שליליים",
      contentHebrew: "שדה סכום יכול להכיל ערכים שליליים לייצוג זיכויים. אין constraint ברמת ה-DB. יש לוודא ABS בדוחות סיכום.",
      authorId: contributorUser.id,
    },
    {
      system: "Gemach", table: "מטבע", itemType: "business_rule", status: "approved",
      title: "טבלת מטבע – קודים פנימיים",
      contentHebrew: "קוד 1 = שקל, קוד 2 = דולר, קוד 3 = אירו. הקודים אינם תואמים ל-ISO 4217. יש להשתמש בטבלת המרה בדוחות לבנק ישראל.",
      authorId: adminUser.id, reviewerId: contributorUser.id,
    },
    {
      system: "Gemach", table: "סוגי_הלואות", itemType: "business_rule", status: "approved",
      title: "סיווג סוגי הלוואות",
      contentHebrew: "טבלת lookup לסוגי ההלוואות. שדה קוד_סוג מקושר ל-תיקים.סוג_הלואה. ערכים 1-10 הם סוגים סטנדרטיים, 11-20 סוגים מיוחדים, 99 = לא מוגדר.",
      authorId: adminUser.id,
    },
    {
      system: "Gemach", table: "סוכנים", itemType: "business_rule", status: "approved",
      title: "טבלת סוכנים – נציגי גביה",
      contentHebrew: "כל סוכן מייצג נציג גביה או יועץ. שדה קוד_סוכן הוא PK. שדה פעיל מציין אם הסוכן עדיין עובד (1=כן, 0=לא). סוכנים לא פעילים נשארים לצורך היסטוריה.",
      authorId: contributorUser.id,
    },
    {
      system: "Gemach", table: "DO", itemType: "warning", status: "approved",
      title: "טבלת DO – שם טכני לא מתועד",
      contentHebrew: "שם הטבלה DO אינו מתועד רשמית. מדובר כנראה בטבלת 'דף חשבון' (D.O = Daf Operation). יש 45 עמודות. יש לגשת בזהירות – חלק מהשדות אינם בשימוש מאז 2019.",
      contentEnglish: "Table name 'DO' is undocumented. Likely stands for 'Daf Operation' (account statement). Some columns unused since 2019.",
      authorId: adminUser.id,
    },
    {
      system: "Gemach", table: "קבוצות", itemType: "business_rule", status: "approved",
      title: "קבוצות לקוחות – סיווג ארגוני",
      contentHebrew: "כל לקוח משויך לקבוצה אחת. הקבוצות מגדירות ריביות, תנאי הלוואה ומסלולי אשראי. קבוצה 0 = ברירת מחדל לחדשים.",
      authorId: contributorUser.id,
    },
    // ─── Yechidot system ──────────────────────────────────────
    {
      system: "Yechidot", table: "Yechida", itemType: "business_rule", status: "approved",
      title: "טבלת יחידה – ישות ארגונית בסיסית",
      contentHebrew: "כל שורה מייצגת יחידה/סניף ארגוני. שדה קוד_יחידה הוא PK. משמשת כ-lookup עבור כל הישויות הקשורות ליחידות ארגוניות.",
      authorId: adminUser.id, isCanonical: true,
    },
    {
      system: "Yechidot", table: "Premia", itemType: "calculation_logic", status: "approved",
      title: "חישוב פרמיה – לוגיקה עסקית",
      contentHebrew: "פרמיה מחושבת לפי: סכום_בסיס × מקדם_סיכון × (1 + תוספת_גיל). התוצאה מעוגלת ל-2 ספרות. חישוב מתבצע פעם בחודש ב-batch.",
      authorId: contributorUser.id,
    },
    // ─── AptCrmSys ────────────────────────────────────────────
    {
      system: "AptCrmSys", table: "Languages", itemType: "business_rule", status: "approved",
      title: "טבלת שפות – הגדרות מערכת",
      contentHebrew: "טבלת שפות המערכת. ID=1 עברית, ID=2 אנגלית. משמשת לשליפת תרגומי UI ולוקליזציה של הודעות מערכת.",
      authorId: adminUser.id,
    },
    {
      system: "AptCrmSys", table: "Screens", itemType: "deprecation", status: "approved",
      title: "טבלת מסכים – בתהליך הוצאה משימוש",
      contentHebrew: "טבלת Screens מגדירה מסכי UI ישנים של מערכת AptCRM. המעבר ל-React UI החדש (Data Cortex) מייתר טבלה זו. צפויה מחיקה ברבעון 4/2026.",
      contentEnglish: "Screens table defines legacy AptCRM UI screens. Migration to new React UI (Data Cortex) makes this obsolete. Scheduled for deletion Q4/2026.",
      authorId: adminUser.id, reviewerId: contributorUser.id,
    },
    // Pending review items
    {
      system: "Gemach", table: "Alfon", column: "סיווג_ראשי", itemType: "business_rule", status: "review",
      title: "סיווג ראשי – ערכים לא עקביים",
      contentHebrew: "שדה סיווג_ראשי מכיל ערכי free text ולא lookup. נמצאו 47 וריאציות שונות. מומלץ לנרמל לטבלת lookup.",
      authorId: viewerUser.id,
    },
    {
      system: "Gemach", table: "Alfon", column: "אימייל", itemType: "warning", status: "review",
      title: "שדה אימייל – פורמט לא אחיד",
      contentHebrew: "שדה אימייל לא מכיל validation. נמצאו כתובות ללא @, עם רווחים, ועם תווים בעברית. יש לנקות לפני שימוש במיילים אוטומטיים.",
      authorId: viewerUser.id,
    },
  ];

  let created = 0;
  for (const item of knowledgeData) {
    let dataAssetId: string | null = null;

    if (item.column) {
      const col = await findColumn(item.system, item.table, item.column);
      dataAssetId = col?.id ?? null;
    }
    if (!dataAssetId) {
      const tbl = await findTable(item.system, item.table);
      dataAssetId = tbl?.id ?? null;
    }

    if (!dataAssetId) {
      console.warn(`  ⚠️ Could not find asset: ${item.system}.${item.table}${item.column ? '.' + item.column : ''}`);
      continue;
    }

    await prisma.knowledgeItem.create({
      data: {
        itemType: item.itemType,
        status: item.status,
        title: item.title,
        contentHebrew: item.contentHebrew,
        contentEnglish: item.contentEnglish ?? null,
        dataAssetId,
        authorId: item.authorId,
        reviewerId: item.reviewerId ?? null,
        isCanonical: item.isCanonical ?? false,
        verifiedAt: item.status === "approved" ? new Date() : null,
        sourceProvenance: { addedBy: "seed-script", source: "SQL Dump Analysis" },
        organizationId: org.id,
      },
    });
    created++;
  }

  // Add some audit logs
  const sampleTable = await findTable("Gemach", "Alfon");
  if (sampleTable) {
    await prisma.auditLog.deleteMany({ where: { organizationId: org.id } });
    await prisma.auditLog.createMany({
      data: [
        { entityId: sampleTable.id, entityType: "DataAsset", action: "sql_import", newValue: { tables: 253, columns: 3761 }, userId: adminUser.id, organizationId: org.id },
        { entityId: sampleTable.id, entityType: "KnowledgeItem", action: "submit_draft", newValue: { title: "טבלת אלפון – טבלת בסיס" }, userId: adminUser.id, organizationId: org.id },
        { entityId: sampleTable.id, entityType: "KnowledgeItem", action: "status_change_to_approved", newValue: { status: "approved" }, userId: contributorUser.id, organizationId: org.id },
      ],
    });
  }

  console.log(`\n✅ Created ${created} knowledge items`);
  console.log(`   Approved: ${knowledgeData.filter(k => k.status === 'approved').length}`);
  console.log(`   Pending review: ${knowledgeData.filter(k => k.status === 'review').length}`);
  console.log(`\n🎉 Knowledge seeding completed!`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
