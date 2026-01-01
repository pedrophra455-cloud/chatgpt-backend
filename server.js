/**
 * Backend Express – Upload de áudio (estável para Render)
 * Autor: setup sênior
 */

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

/* =========================
   CONFIGURAÇÕES BÁSICAS
========================= */

// Porta obrigatória para Render
const PORT = process.env.PORT || 3000;

// Pasta segura para uploads
const UPLOAD_DIR = path.join(__dirname, "uploads");

// Garante que a pasta exista
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

/* =========================
   MULTER (UPLOAD DE ARQUIVO)
========================= */

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB (seguro para Render)
  },
});

/* =========================
   ROTAS
========================= */

// Health check (Render / navegador)
app.get("/", (_req, res) => {
  res.status(200).json({ status: "API online 🚀" });
});

// Upload de áudio
app.post("/audio", upload.single("audio"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Nenhum arquivo enviado",
      });
    }

    return res.status(200).json({
      message: "Áudio recebido com sucesso",
      file: req.file.filename,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Erro interno no servidor",
    });
  }
});

/* =========================
   START DO SERVIDOR
========================= */

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
