import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const pool = new Pool({
    host: PGHOST || "",
    database: PGDATABASE || "",
    user: PGUSER || "",
    password: decodeURIComponent(PGPASSWORD || ""),
    port: 5432,
    ssl: { rejectUnauthorized: true },
});

export default pool;
