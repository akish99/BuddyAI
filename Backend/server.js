// import express from "express";
// import "dotenv/config";
// import cors from "cors";
// import mongoose from "mongoose";
// import chatRoutes from "./routes/chat.js";

// const app = express();
// const PORT = 8080;

// app.use(express.json());
// app.use(cors());

// app.use("/api", chatRoutes);

// app.listen(PORT, () => {
//     console.log(`server running on ${PORT}`);
//     connectDB();
// });

// const connectDB = async() => {
//     try {
//         await mongoose.connect(process.env.MONGODB_URL);
//         console.log("Connected with Database!");
//     } catch(err) {
//         console.log("Failed to connect with Db", err);
//     }
// }





// import express from "express";
// import "dotenv/config";
// import cors from "cors";
// import mongoose from "mongoose";
// import chatRoutes from "./routes/chat.js";
// import authRoutes from "./routes/auth.js"; //  added

// const app = express();
// const PORT = process.env.PORT || 8080;

// // Middleware
// app.use(express.json());
// app.use(cors());

// // Routes
// app.use("/api/auth", authRoutes); //  login + signup
// app.use("/api", chatRoutes);      // existing chat routes

// // Start server
// app.listen(PORT, async () => {
//   console.log(` Server running on port ${PORT}`);
//   await connectDB();
// });

// // DB Connection
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URL, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log(" Connected with Database!");
//   } catch (err) {
//     console.error(" Failed to connect with DB:", err);
//   }
// };





import express from "express";
import "dotenv/config";
import cors from "cors";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";
import supabase from "./utils/supabase.js";

const app = express();
const PORT = process.env.PORT || 8099;

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);

app.get("/api/ping", (req, res) => {
  res.json({ status: "ok", service: "backend" });
});

app.get("/api/health", async (req, res) => {
  const checks = {
    supabase: false,
    usersTable: false,
    threadsTable: false,
    geminiKey: Boolean(process.env.GEMINI_API_KEY),
    jwtSecret: Boolean(process.env.JWT_SECRET)
  };

  try {
    checks.supabase = true;

    const healthCheck = Promise.all([
      supabase.from("users").select("id").limit(1),
      supabase.from("threads").select("id").limit(1)
    ]);
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Supabase health check timed out")), 12000)
    );
    const [users, threads] = await Promise.race([healthCheck, timeout]);

    checks.usersTable = !users.error;
    checks.threadsTable = !threads.error;

    const healthy = Object.values(checks).every(Boolean);
    res.status(healthy ? 200 : 503).json({
      status: healthy ? "ok" : "failed",
      checks,
      errors: {
        usersTable: users.error?.message || null,
        threadsTable: threads.error?.message || null
      }
    });
  } catch (error) {
    res.status(503).json({
      status: "failed",
      checks,
      errors: { supabase: error.message }
    });
  }
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error(`Backend failed to listen on port ${PORT}:`, error.message);
  process.exitCode = 1;
});