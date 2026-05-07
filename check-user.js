const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query("SELECT email, role, password FROM users WHERE email = 'admin@extintor.pro'")
  .then(r => { 
    console.log(r.rows); 
    pool.end(); 
  })
  .catch(e => console.error(e));