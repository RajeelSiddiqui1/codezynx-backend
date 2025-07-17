// import cloudinary from "../lib/cloudaniry.js";
// import Post from "../models/Post.js";
// import { generateLongDesc, isITRelevant } from "../lib/functions/genAI.js";

// export async function getAllPosts(req, res) {
//   try {
//     const posts = await Post.find().populate('author', 'fullName email')
//     res.status(200).json(posts)
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch posts" });
//   }
// }


// export async function createPost(req, res) {
//   try {
//     const { title, description } = req.body;
//     const userId = req.user?._id;

//     const attachmentName = req.file?.originalname || "";
//     const mimeType = req.file?.mimetype || "";
//     const relevant = await isITRelevant(title, description, attachmentName, mimeType);

//     if (!relevant) {
//       console.log("⛔️ Post rejected: Not IT related");
//       return res.status(400).json({ error: "Post must be related to Information Technology." });
//     }

//     let attachmentUrl = null;
//     let publicId = null;

//     if (req.file) {
//       const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
//       const uploaded = await cloudinary.uploader.upload(base64, {
//         resource_type: "auto",
//       });
//       attachmentUrl = uploaded.secure_url;
//       publicId = uploaded.public_id;
//     }

//     const longDesc = await generateLongDesc(title, description);

//     const newPost = new Post({
//       title,
//       description,
//       longDesc,
//       attachments: { url: attachmentUrl, public_id: publicId },
//       author: userId,
//     });

//     await newPost.save();

//     return res.status(201).json({ message: "Post created", post: newPost });
//   } catch (err) {
//     console.error("Server error:", err.message);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// }





// export async function toggleLikePost(req, res) {
//   try {
//     const { postId } = req.params;
//     const userId = req.user._id;

//     const post = await Post.findById(postId);
//     if (!post) return res.status(404).json({ error: 'Post not found' });
//     const alreadyLiked = await post.likes.includes(userId)
//     if (alreadyLiked) {
//       post.likes.pull(userId)
//     } else {
//       post.likes.push(userId)
//     }

//     await post.save();
//     res.json({ liked: !alreadyLiked, totalLikes: post.likes.length });


//   } catch (error) {
//     console.error('Toggle like error:', err);
//     res.status(500).json({ error: 'Something went wrong' });
//   }
// }

// export const addComment = async (req, res) => {
//   const { postId } = req.params;
//   const { text } = req.body;
//   const userId = req.user._id;

//   try {
//     const post = await Post.findById(postId);
//     if (!post) return res.status(404).json({ message: "Post not found" });

//     const newComment = { user: userId, text };
//     post.comments.push(newComment);
//     await post.save();

//     // Return the newly added comment
//     const savedComment = post.comments[post.comments.length - 1];
//     res.status(200).json({ message: "Comment added", comment: savedComment });
//   } catch (err) {
//     console.error("Add comment error:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// export const replyToComment = async (req, res) => {
//   const { postId, commentId } = req.params;
//   const { text } = req.body;
//   const userId = req.user._id;

//   try {
//     const post = await Post.findById(postId);
//     if (!post) return res.status(404).json({ message: "Post not found" });

//     const comment = post.comments.id(commentId);
//     if (!comment) return res.status(404).json({ message: "Comment not found" });

//     const newReply = { user: userId, text };
//     comment.replies.push(newReply);
//     await post.save();

//     // Return the newly added reply
//     const savedReply = comment.replies[comment.replies.length - 1];
//     res.status(200).json({ message: "Reply added", reply: savedReply });
//   } catch (err) {
//     console.error("Reply to comment error:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// export const useTogglePostLike = (postId) => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: () => togglePostLike(postId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["post", postId] });
//     },
//   });
// };

// export async function toggleCommentsLike(req, res) {
//   try {
//     const { postId, commentId } = req.params;
//     const userId = req.user._id;

//     const post = await Post.findById(postId);
//     if (!post) return res.status(404).json({ error: 'Post not found' });

//     const comment = post.comments.id(commentId);
//     if (!comment) return res.status(404).json({ error: 'Comment not found' });

//     const index = comment.likes.findIndex((id) => id.toString() === userId.toString());

//     if (index > -1) {
//       comment.likes.splice(index, 1);
//     } else {
//       comment.likes.push(userId);
//     }

//     await post.save();
//     res.json({ liked: index === -1, totalLikes: comment.likes.length });
//   } catch (err) {
//     console.error('Comment like error:', err);
//     res.status(500).json({ error: 'Something went wrong' });
//   }
// }





