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

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
