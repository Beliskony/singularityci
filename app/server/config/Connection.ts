// ============ server/config/Connection.ts ============
import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import { Database } from "./types";

const dialect = new MysqlDialect({
  pool: createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
  }),
});

export const db = new Kysely<Database>({ dialect });