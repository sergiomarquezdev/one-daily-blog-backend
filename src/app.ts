import express from "express";
import morgan from "morgan";
import postsRoutes from "./routes/posts";

const app = express();

app.use(morgan("combined"));
app.use(express.json());

app.use(postsRoutes);

export default app;
