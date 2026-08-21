import express from "express";
import path from "path";
import bodyParser from "body-parser";
import multer from "multer";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import Stripe from "stripe";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { User, Achievement, Hackathon } from "./models.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock");
const JWT_SECRET = process.env.JWT_SECRET || "jobconnect-secret-key-12345";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://rishikjariwala54_db_user:QEbRCxRxXRusM1yt@cluster0.mjhqyq0.mongodb.net/jobConnect?retryWrites=true&w=majority";

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auto-create uploads folder
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// Connect to MongoDB Atlas
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
})
  .then(() => console.log("Database connected to MongoDB Atlas via Mongoose!"))
  .catch(err => console.error("MongoDB Atlas Connection Error:", err));

// ---------------- MIDDLEWARE & SECURITY ----------------
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// DB Connection Check Middleware
app.use((req, res, next) => {
  if (req.path.startsWith("/api/") && mongoose.connection.readyState !== 1) {
    console.error("Database connection not ready. Current readyState:", mongoose.connection.readyState);
    return res.status(503).json({
      error: "Database is connecting or unreachable. Please ensure 0.0.0.0/0 is added to MongoDB Atlas Network Access whitelist and MONGODB_URI is set on Render."
    });
  }
  next();
});

// Rate Limiting to prevent brute force / DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// ---------------- MULTER CONFIG ----------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage: storage });

// ---------------- AUTHENTICATION MIDDLEWARES ----------------
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token." });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Forbidden. Admin access only." });
  }
};

// ---------------- REGISTER ROUTE ----------------
app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      clientnamefirst,
      clientnamelast,
      JobProfile,
      contactno,
      exampleInputEmail1,
      exampleInputPassword1
    } = req.body;

    if (!exampleInputEmail1 || !exampleInputPassword1) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const emailNormalized = exampleInputEmail1.toLowerCase().trim();

    const existingUser = await User.findOne({ email: emailNormalized });
    if (existingUser) {
      return res.status(400).json({ error: "That email address is already registered." });
    }

    const hashedPassword = await bcrypt.hash(exampleInputPassword1, 10);

    const newUser = await User.create({
      fname: clientnamefirst,
      lname: clientnamelast,
      jobProfile: JobProfile || "Student",
      contactnumber: contactno || "",
      email: emailNormalized,
      password: hashedPassword,
      role: "user"
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        fname: newUser.fname,
        lname: newUser.lname,
        email: newUser.email,
        jobProfile: newUser.jobProfile,
        role: newUser.role,
        skills: newUser.skills,
        resumePath: newUser.resumePath
      }
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Error during registration: " + err.message });
  }
});

