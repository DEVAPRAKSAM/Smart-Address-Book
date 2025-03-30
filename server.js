const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ MongoDB Connection with Detailed Logs
mongoose.connect("mongodb://localhost:27017/smart-address-book", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Stop server if DB fails
  });

// ✅ Define Address Schema & Model
const addressSchema = new mongoose.Schema({
  addressLine1: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, default: "India" },
  pinCode: { type: String, required: true }
});

const Address = mongoose.model("Address", addressSchema);

// ✅ Get All Addresses with Better Error Handling
app.get("/api/addresses", async (req, res) => {
  try {
    const addresses = await Address.find();
    res.json(addresses);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch addresses", details: err.message });
  }
});

// ✅ Add a New Address with Validation
app.post("/api/addresses", async (req, res) => {
  try {
    console.log("📨 Received Data:", req.body);
    if (!req.body.addressLine1 || !req.body.city || !req.body.state || !req.body.pinCode) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const newAddress = new Address(req.body);
    await newAddress.save();
    res.json(newAddress);
  } catch (err) {
    console.error("❌ Save Error:", err);
    res.status(500).json({ error: "Failed to save address", details: err.message });
  }
});

// ✅ Get City & State from PIN Code
app.get("/api/pincode/:pin", async (req, res) => {
  try {
    const pinCodeData = {
      "600001": { city: "Chennai", state: "Tamil Nadu" },
      "110001": { city: "New Delhi", state: "Delhi" },
      "400001": { city: "Mumbai", state: "Maharashtra" }
    };

    const pinDetails = pinCodeData[req.params.pin];
    if (pinDetails) {
      res.json(pinDetails);
    } else {
      res.status(404).json({ error: "Invalid PIN Code" });
    }
  } catch (err) {
    console.error("❌ PIN Code Fetch Error:", err);
    res.status(500).json({ error: "Error fetching PIN Code details", details: err.message });
  }
});

// ✅ Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
