#!/usr/bin/env tsx
import { PrismaClient } from "../src/generated/prisma/client";

// @ts-expect-error Prisma v7 requires adapter or accelerateUrl at type-level, but prisma.config.ts handles URL
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Data Cortex database...");

  // Create demo user
  const demoUser = await prisma.userProfile.upsert({
    where: { email: "demo@datacortex.dev" },
    update: {},
    create: {
      email: "demo@datacortex.dev",
      displayName: "משתמש דמו",
      role: "admin",
    },
  });

  // Create Core Banking System
  const coreSystem = await prisma.dataAsset.create({
    data: {
      assetType: "system",
      systemName: "CoreBanking",
      description: "Core Banking System",
      hebrewName: "מערכת בנקאות ליבה",
      ownerId: demoUser.id,
    },
  });

  // Create dbo schema
  const dboSchema = await prisma.dataAsset.create({
    data: {
      assetType: "schema",
      systemName: "CoreBanking",
      schemaName: "dbo",
      description: "Default schema",
      hebrewName: "סכמה ראשית",
      parentId: coreSystem.id,
      ownerId: demoUser.id,
    },
  });

  // --- LOANS TABLE ---
  const loansTable = await prisma.dataAsset.create({
    data: {
      assetType: "table",
      systemName: "CoreBanking",
      schemaName: "dbo",
      tableName: "TBL_HALVAOT",
      description: "Loans master table",
      hebrewName: "טבלת הלוואות",
      parentId: dboSchema.id,
      ownerId: demoUser.id,
    },
  });

  const loanColumns = [
    { columnName: "HALVAA_ID", dataType: "BIGINT", hebrewName: "מזהה הלוואה", description: "Primary key - loan identifier" },
    { columnName: "LKCH_ID", dataType: "BIGINT", hebrewName: "מזהה לקוח", description: "Customer foreign key" },
    { columnName: "SKHM_HALVAA", dataType: "DECIMAL(18,2)", hebrewName: "סכום הלוואה", description: "Original loan amount" },
    { columnName: "SKHM_YTRA", dataType: "DECIMAL(18,2)", hebrewName: "סכום יתרה", description: "Current outstanding balance" },
    { columnName: "TRKH_PTCHA", dataType: "DATE", hebrewName: "תאריך פתיחה", description: "Loan origination date" },
    { columnName: "TRKH_SGRA", dataType: "DATE", hebrewName: "תאריך סגירה", description: "Loan maturity/closure date" },
    { columnName: "SUG_HALVAA", dataType: "INT", hebrewName: "סוג הלוואה", description: "Loan type code" },
    { columnName: "SHR_RBYT", dataType: "DECIMAL(5,4)", hebrewName: "שיעור ריבית", description: "Interest rate" },
    { columnName: "KOD_MATBEA", dataType: "VARCHAR(3)", hebrewName: "קוד מטבע", description: "Currency code (ILS/USD/EUR)" },
    { columnName: "STTUS_HALVAA", dataType: "INT", hebrewName: "סטטוס הלוואה", description: "Loan status code" },
  ];

  for (const col of loanColumns) {
    await prisma.dataAsset.create({
      data: {
        assetType: "column",
        systemName: "CoreBanking",
        schemaName: "dbo",
        tableName: "TBL_HALVAOT",
        columnName: col.columnName,
        dataType: col.dataType,
        hebrewName: col.hebrewName,
        description: col.description,
        parentId: loansTable.id,
        ownerId: demoUser.id,
      },
    });
  }

  // --- DEPOSITS TABLE ---
  const depositsTable = await prisma.dataAsset.create({
    data: {
      assetType: "table",
      systemName: "CoreBanking",
      schemaName: "dbo",
      tableName: "TBL_PKDNOT",
      description: "Deposits master table",
      hebrewName: "טבלת פקדונות",
      parentId: dboSchema.id,
      ownerId: demoUser.id,
    },
  });

  const depositColumns = [
    { columnName: "PKDN_ID", dataType: "BIGINT", hebrewName: "מזהה פקדון", description: "Primary key - deposit identifier" },
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
        ownerId: demoUser.id,
      },
    });
  }

  // --- CONTACTS TABLE ---
  const contactsTable = await prisma.dataAsset.create({
    data: {
      assetType: "table",
      systemName: "CoreBanking",
      schemaName: "dbo",
      tableName: "TBL_LKCHOT",
      description: "Customers/Contacts master table",
      hebrewName: "טבלת לקוחות",
      parentId: dboSchema.id,
      ownerId: demoUser.id,
    },
  });

  const contactColumns = [
    { columnName: "LKCH_ID", dataType: "BIGINT", hebrewName: "מזהה לקוח", description: "Primary key - customer identifier" },
    { columnName: "SHM_PRTI", dataType: "NVARCHAR(100)", hebrewName: "שם פרטי", description: "First name" },
    { columnName: "SHM_MSHPCHA", dataType: "NVARCHAR(100)", hebrewName: "שם משפחה", description: "Last name" },
    { columnName: "MSPPR_ZHUT", dataType: "VARCHAR(9)", hebrewName: "מספר זהות", description: "National ID number" },
    { columnName: "TRKH_LYDA", dataType: "DATE", hebrewName: "תאריך לידה", description: "Date of birth" },
    { columnName: "KTVT_MAIL", dataType: "VARCHAR(255)", hebrewName: "כתובת מייל", description: "Email address" },
    { columnName: "TLPHN_NYAD", dataType: "VARCHAR(20)", hebrewName: "טלפון נייד", description: "Mobile phone number" },
    { columnName: "SUG_LKCH", dataType: "INT", hebrewName: "סוג לקוח", description: "Customer type (individual/corporate)" },
    { columnName: "DRGAT_SKUN", dataType: "INT", hebrewName: "דרגת סיכון", description: "Risk rating" },
  ];

  for (const col of contactColumns) {
    await prisma.dataAsset.create({
      data: {
        assetType: "column",
        systemName: "CoreBanking",
        schemaName: "dbo",
        tableName: "TBL_LKCHOT",
        columnName: col.columnName,
        dataType: col.dataType,
        hebrewName: col.hebrewName,
        description: col.description,
        parentId: contactsTable.id,
        ownerId: demoUser.id,
      },
    });
  }

  // --- KNOWLEDGE ITEMS ---
  // Get column assets for referencing
  const sttusCol = await prisma.dataAsset.findFirst({
    where: { columnName: "STTUS_HALVAA" },
  });
  const sugHalvaaCol = await prisma.dataAsset.findFirst({
    where: { columnName: "SUG_HALVAA" },
  });
  const drgatSkunCol = await prisma.dataAsset.findFirst({
    where: { columnName: "DRGAT_SKUN" },
  });
  const shrRbytLoan = await prisma.dataAsset.findFirst({
    where: { columnName: "SHR_RBYT", tableName: "TBL_HALVAOT" },
  });

  if (sttusCol) {
    await prisma.knowledgeItem.create({
      data: {
        itemType: "business_rule",
        status: "approved",
        title: "קודי סטטוס הלוואה",
        contentHebrew: "1 = פעילה, 2 = בפיגור, 3 = סגורה, 4 = מחוקה, 5 = בהליך משפטי. קוד 99 = שגיאה טכנית - אין להשתמש בדוחות.",
        contentEnglish: "1=Active, 2=Delinquent, 3=Closed, 4=Written-off, 5=Legal proceedings. Code 99=Technical error - do not use in reports.",
        dataAssetId: sttusCol.id,
        authorId: demoUser.id,
        verifiedAt: new Date(),
        sourceProvenance: { addedBy: "demo@datacortex.dev", source: "Manual Documentation" },
      },
    });

    await prisma.knowledgeItem.create({
      data: {
        itemType: "warning",
        status: "approved",
        title: "אזהרה - סטטוס 99",
        contentHebrew: "שדה STTUS_HALVAA מכיל ערך 99 ב-342 רשומות. ערך זה אינו מתועד במסמכי המערכת המקוריים ונוצר כנראה עקב באג בהמרת נתונים מ-2018.",
        contentEnglish: "Field STTUS_HALVAA contains value 99 in 342 records. This value is undocumented in original system docs and likely resulted from a data migration bug in 2018.",
        dataAssetId: sttusCol.id,
        authorId: demoUser.id,
        verifiedAt: new Date(),
        sourceProvenance: { addedBy: "demo@datacortex.dev", source: "Tribal Knowledge" },
      },
    });
  }

  if (sugHalvaaCol) {
    await prisma.knowledgeItem.create({
      data: {
        itemType: "calculation_logic",
        status: "approved",
        title: "סוגי הלוואות ומיפוי",
        contentHebrew: "1 = משכנתא, 2 = הלוואה צרכנית, 3 = הלוואה עסקית, 4 = קו אשראי, 5 = הלוואת סטודנטים. סוגים 10-20 הם קודים פנימיים לבנק ואינם תקניים.",
        contentEnglish: "1=Mortgage, 2=Consumer Loan, 3=Business Loan, 4=Credit Line, 5=Student Loan. Types 10-20 are internal bank codes, not industry-standard.",
        dataAssetId: sugHalvaaCol.id,
        authorId: demoUser.id,
        verifiedAt: new Date(),
        sourceProvenance: { addedBy: "demo@datacortex.dev", source: "System Documentation v3.2" },
      },
    });
  }

  if (drgatSkunCol) {
    await prisma.knowledgeItem.create({
      data: {
        itemType: "business_rule",
        status: "approved",
        title: "סולם דרגות סיכון",
        contentHebrew: "סולם 1-5: 1=סיכון נמוך מאוד, 2=סיכון נמוך, 3=סיכון בינוני, 4=סיכון גבוה, 5=סיכון קריטי. ערכים מעל 5 אינם חוקיים.",
        contentEnglish: "Scale 1-5: 1=Very Low Risk, 2=Low Risk, 3=Medium Risk, 4=High Risk, 5=Critical Risk. Values above 5 are invalid.",
        dataAssetId: drgatSkunCol.id,
        authorId: demoUser.id,
        verifiedAt: new Date(),
        sourceProvenance: { addedBy: "demo@datacortex.dev", source: "Risk Management Policy" },
      },
    });

    await prisma.knowledgeItem.create({
      data: {
        itemType: "deprecation",
        status: "review",
        title: "שינוי צפוי בסולם סיכון",
        contentHebrew: "מתוכנן מעבר לסולם 1-10 ברבעון 3/2026. יש להיערך להמרת קודים. תאריך יעד: 01/09/2026.",
        contentEnglish: "Planned migration to 1-10 scale in Q3/2026. Prepare for code conversion. Target date: 01/09/2026.",
        dataAssetId: drgatSkunCol.id,
        authorId: demoUser.id,
        sourceProvenance: { addedBy: "demo@datacortex.dev", source: "Project Board Decision" },
      },
    });
  }

  if (shrRbytLoan) {
    await prisma.knowledgeItem.create({
      data: {
        itemType: "calculation_logic",
        status: "approved",
        title: "חישוב ריבית - נוסחה",
        contentHebrew: "הריבית מאוחסנת כערך עשרוני (למשל 0.0350 = 3.50%). נוסחת הריבית היומית: SHR_RBYT / 365. לשנה מעוברת: SHR_RBYT / 366.",
        contentEnglish: "Interest is stored as decimal (e.g., 0.0350 = 3.50%). Daily interest formula: SHR_RBYT / 365. For leap year: SHR_RBYT / 366.",
        dataAssetId: shrRbytLoan.id,
        authorId: demoUser.id,
        verifiedAt: new Date(),
        sourceProvenance: { addedBy: "demo@datacortex.dev", source: "Interest Calculation Module Docs" },
      },
    });
  }

  // Knowledge items on tables
  await prisma.knowledgeItem.create({
    data: {
      itemType: "business_rule",
      status: "approved",
      title: "מפתח ראשי ומדיניות מחיקה",
      contentHebrew: "טבלת TBL_HALVAOT אינה תומכת במחיקה פיזית. כל ההלוואות נשמרות לצמיתות לצורכי רגולציה. סגירת הלוואה מתבצעת באמצעות עדכון STTUS_HALVAA=3.",
      contentEnglish: "TBL_HALVAOT does not support physical deletion. All loans are retained permanently for regulatory compliance. Loan closure is done by updating STTUS_HALVAA=3.",
      dataAssetId: loansTable.id,
      authorId: demoUser.id,
      verifiedAt: new Date(),
      sourceProvenance: { addedBy: "demo@datacortex.dev", source: "Data Retention Policy" },
    },
  });

  await prisma.knowledgeItem.create({
    data: {
      itemType: "warning",
      status: "approved",
      title: "טבלה רגישה - GDPR",
      contentHebrew: "טבלת TBL_LKCHOT מכילה מידע אישי מזהה (PII). כל גישה חייבת לעבור דרך שכבת ה-API המאושרת. גישה ישירה ל-DB דורשת אישור CISO.",
      contentEnglish: "TBL_LKCHOT contains PII data. All access must go through the approved API layer. Direct DB access requires CISO approval.",
      dataAssetId: contactsTable.id,
      authorId: demoUser.id,
      verifiedAt: new Date(),
      sourceProvenance: { addedBy: "demo@datacortex.dev", source: "GDPR Compliance Framework" },
    },
  });

  console.log("Seed completed successfully!");
  console.log(`Created system: ${coreSystem.id}`);
  console.log(`Created tables: ${loansTable.id}, ${depositsTable.id}, ${contactsTable.id}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
