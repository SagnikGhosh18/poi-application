const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

// Helper to format post response
// MODIFIED: Generates a URL to a dedicated endpoint that serves the image blob.
function formatPost(post, req) {
    const imageUrl = `${req.protocol}://${req.get('host')}/api/posts/${post.id}/image`;
    
    return {
        id: post.id,
        username: post.username,
        imageUrl: imageUrl,
        caption: post.caption,
        likesCount: Number(post.likes_count) || 0,
        sharesCount: Number(post.shares_count) || 0,
        createdAt: post.created_at,
        isLikedByUser: !!post.is_liked_by_user
    };
}

// 1. Create Post
// MODIFIED: This now handles a file upload.
// NOTE: This requires a middleware like 'multer' on the corresponding route.
exports.createPost = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Image file is required.' });
    }

    const { caption } = req.body;
    const { buffer: imageData, mimetype: mimeType, originalname: filename } = req.file;
    const username = req.user.username;
    const id = uuidv4();

    const newPostQuery = `
        INSERT INTO posts (id, username, image_data, mime_type, filename, caption) 
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, username, caption, created_at;
    `;
    const result = await db.query(newPostQuery, [id, username, imageData, mimeType, filename, caption]);
    const newPost = result.rows[0];

    res.status(201).json({
        message: 'Post created successfully',
        post: {
            id: newPost.id,
            username: newPost.username,
            imageUrl: `${req.protocol}://${req.get('host')}/api/posts/${newPost.id}/image`,
            caption: newPost.caption,
            likesCount: 0,
            sharesCount: 0,
            createdAt: newPost.created_at,
            isLikedByUser: false
        }
    });
};

// 2. NEW ENDPOINT: Serve Post Image
// This new function retrieves the blob from the DB and sends it as an image.
exports.servePostImage = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await db.query('SELECT image_data, mime_type FROM posts WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Image not found.' });
        }
        
        const { image_data, mime_type } = result.rows[0];
        
        // Set proper headers for image response
        res.setHeader('Content-Type', mime_type);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        res.setHeader('Content-Length', image_data.length);
        
        // Set CORS headers for image requests
        res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:5173');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        // Remove restrictive headers that might block image loading
        res.removeHeader('Cross-Origin-Resource-Policy');
        
        // Send the binary image data
        res.send(image_data);
    } catch (error) {
        console.error('Error serving image:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// 3. Get All Posts (paginated)
exports.getAllPosts = async (req, res) => {
    const username = req.user.username;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const totalResult = await db.query('SELECT COUNT(*) FROM posts');
    const totalPosts = Number(totalResult.rows[0].count);
    const totalPages = Math.ceil(totalPosts / limit);

    // MODIFIED: Selected specific columns to AVOID fetching the large 'image_data' blob.
    // Also, using the pre-calculated counter columns from the 'posts' table is much more efficient.
    const postsResult = await db.query(
        `SELECT 
            p.id, p.username, p.caption, p.likes_count, p.shares_count, p.created_at,
            EXISTS (SELECT 1 FROM likes WHERE post_id = p.id AND username = $1) AS is_liked_by_user
         FROM posts p
         ORDER BY p.created_at DESC
         LIMIT $2 OFFSET $3`,
        [username, limit, offset]
    );

    res.json({
        posts: postsResult.rows.map(post => formatPost(post, req)),
        pagination: { currentPage: page, totalPages, totalPosts, hasNext: page < totalPages, hasPrevious: page > 1 }
    });
};

// 4. Get Post by ID
exports.getPostById = async (req, res) => {
    const { id } = req.params;
    const username = req.user.username;

    // MODIFIED: Selected specific columns to avoid fetching the 'image_data' blob.
    const result = await db.query(
        `SELECT 
            p.id, p.username, p.caption, p.likes_count, p.shares_count, p.created_at,
            EXISTS (SELECT 1 FROM likes WHERE post_id = p.id AND username = $2) AS is_liked_by_user
         FROM posts p WHERE p.id = $1`,
        [id, username]
    );
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
    }
    res.json(formatPost(result.rows[0], req));
};

// 5. Delete Post (owner only)
// NO CHANGES NEEDED
exports.deletePost = async (req, res) => {
    // ... existing code ...
    const { id } = req.params;
    const username = req.user.username;
    const postResult = await db.query('SELECT username FROM posts WHERE id = $1', [id]);
    if (postResult.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
    }
    if (postResult.rows[0].username !== username) {
        return res.status(403).json({ error: 'Unauthorized: Only the post owner can delete' });
    }
    await db.query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ message: 'Post deleted successfully' });
};

