import {Router} from "express";
import {
    getPostBySlug,
    getPosts,
    getRandomPosts,
    getPreviousPostById,
    getNextPostById,
    generatePost,
} from "../controllers/postsController";

const router = Router();

router.get("/posts", getPosts);
router.get("/posts/random", getRandomPosts);
router.get("/posts/:slug", getPostBySlug);
router.get('/posts/previous', getPreviousPostById);
router.get('/posts/next', getNextPostById);
router.post("/posts/generate", generatePost);

export default router;
