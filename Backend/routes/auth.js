import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import supabase from "../utils/supabase.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from the environment");
}

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const { data: existing, error: findError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (findError) throw findError;
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({ name, email, password: hashed })
      .select("id")
      .single();

    if (insertError) throw insertError;

    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, {
      expiresIn: "2h"
    });
    res.status(201).json({ message: "Signup successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const { data: user, error: findError } = await supabase
      .from("users")
      .select("id, password")
      .eq("email", email)
      .maybeSingle();

    if (findError) throw findError;
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // generate token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "2h" });
    res.json({ token, message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

export default router;
