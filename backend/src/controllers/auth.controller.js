const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const logger = require('../utils/logger');

// Generate JWT tokens
const generateTokens = (username) => {
    const accessToken = jwt.sign(
        { username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
        { username, tokenId: uuidv4() },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
};

const register = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await db.query('SELECT username FROM users WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        await db.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
            [username, passwordHash]
        );

        logger.info(`User registered: ${username}`);

        // Generate tokens
        const tokens = generateTokens(username);

        // Store refresh token
        const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        
        await db.query(
            'INSERT INTO refresh_tokens (username, token_hash, expires_at) VALUES ($1, $2, $3)',
            [username, refreshTokenHash, expiresAt]
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: { username },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    } catch (error) {
        logger.error('Registration error:', error);
        throw error;
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Get user
        const result = await db.query('SELECT username, password_hash FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate tokens
        const tokens = generateTokens(username);

        // Store refresh token
        const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        
        await db.query(
            'INSERT INTO refresh_tokens (username, token_hash, expires_at) VALUES ($1, $2, $3)',
            [username, refreshTokenHash, expiresAt]
        );

        logger.info(`User logged in: ${username}`);

        res.json({
            message: 'Login successful',
            user: { username },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    } catch (error) {
        logger.error('Login error:', error);
        throw error;
    }
};

const logout = async (req, res) => {
    const { username } = req.user;
    const refreshToken = req.body.refreshToken;

    try {
        if (refreshToken) {
            // Revoke specific refresh token
            const tokens = await db.query(
                'SELECT id, token_hash FROM refresh_tokens WHERE username = $1 AND is_revoked = false',
                [username]
            );

            for (const tokenRecord of tokens.rows) {
                const isMatch = await bcrypt.compare(refreshToken, tokenRecord.token_hash);
                if (isMatch) {
                    await db.query(
                        'UPDATE refresh_tokens SET is_revoked = true WHERE id = $1',
                        [tokenRecord.id]
                    );
                    break;
                }
            }
        } else {
            // Revoke all refresh tokens for user
            await db.query(
                'UPDATE refresh_tokens SET is_revoked = true WHERE username = $1',
                [username]
            );
        }

        logger.info(`User logged out: ${username}`);
        res.json({ message: 'Logout successful' });
    } catch (error) {
        logger.error('Logout error:', error);
        throw error;
    }
};

const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
    }

    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const { username } = decoded;

        // Check if refresh token exists and is not revoked
        const tokenRecords = await db.query(
            'SELECT id, token_hash, expires_at FROM refresh_tokens WHERE username = $1 AND is_revoked = false AND expires_at > NOW()',
            [username]
        );

        let validToken = null;
        for (const record of tokenRecords.rows) {
            const isMatch = await bcrypt.compare(refreshToken, record.token_hash);
            if (isMatch) {
                validToken = record;
                break;
            }
        }

        if (!validToken) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        // Generate new tokens
        const tokens = generateTokens(username);

        // Store new refresh token and revoke old one
        const newRefreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await db.query('BEGIN');
        
        // Revoke old token
        await db.query(
            'UPDATE refresh_tokens SET is_revoked = true WHERE id = $1',
            [validToken.id]
        );
        
        // Insert new token
        await db.query(
            'INSERT INTO refresh_tokens (username, token_hash, expires_at) VALUES ($1, $2, $3)',
            [username, newRefreshTokenHash, expiresAt]
        );

        await db.query('COMMIT');

        res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    } catch (error) {
        await db.query('ROLLBACK');
        
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }
        
        logger.error('Token refresh error:', error);
        throw error;
    }
};

module.exports = {
    register,
    login,
    logout,
    refreshToken
};