// frontend/src/lib/api.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Post {
    id: string;
    username: string;
    imageUrl: string;
    caption: string;
    likesCount: number;
    sharesCount: number;
    createdAt: string;
    isLikedByUser: boolean;
}

export async function getPosts(token: string, page = 1, limit = 20) {
    if(!token) {
        throw new Error('No token provided');
    }
    const res = await fetch(`${API_BASE}/posts?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
}

export async function createPost(token: string, formData: FormData) {
    const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: {
            // NOTE: Do NOT set the 'Content-Type' header.
            // The browser automatically sets it to 'multipart/form-data'
            // with the correct boundary when the body is a FormData object.
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });
    
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create post');
    }
    
    return res.json();
}

export async function likePost(token: string, postId: string) {
    const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to like post');
    return res.json();
}

export async function unlikePost(token: string, postId: string) {
    const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to unlike post');
    return res.json();
}

export async function sharePost(token: string, postId: string) {
    const res = await fetch(`${API_BASE}/posts/${postId}/share`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to share post');
    return res.json();
}