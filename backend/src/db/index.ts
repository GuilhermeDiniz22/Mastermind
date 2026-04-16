import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { ENV } from "../config/config";

if (!ENV.DB_URL) {
  throw new Error("Database sem string de conexão");
}

const pool = new Pool({ connectionString: ENV.DB_URL });

pool.on('connect', () => {
    console.log("Conexão à database realizada com sucesso! 👌"); 
});

pool.on('error', (error) => {
    console.log("Conexão à database falhou! ❌ erro: ", error ); 
});

export const db = drizzle({client: pool, schema: schema})