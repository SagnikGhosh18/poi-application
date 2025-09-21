const express = require('express');
const multer = require('multer'); // 1. Import multer
const {
    createPost,
    servePostImage, // 2. Import the new controller function
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

// Configure multer for in-memory file storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB file size limit
    },
});

router.get('/ping', (req, res) => { res.send('pong'); });

// Public image endpoint (no authentication required)
// Handle OPTIONS preflight request for CORS
router.options('/:id/image', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
});

router.get('/:id/image', servePostImage);

// All subsequent routes require authentication
router.use(authenticateToken);

// Post CRUD operations
// 3. Add multer middleware to the create post route. It expects a file in a field named 'image'.
router.post('/', upload.single('image'), validate(schemas.createPost), createPost);
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.delete('/:id', deletePost);

// User-specific posts
router.get('/user/:username', getUserPosts);

// Engagement operations
router.post('/:id/like', likePost);
router.delete('/:id/like', unlikePost);
router.post('/:id/share', sharePost);

// Additional endpoints
router.get('/:id/stats', getPostStats);
router.get('/:id/likes', getPostLikes);

module.exports = router;