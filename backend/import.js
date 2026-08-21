import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { User } from './models.js';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://rishikjariwala54_db_user:QEbRCxRxXRusM1yt@cluster0.mjhqyq0.mongodb.net/jobConnect?retryWrites=true&w=majority";

async function importData() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB successfully.");

        // Seeding default admin
        const adminEmail = "admin@jobconnect.com";
        const adminExists = await User.findOne({ email: adminEmail });
        if (!adminExists) {
            const hashedAdminPassword = await bcrypt.hash("adminpassword", 10);
            await User.create({
                fname: "Platform",
                lname: "Admin",
                jobProfile: "Administrator",
                contactnumber: "0000000000",
                email: adminEmail,
                password: hashedAdminPassword,
                role: "admin",
                skills: ["Management", "Moderation"]
            });
            console.log("Default Admin created: admin@jobconnect.com / adminpassword");
        } else {
            console.log("Admin user already exists.");
        }

        // Seeding CSV data
        let csvPath = path.join(__dirname, '../register database values.csv');
        if (!fs.existsSync(csvPath)) {
            csvPath = path.join(__dirname, 'register database values.csv');
        }

        if (!fs.existsSync(csvPath)) {
            console.log("CSV file not found. Skipping import.");
            mongoose.connection.close();
            process.exit(0);
        }

        const data = fs.readFileSync(csvPath, 'utf8');
        const lines = data.split('\n').filter(line => line.trim() !== '');
        
        console.log(`Checking CSV import data (${lines.length - 1} rows)...`);
        
        // Skip header line
        let importedCount = 0;
        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].match(/(?:\"([^\"]*)\"|([^,]+))/g);
            if (row && row.length >= 6) {
                const cleanRow = row.map(s => s.replace(/^"|"$/g, '').trim());
                const fname = cleanRow[0];
                const lname = cleanRow[1];
                const jobProfile = cleanRow[2];
                const contactnumber = cleanRow[3];
                const email = cleanRow[4];
                const rawPassword = cleanRow[5];

                const userExists = await User.findOne({ email });
                if (!userExists) {
                    const hashedPassword = await bcrypt.hash(rawPassword, 10);
                    await User.create({
                        fname,
                        lname,
                        jobProfile,
                        contactnumber,
                        email,
                        password: hashedPassword,
                        role: "user",
                        skills: ["Web Development", "Software Engineering"] // default skills
                    });
                    importedCount++;
                }
            }
        }
        console.log(`CSV Import complete. Added ${importedCount} new users.`);
    } catch (err) {
        console.error("Import failed:", err);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
}

importData();
