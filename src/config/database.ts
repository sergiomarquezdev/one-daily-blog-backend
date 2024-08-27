import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
PGPASSWORD = decodeURIComponent(PGPASSWORD || "");

export const pool = new Pool({
    host: PGHOST || "",
    database: PGDATABASE || "",
    user: PGUSER || "",
    password: PGPASSWORD,
    port: 5432,
    ssl: { rejectUnauthorized: true },
});
