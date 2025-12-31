import express from "express";
import multer from "multer";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/audio", upload.single("audio"), async (req, res) => {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(req.file.path));
    form.append("model", "gpt-4o-transcribe");

    const transRes = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: form,
      }
    );

    const transcription = await transRes.json();

    const chatRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: transcription.text,
            },
          ],
        }),
      }
    );

    const chat = await chatRes.json();

    res.json({
      transcription: transcription.text,
      reply: chat.choices[0].message.content,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
