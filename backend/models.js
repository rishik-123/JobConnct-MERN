import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fname: { type: String, default: "" },
  lname: { type: String, default: "" },
  jobProfile: { type: String, default: "" },
  contactnumber: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user", enum: ["user", "admin"] },
  skills: { type: [String], default: [] },
  resumePath: { type: String, default: "" },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  recommendations: [{
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, default: "" },
    recommendedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const AchievementSchema = new mongoose.Schema({
  type: { type: String, default: "" },
  numberofachievements: { type: String, default: "" },
  filepath: { type: String, default: "" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

const HackathonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  theme: { type: String, default: "" },
  date: { type: String, default: "" },
  description: { type: String, default: "" },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

export const User = mongoose.model("User", UserSchema);
export const Achievement = mongoose.model("Achievement", AchievementSchema);
export const Hackathon = mongoose.model("Hackathon", HackathonSchema);
