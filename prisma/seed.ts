#!/usr/bin/env tsx
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Data Cortex database...\n");

  // Clean existing data in correct order (respects FK constraints)
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.aIInsightSource.deleteMany();
  await prisma.aIInsight.deleteMany();
  await prisma.knowledgeItem.deleteMany();
  await prisma.dataAsset.deleteMany();
  await prisma.userProfile.deleteMany();
  console.log("🗑️  Cleared existing data");

  // ─── USERS ─────────────────────────────────────────────
  const adminUser = await prisma.userProfile.upsert({
    where: { email: "admin@datacortex.dev" },
    update: {},
    create: {
      email: "admin@datacortex.dev",
      displayName: "דוד כהן",
      role: "admin",
      avatarUrl: null,
    },
  });

  const contributorUser = await prisma.userProfile.upsert({
    where: { email: "contributor@datacortex.dev" },
    update: {},
    create: {
      email: "contributor@datacortex.dev",
      displayName: "רונית לוי",
      role: "contributor",
      avatarUrl: null,
    },
  });

  console.log(`✅ Users: ${adminUser.displayName} (admin), ${contributorUser.displayName} (contributor)`);

  // ─── SYSTEM ────────────────────────────────────────────
  const coreSystem = await prisma.dataAsset.create({
    data: {
      assetType: "system",
      systemName: "CoreBanking",
      description: "Core Banking System – Legacy Mainframe",
      hebrewName: "מערכת בנקאות ליבה",
      ownerId: adminUser.id,
    },
  });

  // ─── SCHEMA ────────────────────────────────────────────
  const dboSchema = await prisma.dataAsset.create({
    data: {
      assetType: "schema",
      systemName: "CoreBanking",
      schemaName: "dbo",
      description: "Default database schema",
      hebrewName: "סכמה ראשית",
      parentId: coreSystem.id,
      ownerId: adminUser.id,
    },
  });

  console.log(`✅ System: ${coreSystem.systemName} → Schema: dbo`);

  // ─── TABLE: TBL_LN_CS (Loans) ─────────────────────────
  const loansTable = await prisma.dataAsset.create({
    data: {
      assetType: "table",
      systemName: "CoreBanking",
      schemaName: "dbo",
      tableName: "TBL_LN_CS",
      description: "Loans and credit cases master table",
      hebrewName: "טבלת הלוואות ותיקי אשראי",
      parentId: dboSchema.id,
      ownerId: adminUser.id,
    },
  });

  const loanColumns = [
    { columnName: "LN_ID", dataType: "BIGINT", hebrewName: "מזהה הלוואה", description: "Primary key – loan case identifier" },
    { columnName: "LKCH_ID", dataType: "BIGINT", hebrewName: "מזהה לקוח", description: "Customer foreign key" },
    { columnName: "Kod_Mishpacha", dataType: "INT", hebrewName: "קוד משפחה", description: "Family/household group code for aggregated risk" },
    { columnName: "Yitrat_Hov", dataType: "DECIMAL(18,2)", hebrewName: "יתרת חוב", description: "Current outstanding debt balance" },
    { columnName: "SKHM_HALVAA", dataType: "DECIMAL(18,2)", hebrewName: "סכום הלוואה מקורי", description: "Original loan amount at origination" },
    { columnName: "TRKH_PTCHA", dataType: "DATE", hebrewName: "תאריך פתיחה", description: "Loan origination date" },
    { columnName: "TRKH_SGRA", dataType: "DATE", hebrewName: "תאריך סגירה", description: "Loan maturity / closure date" },
    { columnName: "SUG_HALVAA", dataType: "INT", hebrewName: "סוג הלוואה", description: "Loan type code" },
    { columnName: "SHR_RBYT", dataType: "DECIMAL(5,4)", hebrewName: "שיעור ריבית", description: "Annual interest rate (decimal)" },
    { columnName: "KOD_MATBEA", dataType: "VARCHAR(3)", hebrewName: "קוד מטבע", description: "ISO currency code (ILS/USD/EUR)" },
    { columnName: "STTUS_HALVAA", dataType: "INT", hebrewName: "סטטוס הלוואה", description: "Loan status code" },
    { columnName: "KOD_SNIF", dataType: "INT", hebrewName: "קוד סניף", description: "Originating branch code" },
    { columnName: "SKHM_PGRH", dataType: "DECIMAL(18,2)", hebrewName: "סכום פיגור", description: "Overdue / delinquent amount" },
  ];

  const loanColAssets: Record<string, string> = {};
  for (const col of loanColumns) {
    const asset = await prisma.dataAsset.create({
      data: {
        assetType: "column",
        systemName: "CoreBanking",
        schemaName: "dbo",
        tableName: "TBL_LN_CS",
        columnName: col.columnName,
        dataType: col.dataType,
        hebrewName: col.hebrewName,
        description: col.description,
        parentId: loansTable.id,
        ownerId: adminUser.id,
      },
    });
    loanColAssets[col.columnName] = asset.id;
  }

  console.log(`✅ Table: TBL_LN_CS (${loanColumns.length} columns)`);

  // ─── TABLE: TBL_CONTACTS ──────────────────────────────
  const contactsTable = await prisma.dataAsset.create({
    data: {
      assetType: "table",
      systemName: "CoreBanking",
      schemaName: "dbo",
      tableName: "TBL_CONTACTS",
      description: "Customer contacts and personal information",
      hebrewName: "טבלת אנשי קשר ולקוחות",
      parentId: dboSchema.id,
      ownerId: adminUser.id,
    },
  });

  const contactColumns = [
    { columnName: "CONTACT_ID", dataType: "BIGINT", hebrewName: "מזהה איש קשר", description: "Primary key – contact identifier" },
    { columnName: "LKCH_ID", dataType: "BIGINT", hebrewName: "מזהה לקוח", description: "Customer foreign key" },
    { columnName: "SHM_PRTI", dataType: "NVARCHAR(100)", hebrewName: "שם פרטי", description: "First name" },
    { columnName: "SHM_MSHPCHA", dataType: "NVARCHAR(100)", hebrewName: "שם משפחה", description: "Family / last name" },
    { columnName: "Kod_Mishpacha", dataType: "INT", hebrewName: "קוד משפחה", description: "Family/household group code – links to TBL_LN_CS.Kod_Mishpacha" },
    { columnName: "MSPPR_ZHUT", dataType: "VARCHAR(9)", hebrewName: "מספר זהות", description: "National ID number (Teudat Zehut)" },
    { columnName: "TRKH_LYDA", dataType: "DATE", hebrewName: "תאריך לידה", description: "Date of birth" },
    { columnName: "KTVT_MAIL", dataType: "VARCHAR(255)", hebrewName: "כתובת מייל", description: "Email address" },
    { columnName: "TLPHN_NYAD", dataType: "VARCHAR(20)", hebrewName: "טלפון נייד", description: "Mobile phone number" },
    { columnName: "SUG_LKCH", dataType: "INT", hebrewName: "סוג לקוח", description: "Customer type (1=Individual, 2=Corporate)" },
    { columnName: "DRGAT_SKUN", dataType: "INT", hebrewName: "דרגת סיכון", description: "Risk rating (1-5 scale)" },
    { columnName: "KTVT_MGURM", dataType: "NVARCHAR(500)", hebrewName: "כתובת מגורים", description: "Residential address (free text)" },
    { columnName: "KOD_YSHV", dataType: "INT", hebrewName: "קוד יישוב", description: "CBS locality code" },
  ];

  const contactColAssets: Record<string, string> = {};
  for (const col of contactColumns) {
    const asset = await prisma.dataAsset.create({
      data: {
        assetType: "column",
        systemName: "CoreBanking",
        schemaName: "dbo",
        tableName: "TBL_CONTACTS",
        columnName: col.columnName,
        dataType: col.dataType,
        hebrewName: col.hebrewName,
        description: col.description,
        parentId: contactsTable.id,
        ownerId: adminUser.id,
      },
    });
    contactColAssets[col.columnName] = asset.id;
  }

  console.log(`✅ Table: TBL_CONTACTS (${contactColumns.length} columns)`);

  // ─── TABLE: TBL_PKDNOT (Deposits) ─────────────────────
  const depositsTable = await prisma.dataAsset.create({
    data: {
      assetType: "table",
      systemName: "CoreBanking",
      schemaName: "dbo",
      tableName: "TBL_PKDNOT",
      description: "Deposits master table",
      hebrewName: "טבלת פקדונות",
      parentId: dboSchema.id,
      ownerId: adminUser.id,
    },
  });

  const depositColumns = [
    { columnName: "PKDN_ID", dataType: "BIGINT", hebrewName: "מזהה פקדון", description: "Primary key – deposit identifier" },
    { columnName: "LKCH_ID", dataType: "BIGINT", hebrewName: "מזהה לקוח", description: "Customer foreign key" },
    { columnName: "SKHM_PKDN", dataType: "DECIMAL(18,2)", hebrewName: "סכום פקדון", description: "Deposit amount" },
    { columnName: "TRKH_PTCHA", dataType: "DATE", hebrewName: "תאריך פתיחה", description: "Deposit opening date" },
    { columnName: "TRKH_FRON", dataType: "DATE", hebrewName: "תאריך פירעון", description: "Maturity date" },
    { columnName: "SHR_RBYT", dataType: "DECIMAL(5,4)", hebrewName: "שיעור ריבית", description: "Interest rate" },
    { columnName: "SUG_PKDN", dataType: "INT", hebrewName: "סוג פקדון", description: "Deposit type code" },
    { columnName: "KOD_MATBEA", dataType: "VARCHAR(3)", hebrewName: "קוד מטבע", description: "Currency code" },
  ];

  for (const col of depositColumns) {
    await prisma.dataAsset.create({
      data: {
        assetType: "column",
        systemName: "CoreBanking",
        schemaName: "dbo",
        tableName: "TBL_PKDNOT",
        columnName: col.columnName,
        dataType: col.dataType,
        hebrewName: col.hebrewName,
        description: col.description,
        parentId: depositsTable.id,
        ownerId: adminUser.id,
      },
    });
  }

  console.log(`✅ Table: TBL_PKDNOT (${depositColumns.length} columns)`);

  // ─── KNOWLEDGE ITEMS ───────────────────────────────────

  // KI-1: Loan status codes (business rule on STTUS_HALVAA)
  await prisma.knowledgeItem.create({
    data: {
      itemType: "business_rule",
      status: "approved",
      title: "קודי סטטוס הלוואה",
      contentHebrew:
        "1 = פעילה, 2 = בפיגור, 3 = סגורה, 4 = מחוקה, 5 = בהליך משפטי. קוד 99 = שגיאה טכנית – אין להשתמש בדוחות.",
      contentEnglish:
        "1=Active, 2=Delinquent, 3=Closed, 4=Written-off, 5=Legal proceedings. Code 99=Technical error – do not use in reports.",
      dataAssetId: loanColAssets["STTUS_HALVAA"],
      authorId: adminUser.id,
      reviewerId: contributorUser.id,
      verifiedAt: new Date(),
      sourceProvenance: { addedBy: "admin@datacortex.dev", source: "Core Banking Operations Manual v4.1" },
    },
  });

  // KI-2: Warning on status 99 (warning on STTUS_HALVAA)
  await prisma.knowledgeItem.create({
    data: {
      itemType: "warning",
      status: "approved",
      title: "אזהרה – סטטוס 99 לא מתועד",
      contentHebrew:
        "שדה STTUS_HALVAA מכיל ערך 99 ב-342 רשומות. ערך זה אינו מתועד במסמכי המערכת המקוריים ונוצר כנראה עקב באג בהמרת נתונים מ-2018.",
      contentEnglish:
        "STTUS_HALVAA contains value 99 in 342 records. Undocumented in original system specs – likely a 2018 data-migration bug.",
      dataAssetId: loanColAssets["STTUS_HALVAA"],
      authorId: contributorUser.id,
      verifiedAt: new Date(),
      sourceProvenance: { addedBy: "contributor@datacortex.dev", source: "Tribal Knowledge – R&D Investigation" },
    },
  });

  // KI-3: Kod_Mishpacha deprecation (on TBL_LN_CS column)
  await prisma.knowledgeItem.create({
    data: {
      itemType: "deprecation",
      status: "approved",
      title: "שדה Kod_Mishpacha – הוצא משימוש",
      contentHebrew:
        "שדה Kod_Mishpacha הוחלף בשדה FAMILY_GROUP_ID בטבלת TBL_FAMILY_GROUPS החדשה (מרץ 2025). יש להשתמש ב-JOIN החדש. השדה הישן נשמר לתאימות אחורה בלבד.",
      contentEnglish:
        "Kod_Mishpacha replaced by FAMILY_GROUP_ID in new TBL_FAMILY_GROUPS table (March 2025). Use the new JOIN. Old field retained for backward compatibility only.",
      dataAssetId: loanColAssets["Kod_Mishpacha"],
      authorId: adminUser.id,
      reviewerId: contributorUser.id,
      verifiedAt: new Date(),
      sourceProvenance: { addedBy: "admin@datacortex.dev", source: "Architecture Decision Record #47" },
    },
  });

  // KI-4: Yitrat_Hov calculation logic
  await prisma.knowledgeItem.create({
    data: {
      itemType: "calculation_logic",
      status: "approved",
      title: "חישוב יתרת חוב – Yitrat_Hov",
      contentHebrew:
        "Yitrat_Hov = SKHM_HALVAA - סה\"כ תשלומים ששולמו. עדכון ליומי ב-batch לילי (23:00). ערך שלילי מעיד על תשלום יתר – דורש בדיקה ידנית.",
      contentEnglish:
        "Yitrat_Hov = SKHM_HALVAA - total payments made. Updated nightly via batch job (23:00). Negative value indicates overpayment – requires manual review.",
      dataAssetId: loanColAssets["Yitrat_Hov"],
      authorId: contributorUser.id,
      verifiedAt: new Date(),
      sourceProvenance: { addedBy: "contributor@datacortex.dev", source: "Batch Processing Runbook" },
    },
  });

  // KI-5: Interest rate formula
  await prisma.knowledgeItem.create({
    data: {
      itemType: "calculation_logic",
      status: "approved",
      title: "חישוב ריבית – נוסחה",
      contentHebrew:
        "הריבית מאוחסנת כערך עשרוני (0.0350 = 3.50%). ריבית יומית: SHR_RBYT / 365. שנה מעוברת: SHR_RBYT / 366.",
      contentEnglish:
        "Interest stored as decimal (0.0350 = 3.50%). Daily interest: SHR_RBYT / 365. Leap year: SHR_RBYT / 366.",
      dataAssetId: loanColAssets["SHR_RBYT"],
      authorId: adminUser.id,
      verifiedAt: new Date(),
      sourceProvenance: { addedBy: "admin@datacortex.dev", source: "Interest Calculation Module Docs v2" },
    },
  });

  // KI-6: Loan type mapping
  await prisma.knowledgeItem.create({
    data: {
      itemType: "business_rule",
      status: "approved",
      title: "סוגי הלוואות ומיפוי",
      contentHebrew:
        "1 = משכנתא, 2 = הלוואה צרכנית, 3 = הלוואה עסקית, 4 = קו אשראי, 5 = הלוואת סטודנטים. קודים 10-20 הם קודים פנימיים לבנק.",
      contentEnglish:
        "1=Mortgage, 2=Consumer, 3=Business, 4=Credit Line, 5=Student. Codes 10-20 are internal bank codes, not industry-standard.",
      dataAssetId: loanColAssets["SUG_HALVAA"],
      authorId: adminUser.id,
      reviewerId: contributorUser.id,
      verifiedAt: new Date(),
      sourceProvenance: { addedBy: "admin@datacortex.dev", source: "System Documentation v3.2" },
    },
  });

  // KI-7: Table-level rule on TBL_LN_CS
  await prisma.knowledgeItem.create({
    data: {
      itemType: "business_rule",
      status: "approved",
      title: "מדיניות מחיקה – TBL_LN_CS",
      contentHebrew:
        "טבלת TBL_LN_CS אינה תומכת במחיקה פיזית. כל ההלוואות נשמרות לצמיתות לצורכי רגולציה (באזל III, בנק ישראל). סגירה = עדכון STTUS_HALVAA=3.",
      contentEnglish:
        "TBL_LN_CS does not support physical deletion. All loans retained permanently for regulatory compliance (Basel III, Bank of Israel). Closure = set STTUS_HALVAA=3.",
      dataAssetId: loansTable.id,
      authorId: adminUser.id,
      verifiedAt: new Date(),
      sourceProvenance: { addedBy: "admin@datacortex.dev", source: "Data Retention Policy – Legal Dept" },
    },
  });

  // KI-8: PII warning on TBL_CONTACTS
  await prisma.knowledgeItem.create({
    data: {
      itemType: "warning",
      status: "approved",
      title: "טבלה רגישה – GDPR / חוק הגנת הפרטיות",
      contentHebrew:
        "TBL_CONTACTS מכילה מידע אישי מזהה (PII). כל גישה חייבת לעבור דרך שכבת ה-API המאושרת. גישה ישירה ל-DB דורשת אישור CISO.",
      contentEnglish:
        "TBL_CONTACTS contains PII. All access must go through the approved API layer. Direct DB access requires CISO approval.",
      dataAssetId: contactsTable.id,
      authorId: adminUser.id,
      verifiedAt: new Date(),
      sourceProvenance: { addedBy: "admin@datacortex.dev", source: "GDPR Compliance Framework" },
    },
  });

  // KI-9: Deprecation on Kod_Mishpacha in TBL_CONTACTS
  await prisma.knowledgeItem.create({
    data: {
      itemType: "deprecation",
      status: "review",
      title: "Kod_Mishpacha – שדה מיושן בטבלת אנשי קשר",
      contentHebrew:
        "שדה Kod_Mishpacha בטבלת TBL_CONTACTS מסונכרן עם TBL_LN_CS אך לא מתעדכן מ-01/2025. יש לקרוא את הערך מ-TBL_FAMILY_GROUPS בלבד.",
      contentEnglish:
        "Kod_Mishpacha in TBL_CONTACTS syncs with TBL_LN_CS but has not been updated since 01/2025. Read from TBL_FAMILY_GROUPS only.",
      dataAssetId: contactColAssets["Kod_Mishpacha"],
      authorId: contributorUser.id,
      sourceProvenance: { addedBy: "contributor@datacortex.dev", source: "Team Standup Note – 15/01/2025" },
    },
  });

  // KI-10: Risk scale on DRGAT_SKUN
  await prisma.knowledgeItem.create({
    data: {
      itemType: "business_rule",
      status: "approved",
      title: "סולם דרגות סיכון",
      contentHebrew:
        "סולם 1-5: 1=סיכון נמוך מאוד, 2=נמוך, 3=בינוני, 4=גבוה, 5=קריטי. ערכים מעל 5 אינם חוקיים. מתוכנן מעבר לסולם 1-10 ברבעון 3/2026.",
      contentEnglish:
        "Scale 1-5: 1=Very Low, 2=Low, 3=Medium, 4=High, 5=Critical. Values >5 are invalid. Migration to 1-10 scale planned for Q3/2026.",
      dataAssetId: contactColAssets["DRGAT_SKUN"],
      authorId: adminUser.id,
      reviewerId: contributorUser.id,
      verifiedAt: new Date(),
      sourceProvenance: { addedBy: "admin@datacortex.dev", source: "Risk Management Policy v6" },
    },
  });

  // ─── AUDIT LOG (sample) ────────────────────────────────
  await prisma.auditLog.create({
    data: {
      entityId: loansTable.id,
      entityType: "DataAsset",
      action: "CREATE",
      newValue: { tableName: "TBL_LN_CS", assetType: "table" },
      userId: adminUser.id,
    },
  });

  console.log(`✅ Knowledge Items: 10 created (business rules, warnings, deprecations, calculation logic)`);
  console.log(`✅ Audit Log: 1 sample entry`);
  console.log(`\n🎉 Seed completed successfully!`);
  console.log(`   System: CoreBanking`);
  console.log(`   Schema: dbo`);
  console.log(`   Tables: TBL_LN_CS (${loanColumns.length} cols), TBL_CONTACTS (${contactColumns.length} cols), TBL_PKDNOT (${depositColumns.length} cols)`);
  console.log(`   Users:  ${adminUser.email} (admin), ${contributorUser.email} (contributor)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