import cloudinary from "../lib/cloudaniry.js";
import Post from "../models/Post.js";
import { generateLongDesc, isITRelevant } from "../lib/functions/genAI.js";

let io;
export const setSocketIOInstance = (ioInstance) => {
  io = ioInstance;
};

// 🚀 GET all posts
export async function getAllPosts(req, res) {
  try {
    const posts = await Post.find().populate("author", "fullName email");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
}

// ➕ CREATE post
export async function createPost(req, res) {
  try {
    const { title, description } = req.body;
    const userId = req.user?._id;

    const attachmentName = req.file?.originalname || "";
    const mimeType = req.file?.mimetype || "";
    const relevant = await isITRelevant(title, description, attachmentName, mimeType);
    if (!relevant) {
      return res.status(400).json({ error: "Post must be related to Information Technology." });
    }

    let attachmentUrl = null;
    let publicId = null;

    if (req.file) {
      const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const uploaded = await cloudinary.uploader.upload(base64, {
        resource_type: "auto",
      });
      attachmentUrl = uploaded.secure_url;
      publicId = uploaded.public_id;
    }

    const longDesc = await generateLongDesc(title, description);

    const newPost = new Post({
      title,
      description,
      longDesc,
      attachments: { url: attachmentUrl, public_id: publicId },
      author: userId,
    });

    await newPost.save();
    return res.status(201).json({ message: "Post created", post: newPost });
  } catch (err) {
    console.error("Server error:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function updatePost(req, res) {
  try {
    const { postId } = req.params;
    const { title, description } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const attachmentName = req.file?.originalname || post.attachments?.url || "";

    const relevant = await isITRelevant(title, description, attachmentName);
    if (!relevant) {
      return res.status(400).json({ error: "Post must be related to Information Technology." });
    }

    let attachmentUrl = post.attachments?.url || null;
    let publicId = post.attachments?.public_id || null;

    if (req.file) {
      if (publicId) await cloudinary.uploader.destroy(publicId);

      const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const uploaded = await cloudinary.uploader.upload(base64, {
        resource_type: "auto",
      });

      attachmentUrl = uploaded.secure_url;
      publicId = uploaded.public_id;
    }

    const longDesc = await generateLongDesc(title, description);

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        title,
        description,
        longDesc,
        attachments: { url: attachmentUrl, public_id: publicId },
      },
      { new: true }
    );

    return res.status(200).json({ message: "Post updated", post: updatedPost });
  } catch (error) {
    console.error("Server error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}



export async function deletePost(req, res) {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const publicId = post.attachments?.public_id;
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    await Post.findByIdAndDelete(postId);

    return res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.error("Server error:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// 💖 Toggle Post Like
export async function toggleLikePost(req, res) {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const alreadyLiked = post.likes.includes(userId);
    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ liked: !alreadyLiked, totalLikes: post.likes.length });
  } catch (err) {
    console.error("Toggle like error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}

// 💬 Add Comment (with Socket Emit)
export const addComment = async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newComment = {
      user: userId,
      text,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    const savedComment = post.comments[post.comments.length - 1];

    // ✅ Real-time emit
    io?.to(postId).emit("new_comment", {
      ...savedComment.toObject(),
      commentedBy: { fullName: req.user.fullName, _id: userId },
    });

    res.status(200).json({ message: "Comment added", comment: savedComment });
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 💬 Reply to Comment (with Socket Emit)
export const replyToComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const newReply = {
      user: userId,
      text,
      createdAt: new Date(),
    };

    comment.replies.push(newReply);
    await post.save();

    const savedReply = comment.replies[comment.replies.length - 1];

    // ✅ Real-time emit
    io?.to(postId).emit("new_reply", {
      commentId,
      reply: {
        ...savedReply.toObject(),
        commentedBy: { fullName: req.user.fullName, _id: userId },
      },
    });

    res.status(200).json({ message: "Reply added", reply: savedReply });
  } catch (err) {
    console.error("Reply to comment error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 👍 Toggle Comment Like (with Socket Emit)
export async function toggleCommentsLike(req, res) {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const index = comment.likes.findIndex((id) => id.toString() === userId.toString());

    if (index > -1) {
      comment.likes.splice(index, 1);
    } else {
      comment.likes.push(userId);
    }

    await post.save();

    // ✅ Real-time emit
    io?.to(postId).emit("like_updated", {
      commentId,
      likes: comment.likes,
    });

    res.json({ liked: index === -1, totalLikes: comment.likes.length });
  } catch (err) {
    console.error("Comment like error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
