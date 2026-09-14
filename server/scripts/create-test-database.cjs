require("dotenv").config({ quiet: true });
const { Client } = require("pg");

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in .env.");
  }

  const developmentUrl = new URL(process.env.DATABASE_URL);
  if (!["localhost", "127.0.0.1"].includes(developmentUrl.hostname)) {
    throw new Error("Refusing to create a test database on a non-local host.");
  }

  const developmentDatabase = developmentUrl.pathname.slice(1);
  const testDatabase = `${developmentDatabase}_test`;
  if (!/^[a-zA-Z0-9_]+$/.test(testDatabase)) {
    throw new Error("The derived test database name contains unsafe characters.");
  }

  const adminUrl = new URL(developmentUrl);
  adminUrl.pathname = "/postgres";
  const client = new Client({ connectionString: adminUrl.toString(), ssl: false });

  await client.connect();
  try {
    const existing = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [testDatabase],
    );

    if (existing.rowCount === 0) {
      await client.query(`CREATE DATABASE "${testDatabase}"`);
      console.log(`Created local ${testDatabase} database.`);
    } else {
      console.log(`Local ${testDatabase} database already exists.`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
