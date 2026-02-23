import "dotenv/config";
import fs from "fs";
import path from "path";
import pg from "pg";

const ORG_SLUG = "glb";
const SQL_DIR = path.resolve("./raw_sql_dumps/glb");
const SQL_FILES = ["1.sql", "2.sql", "3.sql"];

const DATABASE_RE = /CREATE\s+DATABASE\s+\[([^\]]+)\]/i;
const TABLE_RE = /CREATE\s+TABLE\s+\[dbo\]\.\[([^\]]+)\]\s*\(/i;
const COLUMN_RE = /^\s*\[([^\]]+)\]\s+\[([^\]]+)\]/;
const STOP_RE = /CONSTRAINT|^\s*\)\s*ON\s+\[PRIMARY\]/i;

interface ParsedTable {
  name: string;
  columns: { name: string; dataType: string }[];
}

interface ParsedDatabase {
  name: string;
  tables: ParsedTable[];
}

function parseSqlFile(filePath: string): ParsedDatabase {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  let dbName = "Unknown";
  const tables: ParsedTable[] = [];

  const dbMatch = content.match(DATABASE_RE);
  if (dbMatch) dbName = dbMatch[1];

  let currentTable: ParsedTable | null = null;
  let insideTable = false;

  for (const line of lines) {
    const tableMatch = line.match(TABLE_RE);
    if (tableMatch) {
      if (currentTable) tables.push(currentTable);
      currentTable = { name: tableMatch[1], columns: [] };
      insideTable = true;
      continue;
    }

    if (insideTable && currentTable) {
      if (STOP_RE.test(line)) {
        tables.push(currentTable);
        currentTable = null;
        insideTable = false;
        continue;
      }

      const colMatch = line.match(COLUMN_RE);
      if (colMatch) {
        currentTable.columns.push({
          name: colMatch[1],
          dataType: colMatch[2],
        });
      }
    }
  }

  if (currentTable) tables.push(currentTable);

  return { name: dbName, tables };
}

async function main() {
  const connectionString =
    process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("No DATABASE_URL or DIRECT_URL found in environment");
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString });

  try {
    const orgResult = await pool.query(
      "SELECT id FROM organizations WHERE slug = $1",
      [ORG_SLUG]
    );

    if (orgResult.rows.length === 0) {
      console.log(`Organization '${ORG_SLUG}' not found. Creating it...`);
      const insertResult = await pool.query(
        `INSERT INTO organizations (id, slug, name, domain_mappings, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, now())
         RETURNING id`,
        [ORG_SLUG, "GLB Organization", ["glb.org.il"]]
      );
      var orgId = insertResult.rows[0].id as string;
      console.log(`Created organization '${ORG_SLUG}' with ID: ${orgId}`);
    } else {
      var orgId = orgResult.rows[0].id as string;
      console.log(
        `Found organization '${ORG_SLUG}' with ID: ${orgId}`
      );
    }

    let totalTables = 0;
    let totalColumns = 0;

    for (const file of SQL_FILES) {
      const filePath = path.join(SQL_DIR, file);
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}, skipping`);
        continue;
      }

      console.log(`\nParsing ${file}...`);
      const db = parseSqlFile(filePath);
      console.log(
        `  Database: ${db.name} | Tables: ${db.tables.length}`
      );

      const systemAsset = await upsertAsset(pool, {
        organizationId: orgId,
        assetType: "system",
        systemName: db.name,
        schemaName: null,
        tableName: null,
        columnName: null,
        dataType: null,
        parentId: null,
      });
      console.log(`  System asset: ${systemAsset.id}`);

      for (const table of db.tables) {
        const tableAsset = await upsertAsset(pool, {
          organizationId: orgId,
          assetType: "table",
          systemName: db.name,
          schemaName: "dbo",
          tableName: table.name,
          columnName: null,
          dataType: null,
          parentId: systemAsset.id,
        });
        totalTables++;

        for (const col of table.columns) {
          await upsertAsset(pool, {
            organizationId: orgId,
            assetType: "column",
            systemName: db.name,
            schemaName: "dbo",
            tableName: table.name,
            columnName: col.name,
            dataType: col.dataType,
            parentId: tableAsset.id,
          });
          totalColumns++;
        }
      }
    }

    console.log(
      `\nDone! Imported ${totalTables} tables and ${totalColumns} columns.`
    );
  } finally {
    await pool.end();
  }
}

interface AssetInput {
  organizationId: string;
  assetType: string;
  systemName: string;
  schemaName: string | null;
  tableName: string | null;
  columnName: string | null;
  dataType: string | null;
  parentId: string | null;
}

async function upsertAsset(
  pool: pg.Pool,
  input: AssetInput
): Promise<{ id: string }> {
  const result = await pool.query(
    `INSERT INTO data_assets (
       id, asset_type, system_name, schema_name, table_name, column_name,
       data_type, parent_id, organization_id, created_at, updated_at
     )
     VALUES (
       gen_random_uuid(), $1, $2, $3, $4, $5,
       $6, $7, $8, now(), now()
     )
     ON CONFLICT (organization_id, system_name, schema_name, table_name, column_name)
     DO UPDATE SET
       data_type = COALESCE(EXCLUDED.data_type, data_assets.data_type),
       parent_id = COALESCE(EXCLUDED.parent_id, data_assets.parent_id),
       updated_at = now()
     RETURNING id`,
    [
      input.assetType,
      input.systemName,
      input.schemaName,
      input.tableName,
      input.columnName,
      input.dataType,
      input.parentId,
      input.organizationId,
    ]
  );

  return { id: result.rows[0].id };
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
