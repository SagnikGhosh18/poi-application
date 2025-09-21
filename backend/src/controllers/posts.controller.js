const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

// Helper to format post response
function formatPost(post, currentUser) {
    return {
        id: post.id,
        username: post.username,
        imageUrl: post.image_url,
        caption: post.caption,
        likesCount: Number(post.likes_count) || 0,
        sharesCount: Number(post.shares_count) || 0,
        createdAt: post.created_at,
        isLikedByUser: !!post.is_liked_by_user
    };
}

// 1. Create Post
exports.createPost = async (req, res) => {
    const { imageUrl, caption } = req.body;
    const username = req.user.username;
    const id = uuidv4();
    await db.query(
        `INSERT INTO posts (id, username, image_url, caption, created_at) VALUES ($1, $2, $3, $4, NOW())`,
        [id, username, imageUrl, caption]
    );
    res.status(201).json({
        message: 'Post created successfully',
        post: {
            id,
            username,
            imageUrl,
            caption,
            likesCount: 0,
            sharesCount: 0,
            createdAt: new Date().toISOString(),
            isLikedByUser: false
        }
    });
};

// 2. Get All Posts (paginated)
exports.getAllPosts = async (req, res) => {
    const username = req.user.username;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const totalResult = await db.query('SELECT COUNT(*) FROM posts');
    const totalPosts = Number(totalResult.rows[0].count);
    const totalPages = Math.ceil(totalPosts / limit);

    const postsResult = await db.query(
        `SELECT p.*, 
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
      (SELECT COUNT(*) FROM shares WHERE post_id = p.id) AS shares_count,
      EXISTS (
        SELECT 1 FROM likes WHERE post_id = p.id AND username = $1
      ) AS is_liked_by_user
     FROM posts p
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
        [username, limit, offset]
    );

    res.json({
        posts: postsResult.rows.map(post => formatPost(post, username)),
        pagination: {
            currentPage: page,
            totalPages,
            totalPosts,
            hasNext: page < totalPages,
            hasPrevious: page > 1
        }
    });
};

// 3. Get Post by ID
exports.getPostById = async (req, res) => {
    const { id } = req.params;
    const username = req.user.username;
    const result = await db.query(
        `SELECT p.*, 
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
      (SELECT COUNT(*) FROM shares WHERE post_id = p.id) AS shares_count,
      EXISTS (
        SELECT 1 FROM likes WHERE post_id = p.id AND username = $2
      ) AS is_liked_by_user
     FROM posts p WHERE p.id = $1`,
        [id, username]
    );
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
    }
    res.json(formatPost(result.rows[0], username));
};

// 4. Delete Post (owner only)
exports.deletePost = async (req, res) => {
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

// 5. Get User Posts
exports.getUserPosts = async (req, res) => {
    const { username } = req.params;
    const currentUser = req.user.username;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const totalResult = await db.query('SELECT COUNT(*) FROM posts WHERE username = $1', [username]);
    const totalPosts = Number(totalResult.rows[0].count);
    const totalPages = Math.ceil(totalPosts / limit);

    const postsResult = await db.query(
        `SELECT p.*, 
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
      (SELECT COUNT(*) FROM shares WHERE post_id = p.id) AS shares_count,
      EXISTS (
        SELECT 1 FROM likes WHERE post_id = p.id AND username = $2
      ) AS is_liked_by_user
     FROM posts p
     WHERE p.username = $1
     ORDER BY p.created_at DESC
     LIMIT $3 OFFSET $4`,
        [username, currentUser, limit, offset]
    );

    res.json({
        posts: postsResult.rows.map(post => formatPost(post, currentUser)),
        pagination: {
            currentPage: page,
            totalPages,
            totalPosts,
            hasNext: page < totalPages,
            hasPrevious: page > 1
        }
    });
};

// 6. Like Post
exports.likePost = async (req, res) => {
    const { id } = req.params;
    const username = req.user.username;
    try {
        await db.query(
            'INSERT INTO likes (post_id, username, created_at) VALUES ($1, $2, NOW())',
            [id, username]
        );
    } catch (e) {
        return res.status(400).json({ error: 'You have already liked this post' });
    }
    const countResult = await db.query('SELECT COUNT(*) FROM likes WHERE post_id = $1', [id]);
    res.json({
        message: 'Post liked successfully',
        likesCount: Number(countResult.rows[0].count),
        isLikedByUser: true
    });
};

// 7. Unlike Post
exports.unlikePost = async (req, res) => {
    const { id } = req.params;
    const username = req.user.username;
    const result = await db.query(
        'DELETE FROM likes WHERE post_id = $1 AND username = $2 RETURNING *',
        [id, username]
    );
    if (result.rowCount === 0) {
        return res.status(400).json({ error: 'You have not liked this post' });
    }
    const countResult = await db.query('SELECT COUNT(*) FROM likes WHERE post_id = $1', [id]);
    res.json({
        message: 'Post unliked successfully',
        likesCount: Number(countResult.rows[0].count),
        isLikedByUser: false
    });
};

// 8. Share Post
exports.sharePost = async (req, res) => {
    const { id } = req.params;
    const username = req.user.username;
    const postResult = await db.query('SELECT username FROM posts WHERE id = $1', [id]);
    if (postResult.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
    }
    if (postResult.rows[0].username === username) {
        return res.status(400).json({ error: 'You cannot share your own post' });
    }
    try {
        await db.query(
            'INSERT INTO shares (post_id, username, created_at) VALUES ($1, $2, NOW())',
            [id, username]
        );
    } catch (e) {
        return res.status(400).json({ error: 'You have already shared this post' });
    }
    const countResult = await db.query('SELECT COUNT(*) FROM shares WHERE post_id = $1', [id]);
    res.json({
        message: 'Post shared successfully',
        sharesCount: Number(countResult.rows[0].count)
    });
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