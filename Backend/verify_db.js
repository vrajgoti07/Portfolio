const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/awdf_db";

async function verifyDatabase() {
  console.log("Connecting to MongoDB...");
  try {
    try {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 4000 });
      console.log("✓ Connected to MongoDB via primary MONGO_URI.");
    } catch (primaryErr) {
      console.log(`Primary connection note (${primaryErr.message}). Connecting to local MongoDB awdf_db...`);
      await mongoose.connect("mongodb://127.0.0.1:27017/awdf_db", { serverSelectionTimeoutMS: 4000 });
      console.log("✓ Connected to local MongoDB awdf_db.");
    }

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections in database:", collections.map((c) => c.name).join(", "));

    // Check users collection
    const usersCollection = db.collection("users");
    const userCount = await usersCollection.countDocuments();
    const users = await usersCollection.find().sort({ createdAt: -1 }).limit(5).toArray();
    console.log(`\nFound ${userCount} total user(s) in 'users' collection.`);
    users.forEach((u, i) => {
      const isBcrypt = u.password && (u.password.startsWith("$2a$") || u.password.startsWith("$2b$"));
      console.log(`[User ${i + 1}] Email: ${u.email}`);
      console.log(`         Password Hash: ${u.password.substring(0, 20)}... (Length: ${u.password.length})`);
      console.log(`         Is Valid Bcrypt Hash: ${isBcrypt ? "YES (Bcrypt $2b$/$2a$)" : "NO (ERROR: Plaintext)"}`);
    });

    // Check tasks collection
    const tasksCollection = db.collection("tasks");
    const taskCount = await tasksCollection.countDocuments();
    const tasks = await tasksCollection.find().sort({ createdAt: -1 }).limit(3).toArray();
    console.log(`\nFound ${taskCount} total task(s) in 'tasks' collection.`);
    tasks.forEach((t, i) => {
      console.log(`[Task ${i + 1}] Title: "${t.title}" | Status: ${t.status} | Completed: ${t.completed}`);
    });

    await mongoose.disconnect();
    console.log("\n✓ Database verification complete.");
  } catch (err) {
    console.error("Database verification failed:", err.message);
  }
}

verifyDatabase();
