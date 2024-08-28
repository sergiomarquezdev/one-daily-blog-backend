import express from "express";
import morgan from "morgan";
import cors from "./config/cors";
import postsRoutes from "./routes/posts";

const app = express();

app.use(morgan("combined"));
app.use(cors);
app.use(express.json());

app.use(postsRoutes);

export default app;
