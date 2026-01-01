import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import fs from "fs";
import FormData from "form-data";

const app = express();
const PORT = process.env.PORT || 3000;

// Upload de arquivos
const upload = multer({ dest: "uploads/" });

// Health check (Render usa isso)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", server: "online" });
});

// Rota raiz
app.get("/", (req, res) => {
  res.send("Backend online 🚀");
});

// Rota de áudio (transcrição + resposta IA)
app.post("/audio", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum áudio enviado" });
    }

    // 1️⃣ Transcrição
    const form = new FormData();
    form.append("file", fs.createReadStream(req.file.path));
    form.append("model", "gpt-4o-transcribe");

    const transcriptionResponse = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: form,
      }
    );

    const transcription = await transcriptionResponse.json();

    // 2️⃣ Enviar texto para IA responder
    const chatResponse = await fetch(
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
            { role: "user", content: transcription.text }
          ],
        }),
      }
    );

    const chat = await chatResponse.json();

    res.json({
      transcription: transcription.text,
      reply: chat.choices[0].message.content,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Start do servidor
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
