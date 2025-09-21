import { Heart, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { likePost, unlikePost, sharePost } from '@/lib/api';

interface PostCardProps {
    id: string;
    username: string;
    imageUrl: string;
    caption: string;
    createdAt: string;
    likesCount: number;
    sharesCount: number;
    isLikedByUser?: boolean;
}

const PostCard = ({
    id,
    username,
    imageUrl,
    caption,
    createdAt,
    likesCount,
    sharesCount,
    isLikedByUser = false,
}: PostCardProps) => {
    const [likes, setLikes] = useState(likesCount);
    const [shares, setShares] = useState(sharesCount);
    const [liked, setLiked] = useState(isLikedByUser);

    // Format timestamp for display
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60 * 60)
        );

        if (diffInHours < 1) return 'now';
        if (diffInHours < 24) return `${diffInHours}h`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d`;
        return date.toLocaleDateString();
    };

    const handleLike = async () => {
        setLiked(prev => !prev);
        setLikes(prev => (liked ? prev - 1 : prev + 1));
        const token = localStorage.getItem('token');
        try {
            if (!liked) await likePost(token!, id);
            else await unlikePost(token!, id);
        } catch (e) {
            // Optionally revert UI on error
            setLiked(liked);
        }
    };

    const handleShare = async () => {
        // ...existing share logic
        setShares(prev => prev + 1);
        const token = localStorage.getItem('token');
        try {
            await sharePost(token!, id);
        } catch (e) {
            // Optionally revert UI on error
            setShares(prev => prev - 1);
        }
    };

    return (
        <Card className="bg-white border border-gray-200 shadow-none rounded-lg mb-0 overflow-hidden">
            {/* Post Header */}
            <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-900">
                        {username}
                    </span>
                    <span className="text-xs text-gray-500 font-normal">
                        {formatTimestamp(createdAt)}
                    </span>
                </div>
            </div>

            {/* Image */}
            <div className="relative aspect-square bg-gray-50">
                <img
                    src={imageUrl}
                    alt={`Post by ${username}`}
                    className="w-full h-full object-cover"
                    onError={e => {
                        console.error('Image failed to load:', imageUrl);
                        e.currentTarget.style.display = 'none';
                    }}
                />
            </div>

            {/* Action Bar */}
            <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-2 p-0 h-auto hover:bg-transparent transition-all duration-200 ${
                            liked
                                ? 'text-red-500 hover:text-red-600'
                                : 'text-gray-900 hover:text-gray-600'
                        }`}
                        onClick={handleLike}
                    >
                        <Heart
                            className={`h-6 w-6 transition-all duration-200 ${
                                liked
                                    ? 'fill-current scale-110'
                                    : 'hover:scale-110'
                            }`}
                        />
                        <span className="text-sm font-semibold">{likes}</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 p-0 h-auto text-gray-900 hover:text-gray-600 hover:bg-transparent transition-all duration-200"
                        onClick={handleShare}
                    >
                        <Share className="h-6 w-6 hover:scale-110 transition-all duration-200" />
                        <span className="text-sm font-semibold">{shares}</span>
                    </Button>
                </div>

                {/* Caption */}
                <div className="text-sm leading-relaxed">
                    <span className="font-semibold text-gray-900 mr-2">
                        {username}
                    </span>
                    <span className="text-gray-900">{caption}</span>
                </div>
            </div>
        </Card>
    );
};

export default PostCard;
