import express from "express";
import multer from "multer";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

const app = express();
const upload = multer({ dest: "uploads/" });

/**
 * Rota de teste
 */
app.get("/", (req, res) => {
  res.send("Backend online 🚀");
});

/**
 * Rota de áudio
 */
app.post("/audio", upload.single("audio"), async (req, res) => {
  try {
    // 1️⃣ validação
    if (!req.file) {
      return res.status(400).json({ error: "Arquivo de áudio não enviado" });
    }

    // 2️⃣ monta form para transcrição
    const form = new FormData();
    form.append("file", fs.createReadStream(req.file.path));
    form.append("model", "gpt-4o-transcribe");

    // 3️⃣ transcrição
    const transRes = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        body: form,
      }
    );

    const transcription = await transRes.json();

    // limpa o arquivo
    fs.unlinkSync(req.file.path);

    if (!transcription.text) {
      return res.status(500).json({ error: "Falha na transcrição" });
    }

    // 4️⃣ resposta curta estilo ASSISTENTE
    const aiRes = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          input: `Responda de forma curta e direta:\n${transcription.text}`,
        }),
      }
    );

    const aiData = await aiRes.json();

    const reply =
      aiData.output_text ||
      "Não foi possível gerar resposta.";

    // 5️⃣ resposta final
    res.json({
      transcription: transcription.text,
      reply,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Porta
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
