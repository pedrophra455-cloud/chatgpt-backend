import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

// ✅ ROTA RAIZ (evita "Cannot GET /")
app.get("/", (req, res) => {
  res.json({ status: "API online 🚀" });
});

// ✅ ROTA DE UPLOAD DE ÁUDIO
app.post("/upload", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Arquivo de áudio não enviado" });
  }

  res.json({
    message: "Áudio recebido com sucesso",
    file: req.file.originalname
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
