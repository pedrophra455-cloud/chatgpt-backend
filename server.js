import express from "express";
import multer from "multer";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import cors from "cors";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

/**
 * ROTA DE TESTE
 */
app.get("/", (req, res) => {
  res.json({ status: "Backend rodando OK 🚀" });
});

/**
 * ROTA DE TRANSCRIÇÃO
 */
app.post("/transcribe", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum áudio enviado" });
    }

    const form = new FormData();
    form.append("file", fs.createReadStream(req.file.path));
    form.append("model", "whisper-1");

    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    // remove o arquivo temporário
    fs.unlinkSync(req.file.path);

    res.json({
      transcription: response.data.text,
    });
  } catch (err) {
    console.error(
      "ERRO OPENAI:",
      err.response?.data || err.message
    );

    res.status(500).json({
      error: "Falha na transcrição",
      details: err.response?.data || err.message,
    });
  }
});

/**
 * PORTA
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
