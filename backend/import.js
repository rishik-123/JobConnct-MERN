import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function importData() {
    if (!process.env.DATABASE_URL) {
        console.log("No DATABASE_URL found. Skipping import.");
        return;
    }

    try {
        await db.connect();
        
        // Wait for table to be created if not exists
        await db.query(`
            CREATE TABLE IF NOT EXISTS register (
              id SERIAL PRIMARY KEY,
              fname VARCHAR(255),
              lname VARCHAR(255),
              jobProfile VARCHAR(255),
              contactnumber VARCHAR(255),
              email VARCHAR(255) UNIQUE,
              password VARCHAR(255)
            );
        `);

        // Resolve path to CSV (could be in current dir or parent dir depending on Render root setup)
        let csvPath = path.join(__dirname, '../register database values.csv');
        if (!fs.existsSync(csvPath)) {
            csvPath = path.join(__dirname, 'register database values.csv');
        }

        if (!fs.existsSync(csvPath)) {
            console.log("CSV not found. Skipping import.");
            process.exit(0);
        }

        const data = fs.readFileSync(csvPath, 'utf8');
        const lines = data.split('\n').filter(line => line.trim() !== '');
        
        const check = await db.query('SELECT COUNT(*) FROM register');
        if (parseInt(check.rows[0].count) > 0) {
            console.log("Database already has data. Skipping import.");
            process.exit(0);
        }

        console.log(`Importing ${lines.length - 1} rows...`);
        
        // Skip header
        for (let i = 1; i < lines.length; i++) {
            // Regex to handle CSV splitting accurately
            const row = lines[i].match(/(?:\"([^\"]*)\"|([^,]+))/g);
            if (row && row.length >= 6) {
                const cleanRow = row.map(s => s.replace(/^"|"$/g, '').trim());
                await db.query(
                    "INSERT INTO register (fname, lname, jobProfile, contactnumber, email, password) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (email) DO NOTHING",
                    [cleanRow[0], cleanRow[1], cleanRow[2], cleanRow[3], cleanRow[4], cleanRow[5]]
                );
            }
        }
        console.log("CSV Import complete!");
    } catch (err) {
        console.error("Import failed:", err);
    } finally {
        await db.end();
        process.exit(0);
    }
}

importData();
