import express from "express"
import {protectRoute} from "../middleware/auth.middleware.js"
import { addComment, createPost, deletePost, getAllPosts, replyToComment, toggleCommentsLike, toggleLikePost, updatePost } from "../controllers/post.controller.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.use(protectRoute)


router.get('/get-post',getAllPosts)
router.post("/create-post", upload.single("attachments"), createPost);
router.put("/update-post/:postId", upload.single("attachments"), updatePost);
router.delete("/delete-post/:postId",  deletePost);
router.post('/:postId/like', toggleLikePost);
router.post('/:postId/comment',addComment);
router.post('/:postId/comment/:commentId/reply',  replyToComment);
router.post('/:postId/comment/:commentId/like',  toggleCommentsLike);

export default router;