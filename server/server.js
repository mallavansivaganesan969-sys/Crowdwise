import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "CrowdWise backend is running!",
    status: "online"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CrowdWise API is working"
  });
});

app.listen(PORT, () => {
  console.log(`🚍 CrowdWise server running on http://localhost:${PORT}`);
});