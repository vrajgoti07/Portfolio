const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const app = require("./app");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/awdf_db";

// Seed/Guarantee Admin Account: vrajgoti07@gmail.com / 123456789
const seedAdminAccount = async () => {
  try {
    const adminEmail = "vrajgoti07@gmail.com";
    const adminPass = "123456789";
    const hashedPassword = await bcrypt.hash(adminPass, 10);

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = new User({
        name: "Vraj Goti (Admin)",
        email: adminEmail,
        password: hashedPassword,
        role: "admin"
      });
      await admin.save();
      console.log(`[SEED] Admin account (${adminEmail}) successfully created.`);
    } else {
      admin.role = "admin";
      admin.password = hashedPassword;
      if (!admin.name) admin.name = "Vraj Goti (Admin)";
      await admin.save();
      console.log(`[SEED] Admin account (${adminEmail}) verified and role updated to admin.`);
    }
  } catch (err) {
    console.error("[SEED] Error seeding admin account:", err.message);
  }
};

// MongoDB Database Connection with resilient retry strategy
const connectDB = async (retries = 5, delay = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const sanitizedUri = MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
      console.log(`[DB] Connecting to MongoDB (Attempt ${attempt}/${retries}): ${sanitizedUri}`);
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
      console.log("Connected successfully to MongoDB database (awdf_db)");
      await seedAdminAccount();
      return;
    } catch (err) {
      console.warn(`[DB] Attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt < retries) {
        console.log(`[DB] Retrying connection in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // Fallback to local MongoDB if primary was a remote/custom address
  if (!MONGO_URI.includes("127.0.0.1") && !MONGO_URI.includes("localhost")) {
    console.warn("[DB] Primary MongoDB connection failed. Attempting local fallback (mongodb://127.0.0.1:27017/awdf_db)...");
    try {
      await mongoose.connect("mongodb://127.0.0.1:27017/awdf_db", { serverSelectionTimeoutMS: 4000 });
      console.log("Connected successfully to local MongoDB database (awdf_db)");
      await seedAdminAccount();
      return;
    } catch (fallbackErr) {
      console.error("[DB] Local fallback error:", fallbackErr.message);
    }
  }

  console.warn("[DB Notice] Operating with in-memory persistence fallback until MongoDB is reachable.");
};

// Initiate database connection
connectDB();

// Start HTTP Server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = server;