import express from "express";
import multer from "multer";

const PORT = process.env.PORT || 3000;
const app = express();
app.get("/", (req, res) => {
  res.send("Servidor online 🚀");
});
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
app.post("/audio", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum áudio enviado" });
  }

  res.json({
    message: "Áudio recebido com sucesso",
    file: req.file.originalname,
  });
});
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
