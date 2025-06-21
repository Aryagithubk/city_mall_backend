// backend/src/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middleware - CORS should be first
app.use(cors({ origin: "*" }));

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// Routes
app.use("/api/disasters", require("./routes/disasters"));
app.use("/api/disasters", require("./routes/socialMedia"));
app.use("/api/disasters", require("./routes/resources"));
app.use("/api/disasters", require("./routes/updates"));
app.use("/api/disasters", require("./routes/verification"));
app.use("/api/geocode", require("./routes/geocoding"));

// Mock social media endpoint
app.get("/api/mock-social-media", (req, res) => {
  const mockData = [
    {
      id: 1,
      post: "#floodrelief Need food in NYC",
      user: "citizen1",
      timestamp: new Date(),
    },
    {
      id: 2,
      post: "Shelter available at 5th Avenue #help",
      user: "reliefOrg",
      timestamp: new Date(),
    },
    {
      id: 3,
      post: "Medical supplies urgently needed #urgent",
      user: "citizen2",
      timestamp: new Date(),
    },
  ];
  res.json(mockData);
});

// Error handling
app.use(errorHandler);

module.exports = app;
