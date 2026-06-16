import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve frontend static files
const frontendPath = path.join(__dirname, "../../topup-game/dist/public");
app.use(express.static(frontendPath));

// Catch-all route untuk React SPA
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

export default app;