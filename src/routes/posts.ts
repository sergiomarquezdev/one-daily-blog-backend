import { Router } from "express";
import {
    generatePost,
    getPostBySlug,
    getPosts,
    getRandomPosts,
} from "../controllers/postsController";

const router = Router();

router.get("/posts", getPosts);
router.get("/posts/random", getRandomPosts);
router.get("/posts/:slug", getPostBySlug);
router.post("/posts/generate", generatePost);

export default router;
