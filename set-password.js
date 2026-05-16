const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const hash = await bcrypt.hash('cliente1234', 10);
  const result = await pool.query(
    "UPDATE users SET password = $1 WHERE email = 'juan@aceros.cl' RETURNING email, role",
    [hash]
  );
  console.log('Actualizado:', result.rows);
  await pool.end();
}

main().catch(console.error);