#!/usr/bin/env tsx
/**
 * Parses SQL Server DDL dumps from raw_sql_dumps/ and creates DataAsset records
 * for every system, schema, table, and column found.
 */
import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local" });
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"];
if (!connectionString) throw new Error("DIRECT_URL or DATABASE_URL required");
const pool = new pg.Pool({
  connectionString,
  ssl: connectionString.includes("supabase") ? { rejectUnauthorized: process.env.NODE_ENV === "production" } : undefined,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface ParsedColumn {
  name: string;
  dataType: string;
  nullable: boolean;
}

interface ParsedTable {
  schema: string;
  name: string;
  columns: ParsedColumn[];
}

interface ParsedDatabase {
  dbName: string;
  tables: ParsedTable[];
}

function parseSqlDump(filePath: string): ParsedDatabase {
  const content = fs.readFileSync(filePath, "utf-8");

  const dbMatch = content.match(/CREATE DATABASE \[([^\]]+)\]/);
  const dbName = dbMatch ? dbMatch[1] : path.basename(filePath, ".sql");

  const tables: ParsedTable[] = [];

  const tableRegex =
    /CREATE TABLE \[([^\]]+)\]\.\[([^\]]+)\]\s*\(([\s\S]*?)^\)/gm;
  let match: RegExpExecArray | null;

  while ((match = tableRegex.exec(content)) !== null) {
    const schema = match[1];
    const tableName = match[2];
    const body = match[3];

    const columns: ParsedColumn[] = [];
    const lines = body.split("\n");

    for (const line of lines) {
      const colMatch = line.match(
        /^\s*\[([^\]]+)\]\s+\[([^\]]+)\](?:\(([^)]*)\))?\s*(.*)/
      );
      if (!colMatch) continue;

      const colName = colMatch[1];
      let dataType = colMatch[2];
      const precision = colMatch[3];
      const rest = colMatch[4] || "";

      if (precision) {
        dataType += `(${precision})`;
      }
      const nullable = !rest.includes("NOT NULL");

      columns.push({ name: colName, dataType: dataType.toUpperCase(), nullable });
    }

    if (columns.length > 0) {
      tables.push({ schema, name: tableName, columns });
    }
  }

  return { dbName, tables };
}

async function main() {
  const dumpsDir = path.resolve(__dirname, "../raw_sql_dumps/glb");
  if (!fs.existsSync(dumpsDir)) {
    console.error("No raw_sql_dumps/glb directory found");
    process.exit(1);
  }

  const sqlFiles = fs
    .readdirSync(dumpsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`📂 Found ${sqlFiles.length} SQL dump files\n`);

  const allDatabases: ParsedDatabase[] = [];
  for (const file of sqlFiles) {
    const filePath = path.join(dumpsDir, file);
    const db = parseSqlDump(filePath);
    allDatabases.push(db);
    const totalCols = db.tables.reduce((sum, t) => sum + t.columns.length, 0);
    console.log(
      `  📄 ${file}: DB="${db.dbName}" → ${db.tables.length} tables, ${totalCols} columns`
    );
  }

  const totalTables = allDatabases.reduce((s, d) => s + d.tables.length, 0);
  const totalColumns = allDatabases.reduce(
    (s, d) => s + d.tables.reduce((s2, t) => s2 + t.columns.length, 0),
    0
  );
  console.log(`\n📊 Total: ${totalTables} tables, ${totalColumns} columns`);

  // ─── Get or create organization ───────────────────────────
  const org = await prisma.organization.upsert({
    where: { slug: "glb" },
    update: {},
    create: { slug: "glb", name: "Global Banking Corp", domainMappings: ["gemach.local"] },
  });

  // Get admin user
  let adminUser = await prisma.userProfile.findFirst({
    where: { organizationId: org.id, role: "admin", status: "ACTIVE" },
  });
  if (!adminUser) {
    adminUser = await prisma.userProfile.upsert({
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
  }

  console.log(`\n🏗️  Importing into organization: ${org.name} (${org.slug})`);
  console.log(`   Owner: ${adminUser.displayName}\n`);

  // ─── Clean existing auto-imported assets ──────────────────
  // Delete knowledge items first (FK), then assets
  console.log("🗑️  Cleaning existing data assets and knowledge...");
  await prisma.assetRelationship.deleteMany({ where: { organizationId: org.id } });
  await prisma.knowledgeItem.deleteMany({ where: { organizationId: org.id } });
  await prisma.dataAsset.deleteMany({ where: { organizationId: org.id } });

  // ─── Import ───────────────────────────────────────────────
  let tableCount = 0;
  let columnCount = 0;

  for (const db of allDatabases) {
    // Create system
    const system = await prisma.dataAsset.create({
      data: {
        assetType: "system",
        systemName: db.dbName,
        description: `Database: ${db.dbName}`,
        ownerId: adminUser.id,
        organizationId: org.id,
      },
    });

    // Group tables by schema
    const schemaMap = new Map<string, ParsedTable[]>();
    for (const table of db.tables) {
      const key = table.schema;
      if (!schemaMap.has(key)) schemaMap.set(key, []);
      schemaMap.get(key)!.push(table);
    }

    for (const [schemaName, tables] of schemaMap) {
      const schema = await prisma.dataAsset.create({
        data: {
          assetType: "schema",
          systemName: db.dbName,
          schemaName,
          description: `Schema: ${db.dbName}.${schemaName}`,
          parentId: system.id,
          ownerId: adminUser.id,
          organizationId: org.id,
        },
      });

      for (const table of tables) {
        const isHebrew = /[\u0590-\u05FF]/.test(table.name);
        const tableAsset = await prisma.dataAsset.create({
          data: {
            assetType: "table",
            systemName: db.dbName,
            schemaName,
            tableName: table.name,
            hebrewName: isHebrew ? table.name : null,
            description: `Table: ${db.dbName}.${schemaName}.${table.name}`,
            parentId: schema.id,
            ownerId: adminUser.id,
            organizationId: org.id,
          },
        });
        tableCount++;

        // Batch insert columns
        for (const col of table.columns) {
          const colIsHebrew = /[\u0590-\u05FF]/.test(col.name);
          await prisma.dataAsset.create({
            data: {
              assetType: "column",
              systemName: db.dbName,
              schemaName,
              tableName: table.name,
              columnName: col.name,
              dataType: col.dataType,
              hebrewName: colIsHebrew ? col.name : null,
              description: `${col.dataType}${col.nullable ? ", nullable" : ", NOT NULL"}`,
              parentId: tableAsset.id,
              ownerId: adminUser.id,
              organizationId: org.id,
            },
          });
          columnCount++;
        }

        if (tableCount % 20 === 0) {
          process.stdout.write(`  📦 Imported ${tableCount} tables, ${columnCount} columns...\r`);
        }
      }
    }

    console.log(`  ✅ ${db.dbName}: ${db.tables.length} tables imported`);
  }

  console.log(`\n🎉 Import completed!`);
  console.log(`   Systems:  ${allDatabases.length}`);
  console.log(`   Tables:   ${tableCount}`);
  console.log(`   Columns:  ${columnCount}`);
}

main()
  .catch((e) => {
    console.error("❌ Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
