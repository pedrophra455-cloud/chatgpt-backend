import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Servidor online" });
});

app.post("/audio", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum áudio enviado" });
    }

    // ===== TRANSCRIÇÃO =====
    const form = new FormData();
    form.append("file", fs.createReadStream(req.file.path));
    form.append("model", "gpt-4o-transcribe");

    const transcriptionRes = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: form,
      }
    );

    const transcription = await transcriptionRes.json();

    if (!transcription.text) {
      return res.status(500).json({ error: "Falha na transcrição" });
    }

    // ===== CHATGPT =====
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
            { role: "system", content: "Responda de forma curta e direta." },
            { role: "user", content: transcription.text }
          ],
        }),
      }
    );

    const chat = await chatRes.json();

    fs.unlinkSync(req.file.path); // apaga o arquivo

    res.json({
      transcription: transcription.text,
      reply: chat.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

app.listen(port, () => {
  console.log("Servidor rodando na porta", port);
});
