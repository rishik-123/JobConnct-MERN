import express from "express";
import path from "path";
import pg from "pg";
import bodyParser from "body-parser";
import multer from "multer";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auto-create uploads folder
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// ---------------- MIDDLEWARE ----------------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// ---------------- MULTER ----------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage: storage });

// ---------------- POSTGRESQL CONNECTION ----------------
const db = process.env.DATABASE_URL
  ? new pg.Client({ connectionString: process.env.DATABASE_URL })
  : new pg.Client({
      host: process.env.PGHOST || "localhost",
      user: process.env.PGUSER || "postgres",
      database: process.env.PGDATABASE || "jobLogin",
      password: process.env.PGPASSWORD || "rishik@12345",
      port: process.env.PGPORT || 5432,
    });

db.connect()
  .then(async () => {
    console.log("Connected to PostgreSQL");
    try {
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
      await db.query(`
        CREATE TABLE IF NOT EXISTS achieve (
          id SERIAL PRIMARY KEY,
          type VARCHAR(255),
          numberofachievements VARCHAR(255),
          filepath VARCHAR(255)
        );
      `);
      console.log("Database tables verified!");
    } catch (err) {
      console.error("Error creating tables:", err);
    }
  })
  .catch(err => console.error("DB Error:", err));

// ---------------- HOME ----------------
app.get("/", (req, res) => {
  res.redirect(`${FRONTEND_URL}/index.html`);
});

// ---------------- REGISTER ----------------
app.post("/register", async (req, res) => {
  try {
    const {
      clientnamefirst,
      clientnamelast,
      JobProfile,
      contactno,
      exampleInputEmail1,
      exampleInputPassword1
    } = req.body;

    await db.query(
      "INSERT INTO register (fname, lname, jobProfile, contactnumber, email, password) VALUES ($1,$2,$3,$4,$5,$6)",
      [
        clientnamefirst,
        clientnamelast,
        JobProfile,
        contactno,
        exampleInputEmail1,
        exampleInputPassword1
      ]
    );

    console.log("Registration success!");
    res.redirect(`${FRONTEND_URL}/index.html`);
  } catch (err) {
    console.error(err);
    res.send("Error during registration");
  }
});

// ---------------- LOGIN ----------------
app.post("/login", async (req, res) => {
  try {
    const email = req.body.exampleInputEmail1;
    const password = req.body.exampleInputPassword1;

    const result = await db.query(
      "SELECT * FROM register WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.send("User not found. Please register first.");
    }

    const user = result.rows[0];

    if (password === user.password) {
      return res.redirect(`${FRONTEND_URL}/index.html`);
    } else {
      return res.send("Incorrect password.");
    }

  } catch (err) {
    console.error(err);
    res.send("Error during login.");
  }
});

// ---------------- NETWORK ----------------
app.get("/network", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM register;");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ---------------- ACHIEVEMENTS UPLOAD ----------------
app.post("/achievements", upload.single("resume"), async (req, res) => {
  try {
    const { type, numberofachievements } = req.body;
    const fileName = req.file ? req.file.filename : null;

    await db.query(
      "INSERT INTO achieve (type, numberofachievements, filepath) VALUES ($1, $2, $3)",
      [type, numberofachievements, fileName]
    );

    console.log("Achievement saved!");
    return res.redirect(`${FRONTEND_URL}/index.html`);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving achievement");
  }
});

// ========================= STRIPE PAYMENT GATEWAY =========================

// Create Stripe Checkout Session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { plan } = req.body;
    let name = "Pro Subscription";
    let unit_amount = 24900; // ₹249

    if (plan === "premium") {
      name = "Premium Annual Subscription";
      unit_amount = 199900; // ₹1999
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: name },
            unit_amount: unit_amount,
          },
          quantity: 1,
        },
      ],

      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/cancel.html`,
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ========================= SERVER START =========================

app.listen(port, () => {
  console.log("Server running on port " + port);
});
