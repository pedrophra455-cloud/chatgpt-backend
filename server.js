import express from "express";
import multer from "multer";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

// ===== MIDDLEWARES =====
app.use(cors());
app.use(express.json());

// ===== MULTER CONFIG =====
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  }
});

// ===== ROTA TESTE =====
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Servidor online" });
});

// ===== ROTA AUDIO =====
app.post("/audio", upload.single("audio"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum áudio enviado" });
    }

    return res.json({
      ok: true,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// ===== START SERVER =====
app.listen(port, () => {
  console.log("Servidor rodando na porta", port);
});
