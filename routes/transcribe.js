import express from "express";
import multer from "multer";
import fs from "fs-extra";
import { transcribeAudio } from "../services/whisperService.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const text = await transcribeAudio(req.file.path);

    await fs.remove(req.file.path);

    res.json({
      success: true,
      transcription: text
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Transcription failed" });
  }
});

export default router;
