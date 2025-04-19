import fs from "fs"
import path from "path";
import { connectDB } from "./database";

async function initializeDB() {
    const db = await connectDB();
    const migrationsDir = path.join(__dirname, "migrations");

    const files = fs.readdirSync(migrationsDir).sort(); 
    for (const file of files) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
        console.log(`Running migration: ${file}`);
        await db.exec(sql);
    }

    console.log("Database initialized successfully.");
    await db.close();
}


initializeDB().catch(console.error);