// ---------------- LOGIN ROUTE ----------------
app.post("/api/auth/login", async (req, res) => {
  try {
    const { exampleInputEmail1, exampleInputPassword1 } = req.body;

    if (!exampleInputEmail1 || !exampleInputPassword1) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const emailNormalized = exampleInputEmail1.toLowerCase().trim();
    const user = await User.findOne({ email: emailNormalized });

    if (!user) {
      return res.status(404).json({ error: "User not found. Please register first." });
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(exampleInputPassword1, user.password);
    } catch (e) {
      isMatch = false;
    }

    if (!isMatch && exampleInputPassword1 === user.password) {
      const newHash = await bcrypt.hash(exampleInputPassword1, 10);
      user.password = newHash;
      await user.save();
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect password." });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        jobProfile: user.jobProfile,
        role: user.role,
        skills: user.skills,
        resumePath: user.resumePath
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Error during login: " + err.message });
  }
});

// ---------------- GET USER PROFILE (ME) ----------------
app.get("/api/auth/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").populate("connections", "fname lname email jobProfile");
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- NETWORK (PEERS) ROUTES ----------------
app.get("/api/network", auth, async (req, res) => {
  try {
    const peers = await User.find({ _id: { $ne: req.user.id } })
      .select("-password")
      .sort({ fname: 1 });
    res.json(peers);
  } catch (err) {
    console.error("Fetch Network Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/network/connect", auth, async (req, res) => {
  try {
    const { peerId } = req.body;
    if (!peerId) {
      return res.status(400).json({ error: "Peer ID is required." });
    }

    if (peerId === req.user.id) {
      return res.status(400).json({ error: "You cannot connect with yourself." });
    }

    const [user, peer] = await Promise.all([
      User.findById(req.user.id),
      User.findById(peerId)
    ]);

    if (!user || !peer) {
      return res.status(404).json({ error: "User or Peer not found." });
    }

    if (user.connections.includes(peerId)) {
      return res.status(400).json({ error: "Already connected with this user." });
    }

    user.connections.push(peerId);
    peer.connections.push(req.user.id);

    await Promise.all([user.save(), peer.save()]);

    res.json({ message: `Successfully connected with ${peer.fname} ${peer.lname}` });
  } catch (err) {
    console.error("Connect Peer Error:", err);
    res.status(500).json({ error: "Error connecting with peer." });
  }
});

// ---------------- RESUME UPLOAD ----------------
app.post("/api/resumes/upload", auth, upload.single("resume"), async (req, res) => {
  try {
    const { skills } = req.body;
    const fileName = req.file ? req.file.filename : null;

    if (!fileName) {
      return res.status(400).json({ error: "No resume file uploaded." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    user.resumePath = fileName;
    
    if (skills) {
      const skillsArray = skills
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);
      user.skills = skillsArray;
    }

    await user.save();
    res.json({
      message: "Resume uploaded successfully!",
      user: {
        id: user._id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        jobProfile: user.jobProfile,
        role: user.role,
        skills: user.skills,
        resumePath: user.resumePath
      }
    });
  } catch (err) {
    console.error("Resume Upload Error:", err);
    res.status(500).json({ error: "Error uploading resume." });
  }
});

// ---------------- ACHIEVEMENTS UPLOAD ----------------
app.get("/api/achievements", auth, async (req, res) => {
  try {
    const achievements = await Achievement.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(achievements);
  } catch (err) {
    res.status(500).json({ error: "Error loading achievements." });
  }
});

app.post("/api/achievements", auth, upload.single("resume"), async (req, res) => {
  try {
    const { type, numberofachievements } = req.body;
    const fileName = req.file ? req.file.filename : null;

    if (!type) {
      return res.status(400).json({ error: "Achievement type is required." });
    }

    const achievement = await Achievement.create({
      type,
      numberofachievements: numberofachievements || "1",
      filepath: fileName || "",
      user: req.user.id
    });

    console.log("Achievement saved!");
    res.status(201).json(achievement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error saving achievement." });
  }
});

// ---------------- HACKATHON ROUTES ----------------
app.get("/api/hackathons", async (req, res) => {
  try {
    const hackathons = await Hackathon.find().sort({ date: 1 });
    res.json(hackathons);
  } catch (err) {
    res.status(500).json({ error: "Error loading hackathons." });
  }
});

app.post("/api/hackathons", auth, adminOnly, async (req, res) => {
  try {
    const { title, theme, date, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Hackathon title is required." });
    }

    const hackathon = await Hackathon.create({
      title,
      theme: theme || "General Coding",
      date: date || "TBD",
      description: description || ""
    });

    res.status(201).json(hackathon);
  } catch (err) {
    res.status(500).json({ error: "Error creating hackathon." });
  }
});

app.post("/api/hackathons/apply", auth, async (req, res) => {
  try {
    const { hackathonId } = req.body;
    if (!hackathonId) {
      return res.status(400).json({ error: "Hackathon ID is required." });
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ error: "Hackathon not found." });
    }

    if (hackathon.applicants.includes(req.user.id)) {
      return res.status(400).json({ error: "You have already applied to this hackathon." });
    }

    hackathon.applicants.push(req.user.id);
    await hackathon.save();

    res.json({ message: "Registration successful!" });
  } catch (err) {
    res.status(500).json({ error: "Error applying to hackathon." });
  }
});

// ---------------- ADMIN PANEL ROUTES ----------------
app.get("/api/admin/users", auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error listing users." });
  }
});

app.post("/api/admin/recommend-job", auth, adminOnly, async (req, res) => {
  try {
    const { userId, title, company, description } = req.body;
    if (!userId || !title || !company) {
      return res.status(400).json({ error: "User ID, job title, and company name are required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.recommendations.push({
      title,
      company,
      description: description || ""
    });

    await user.save();
    res.json({ message: "Opportunity matched and sent to user successfully!" });
  } catch (err) {
    console.error("Match Opportunity Error:", err);
    res.status(500).json({ error: "Error sending job recommendation." });
  }
});

// ---------------- STRIPE PAYMENT GATEWAY ----------------
app.post("/api/create-checkout-session", auth, async (req, res) => {
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
      cancel_url: `${req.headers.origin}/fail.html`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------- STATIC FILES & DEPLOYMENT SERVING ----------------
app.use("/uploads", express.static(uploadPath));

const clientDistPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(clientDistPath));

app.get("*any", (req, res) => {
  const indexHtmlPath = path.join(clientDistPath, "index.html");
  if (fs.existsSync(indexHtmlPath)) {
    res.sendFile(indexHtmlPath);
  } else {
    res.status(404).send("Frontend assets not built yet. Run 'npm run build' inside frontend directory.");
  }
});

// ---------------- SERVER START ----------------
app.listen(port, () => {
  console.log("Server running on port " + port);
});