// 6. Get User Posts
exports.getUserPosts = async (req, res) => {
    // ... logic to get user posts ...
    // MODIFIED: Similar to getAllPosts, select specific columns to avoid the blob.
    const { username } = req.params;
    const currentUser = req.user.username;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const totalResult = await db.query('SELECT COUNT(*) FROM posts WHERE username = $1', [username]);
    const totalPosts = Number(totalResult.rows[0].count);
    const totalPages = Math.ceil(totalPosts / limit);

    const postsResult = await db.query(
        `SELECT 
            p.id, p.username, p.caption, p.likes_count, p.shares_count, p.created_at,
            EXISTS (SELECT 1 FROM likes WHERE post_id = p.id AND username = $2) AS is_liked_by_user
         FROM posts p
         WHERE p.username = $1
         ORDER BY p.created_at DESC
         LIMIT $3 OFFSET $4`,
        [username, currentUser, limit, offset]
    );

    res.json({
        posts: postsResult.rows.map(post => formatPost(post, req)),
        pagination: { currentPage: page, totalPages, totalPosts, hasNext: page < totalPages, hasPrevious: page > 1 }
    });
};

// 7. Like Post
// MODIFIED: Simplified to rely on the database trigger for count updates.
exports.likePost = async (req, res) => {
    const { id } = req.params;
    const username = req.user.username;
    try {
        await db.query('INSERT INTO likes (post_id, username) VALUES ($1, $2)', [id, username]);
        res.status(201).json({ message: 'Post liked successfully' });
    } catch (e) {
        if (e.code === '23505') { // Handle unique constraint violation
            return res.status(409).json({ error: 'You have already liked this post' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

// 8. Unlike Post
// MODIFIED: Simplified to rely on the database trigger for count updates.
exports.unlikePost = async (req, res) => {
    const { id } = req.params;
    const username = req.user.username;
    const result = await db.query('DELETE FROM likes WHERE post_id = $1 AND username = $2', [id, username]);
    if (result.rowCount === 0) {
        return res.status(400).json({ error: 'You have not liked this post' });
    }
    res.json({ message: 'Post unliked successfully' });
};

// 9. Share Post
// MODIFIED: Simplified to rely on the database trigger for count updates.
exports.sharePost = async (req, res) => {
    const { id } = req.params;
    const username = req.user.username;
    // ... existing checks for post existence and self-sharing ...
    try {
        await db.query('INSERT INTO shares (post_id, username) VALUES ($1, $2)', [id, username]);

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const shareUrl = `${clientUrl}/posts/${id}`;

        // 3. Send the URL back in the response
        res.status(201).json({ 
            message: 'Post shared successfully',
            shareUrl: shareUrl 
        });

    } catch (e) {
        if (e.code === '23505') {
            return res.status(409).json({ error: 'You have already shared this post' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

// 9. Get Post Stats
exports.getPostStats = async (req, res) => {
    const { id } = req.params;
    const postResult = await db.query('SELECT created_at FROM posts WHERE id = $1', [id]);
    if (postResult.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
    }
    const likesResult = await db.query(
        'SELECT COUNT(DISTINCT username) AS unique_likes FROM likes WHERE post_id = $1',
        [id]
    );
    const sharesResult = await db.query(
        'SELECT COUNT(DISTINCT username) AS unique_shares FROM shares WHERE post_id = $1',
        [id]
    );
    res.json({
        postId: id,
        stats: {
            likesCount: Number(likesResult.rows[0].unique_likes),
            sharesCount: Number(sharesResult.rows[0].unique_shares),
            uniqueLikes: Number(likesResult.rows[0].unique_likes),
            uniqueShares: Number(sharesResult.rows[0].unique_shares),
            createdAt: postResult.rows[0].created_at
        }
    });
};

// 10. Get Post Likes (paginated)
exports.getPostLikes = async (req, res) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const totalResult = await db.query(
        'SELECT COUNT(*) FROM likes WHERE post_id = $1',
        [id]
    );
    const totalLikes = Number(totalResult.rows[0].count);
    const totalPages = Math.ceil(totalLikes / limit);

    const likesResult = await db.query(
        `SELECT username, created_at
     FROM likes
     WHERE post_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
        [id, limit, offset]
    );

    res.json({
        likes: likesResult.rows,
        pagination: {
            currentPage: page,
            totalPages,
            totalLikes,
            hasNext: page < totalPages,
            hasPrevious: page > 1
        }
    });
};