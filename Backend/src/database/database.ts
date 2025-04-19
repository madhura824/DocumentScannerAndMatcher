
import sqlite3 from "sqlite3";
import { Database, open } from "sqlite";
import path from "path";

const DB_PATH = path.join(__dirname, "../../database.sqlite");

export async function connectDB(): Promise<Database> {
    return open({
        filename: DB_PATH,
        driver: sqlite3.Database,
    });
}