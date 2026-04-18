import express from "express";
import multer from "multer";
import fs from "fs";
import { publishToTikTok } from "./tiktok.js";

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/publish", upload.single("video"), async (req, res) => {
  try {
    const description = req.body.description || "";
    const videoPath = req.file.path;

    const result = await publishToTikTok(videoPath, description);

    fs.unlinkSync(videoPath);

    res.json({ status: "ok", result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.listen(3000, () => console.log("TikTok microservice running on port 3000"));
