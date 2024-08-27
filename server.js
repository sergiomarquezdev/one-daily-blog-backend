import express from "express";
import morgan from "morgan";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import apiRouter from "./src/config/api.routes";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
const server = express();
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, "../browser");
const indexHtml = join(serverDistFolder, "index.server.html");
// Middleware para logging
server.use(morgan("combined"));
// Middleware para CORS
server.use(cors());
// Rutas API
server.use("/api", apiRouter);
// Servir archivos estáticos
server.use(
    express.static(browserDistFolder, {
        maxAge: "1y",
        index: "index.html",
    })
);
// Middleware de manejo de errores
server.use((err, req, res, next) => {
    console.error("Server error:", err);
    res.status(500).send("Internal server error");
});
const port = process.env.PORT || 4000;
server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
});
