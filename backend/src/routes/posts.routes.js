const express = require('express');
const {
    createPost,
    getAllPosts,
    getPostById,
    getUserPosts,
    likePost,
    unlikePost,
    sharePost,
    deletePost,
    getPostStats,
    getPostLikes
} = require('../controllers/posts.controller');
const { validate, schemas } = require('../utils/validations');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/ping', (req, res) => {res.send('pong');});

// All routes require authentication
router.use(authenticateToken);

// Post CRUD operations
router.post('/', validate(schemas.createPost), createPost);
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.delete('/:id', deletePost);

// User-specific posts
router.get('/user/:username', getUserPosts);

// Engagement operations
router.post('/:id/like', likePost);
router.delete('/:id/like', unlikePost);
router.post('/:id/share', sharePost);

// Additional endpoints for analytics and engagement details
router.get('/:id/stats', getPostStats);
router.get('/:id/likes', getPostLikes);

module.exports = router;