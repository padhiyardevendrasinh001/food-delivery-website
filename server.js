const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ------------------ MongoDB ------------------
mongoose.connect("mongodb://Devendra:9328872137@ac-xqlnksn-shard-00-00.4eoeyhy.mongodb.net:27017,ac-xqlnksn-shard-00-01.4eoeyhy.mongodb.net:27017,ac-xqlnksn-shard-00-02.4eoeyhy.mongodb.net:27017/?ssl=true&replicaSet=atlas-sopolc-shard-0&authSource=admin&appName=kings_platter")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// ------------------ Models ------------------

// User Model
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", userSchema);

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Contact = mongoose.model("Contact", contactSchema);

// ------------------ Routes ------------------

// Test Route
app.get("/", (req, res) => {
  res.send("API Working 🚀");
});
app.post("/orders", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.json(newOrder);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// ------------------ AUTH ------------------

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ message: "All fields required" });
    }

    const exist = await User.findOne({ email });
    if (exist) return res.json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashed });
    await user.save();

    res.json({ message: "Registered successfully" });

  } catch (err) {
    console.log("❌ REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ message: "All fields required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ message: "Wrong password" });

    res.json({ message: "Login successful" });

  } catch (err) {
    console.log("❌ LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ OTP RESET PASSWORD ------------------

let otpStore = {}; // { email: otp }

// SEND OTP
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "User not found" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Store OTP
    otpStore[email] = otp;

    // Show OTP in terminal
    console.log("🔐 OTP for", email, ":", otp);

    res.json({ message: "OTP sent" });

  } catch (err) {
    console.log("❌ OTP ERROR:", err);
    res.status(500).json({ message: "Error sending OTP" });
  }
});

// VERIFY OTP + RESET PASSWORD
app.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.json({ message: "All fields required" });
    }

    // Check OTP
    if (otpStore[email] != otp) {
      return res.json({ message: "Invalid OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "User not found" });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;

    await user.save();

    // Remove OTP after use
    delete otpStore[email];

    res.json({ message: "Password updated" });

  } catch (err) {
    console.log("❌ RESET ERROR:", err);
    res.status(500).json({ message: "Error resetting password" });
  }
});

//order
const orderSchema = new mongoose.Schema({
  orderId: String,
  customerName: String,
  phone: String,
  address: String,
  items: Array,
  totalAmount: Number,
  status: {
    type: String,
    default: "Pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model("Order", orderSchema);

//contact 
app.post("/contacts", async (req, res) => {
  try {
    console.log("📩 Incoming data:", req.body); // 👈 ADD THIS

    const newMsg = new Contact(req.body);
    await newMsg.save();

    console.log("✅ Saved to DB"); // 👈 ADD THIS

    res.json({ message: "Saved successfully" });

  } catch (error) {
    console.log("❌ ERROR:", error); // 👈 ADD THIS
    res.status(500).json({ error: error.message });
  }
});
// ------------------ Server ------------------

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});