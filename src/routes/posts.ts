import {Router} from "express";
import {
    getPostBySlug,
    getPosts,
    getRandomPosts,
    getPreviousPostById,
    getNextPostById,
    getTotalPosts,
    generatePost
} from "../controllers/postsController";
import {generateSitemap} from "../controllers/utilsController";

const router = Router();

router.get("/posts", getPosts);
router.get("/posts/random", getRandomPosts);
router.get("/posts/slug", getPostBySlug);
router.get('/posts/previous', getPreviousPostById);
router.get('/posts/next', getNextPostById);
router.get("/posts/total", getTotalPosts);
router.post("/posts/generate", generatePost);
router.get("/sitemap/generate", generateSitemap)

export default router;
