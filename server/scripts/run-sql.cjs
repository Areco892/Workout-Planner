const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config({ quiet: true });
const { Client } = require("pg");

async function main() {
  const sqlPath = process.argv[2];

  if (!sqlPath) {
    throw new Error("Provide a SQL file path to execute.");
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and update it.");
  }

  const absolutePath = path.resolve(process.cwd(), sqlPath);
  const sql = fs.readFileSync(absolutePath, "utf8");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "true"
      ? { rejectUnauthorized: false }
      : undefined,
  });

  await client.connect();

  try {
    await client.query(sql);
    console.log(`Applied ${path.relative(process.cwd(), absolutePath)}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
