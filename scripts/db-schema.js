const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

async function run() {
  const schemaPath = path.join(__dirname, "..", "src", "db", "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    port: Number(process.env.DB_PORT || 3306),
    multipleStatements: true
  });

  try {
    await connection.query(schemaSql);
    console.log("Schema applied successfully.");
  } finally {
    await connection.end();
  }
}

run().catch((error) => {
  const reason = error.sqlMessage || error.message || error.code || String(error);
  console.error("Failed to apply schema:", reason);
  process.exit(1);
});
