const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const User = require("./models/User");
const app = require("./app");

const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = "0.0.0.0";
const MONGO_URI = process.env.MONGO_URI;

const sanitizeUri = (uri) => {
  if (!uri) return "";
  return uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
};

// Secure Environment-Based Admin Account Initialization
const seedAdminAccount = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim().toLowerCase() : null;
    const adminPass = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME ? process.env.ADMIN_NAME.trim() : "System Administrator";

    if (!adminEmail || !adminPass) {
      console.log("[ADMIN INIT] No ADMIN_EMAIL and ADMIN_PASSWORD configured. Skipping admin initialization.");
      return;
    }

    if (adminPass.length < 6) {
      console.warn("[ADMIN INIT] Warning: ADMIN_PASSWORD should be at least 6 characters.");
    }

    const hashedPassword = await bcrypt.hash(adminPass, 10);

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = new User({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "admin"
      });
      await admin.save();
      console.log(`[ADMIN INIT] Administrator account (${adminEmail}) successfully initialized from environment.`);
    } else {
      admin.role = "admin";
      admin.password = hashedPassword;
      if (adminName && (!admin.name || admin.name === "System Administrator")) {
        admin.name = adminName;
      }
      await admin.save();
      console.log(`[ADMIN INIT] Administrator account (${adminEmail}) successfully updated with admin role.`);
    }
  } catch (err) {
    console.error("[ADMIN INIT] Error during environment-based admin initialization:", err.message);
  }
};

// MongoDB Database Connection with explicit failure handling
const connectDB = async (retries = 5, delay = 3000) => {
  if (!MONGO_URI) {
    throw new Error("[DB FATAL] MONGO_URI environment variable is required.");
  }

  const sanitizedUri = sanitizeUri(MONGO_URI);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[DB] Connecting to MongoDB (Attempt ${attempt}/${retries}): ${sanitizedUri}`);
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
      console.log("Connected successfully to MongoDB database");
      await seedAdminAccount();
      return;
    } catch (err) {
      const sanitizedMsg = sanitizeUri(err.message);
      console.warn(`[DB] Attempt ${attempt}/${retries} failed: ${sanitizedMsg}`);
      if (attempt < retries) {
        console.log(`[DB] Retrying connection in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`[DB FATAL] Could not connect to MongoDB at ${sanitizedUri} after ${retries} attempts. In-memory fallback is disabled.`);
};

// Start Express Server listening on process.env.PORT and host 0.0.0.0
let server;

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
    });
    return server;
  } catch (err) {
    console.error("[FATAL] Server startup failed:", err.message);
    process.exit(1);
  }
};

startServer();

module.exports = server;
