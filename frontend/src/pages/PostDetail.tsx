import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { getPostById } from '@/lib/api';
import { Heart, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define types for our data
interface Post {
    id: string;
    username: string;
    imageUrl: string;
    caption: string;
    createdAt: string;
    likesCount: number;
    sharesCount: number;
    isLikedByUser: boolean;
}

const PostDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [likes, setLikes] = useState(0);
    const [shares, setShares] = useState(0);
    const [liked, setLiked] = useState(false);

    // --- Data fetching and other logic remains unchanged ---
    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem('token');
                const postData = await getPostById(token!, id);
                setPost(postData);
                setLikes(postData.likesCount);
                setShares(postData.sharesCount);
                setLiked(postData.isLikedByUser);
            } catch (err) {
                setError('Failed to load post. It may have been deleted.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (isLoading) return <div className="text-center p-10">Loading...</div>;
    if (error)
        return <div className="text-center p-10 text-red-500">{error}</div>;
    if (!post) return <div className="text-center p-10">Post not found.</div>;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <Card className="max-w-4xl w-full mx-auto shadow-xl rounded-lg overflow-hidden border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Left Side: Image */}
                    <div className="relative aspect-square">
                        <img
                            src={post.imageUrl}
                            alt={`Post by ${post.username}`}
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Right Side: Details & Comments */}
                    <div className="flex flex-col bg-white h-[50vh] md:h-auto">
                        {/* 2. Scrollable Content Area for Caption */}
                        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                            <div className="flex items-start gap-3">
                                <span className="font-semibold text-sm flex-shrink-0">
                                    {post.username}
                                </span>
                                <p className="text-sm text-gray-800 leading-relaxed">
                                    {post.caption}
                                </p>
                            </div>
                        </div>

                        {/* 3. Refined Action Bar & Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 space-y-3">
                            <div className="flex items-center justify-between mb-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`flex items-center gap-2 p-0 h-auto hover:bg-transparent transition-all duration-200 ${
                                        liked
                                            ? 'text-red-500 hover:text-red-600'
                                            : 'text-gray-900 hover:text-gray-600'
                                    }`}
                                >
                                    <Heart
                                        className={`h-6 w-6 transition-all duration-200 ${
                                            liked
                                                ? 'fill-current scale-110'
                                                : 'hover:scale-110'
                                        }`}
                                    />
                                    <span className="text-sm font-semibold">
                                        {likes}
                                    </span>
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-2 p-0 h-auto text-gray-900 hover:text-gray-600 hover:bg-transparent transition-all duration-200"
                                >
                                    <Share className="h-6 w-6 hover:scale-110 transition-all duration-200" />
                                    <span className="text-sm font-semibold">
                                        {shares}
                                    </span>
                                </Button>
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">
                                {formatTimestamp(post.createdAt)}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PostDetail;
