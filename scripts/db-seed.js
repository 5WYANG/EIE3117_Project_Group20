const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

async function run() {
  const seedPath = path.join(__dirname, "..", "src", "db", "seed.sql");
  const seedSql = fs.readFileSync(seedPath, "utf8");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "findit",
    port: Number(process.env.DB_PORT || 3306),
    multipleStatements: true
  });

  try {
    await connection.query(seedSql);
    console.log("Seed data applied successfully.");
  } finally {
    await connection.end();
  }
}

run().catch((error) => {
  const reason = error.sqlMessage || error.message || error.code || String(error);
  console.error("Failed to apply seed:", reason);
  process.exit(1);
});
