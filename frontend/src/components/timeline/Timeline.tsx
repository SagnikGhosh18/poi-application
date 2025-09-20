import { useEffect, useState } from 'react';
import PostCard from '../posts/PostCard';
import { getPosts } from '@/lib/api';

interface Post {
    id: string;
    username: string;
    imageUrl: string;
    caption: string;
    timestamp: string;
    initialLikes: number;
    initialShares: number;
    isLiked?: boolean;
}

// Mock data for demonstration
const mockPosts = [
    {
        id: '1',
        username: 'alex_wanderer',
        imageUrl:
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=600&fit=crop',
        caption:
            'Beautiful sunset at the beach today! Perfect end to a perfect day 🌅',
        timestamp: '2h',
        initialLikes: 42,
        initialShares: 8,
        isLiked: false,
    },
    {
        id: '2',
        username: 'foodie_maya',
        imageUrl:
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=600&fit=crop',
        caption:
            'Homemade pasta with fresh herbs from my garden. Nothing beats the taste of homegrown ingredients! 🍝',
        timestamp: '4h',
        initialLikes: 89,
        initialShares: 12,
        isLiked: true,
    },
    {
        id: '3',
        username: 'urban_explorer',
        imageUrl:
            'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=500&h=700&fit=crop',
        caption:
            'City lights never fail to amaze me. Each window tells a different story ✨',
        timestamp: '6h',
        initialLikes: 156,
        initialShares: 23,
        isLiked: false,
    },
    {
        id: '4',
        username: 'nature_lover',
        imageUrl:
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=800&fit=crop',
        caption:
            'Morning hike through the forest. The fresh air and peaceful silence is exactly what I needed today 🌲',
        timestamp: '8h',
        initialLikes: 73,
        initialShares: 15,
        isLiked: false,
    },
    {
        id: '5',
        username: 'coffee_addict',
        imageUrl:
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=600&fit=crop',
        caption: 'Perfect latte art to start my Monday morning right ☕️',
        timestamp: '1d',
        initialLikes: 34,
        initialShares: 5,
        isLiked: true,
    },
];

const Timeline = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Replace with your auth token logic
        try {
            const token = localStorage.getItem('token');
            getPosts(token!)
                .then(data => setPosts(data.posts))
                .finally(() => setLoading(false));
        } catch (error) {
            console.error('Error fetching posts:', error);
            setLoading(false);
        }
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="w-full max-w-4xl mx-auto px-4">
            <div className="md:hidden flex flex-col gap-4">
                {mockPosts.map(post => (
                    <PostCard key={post.id} {...post} />
                ))}
            </div>

            <div className="hidden md:block">
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
                    {posts.map(post => (
                        <div key={post.id} className="break-inside-avoid mb-6">
                            <PostCard {...post} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Timeline;
