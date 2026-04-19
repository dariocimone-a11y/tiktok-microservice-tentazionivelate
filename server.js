import express from "express";
import multer from "multer";
import { publishToTikTok } from "./tiktok.js";

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/publish", upload.single("video"), async (req, res) => {
  try {
    const videoPath = req.file.path;
    const description = req.body.description;

    const result = await publishToTikTok(videoPath, description);

    res.json({ status: "ok", message: result });
  } catch (err) {
    console.error(err);
    res.json({ status: "error", message: err.message });
  }
});

app.listen(3000, () => {
  console.log("Microservizio TikTok in esecuzione sulla porta 3000");
});
