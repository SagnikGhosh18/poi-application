import { Heart, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

interface PostCardProps {
    id: string;
    username: string;
    imageUrl: string;
    caption: string;
    timestamp: string;
    initialLikes: number;
    initialShares: number;
    isLiked?: boolean;
}

const PostCard = ({
    username,
    imageUrl,
    caption,
    timestamp,
    initialLikes,
    initialShares,
    isLiked = false,
}: PostCardProps) => {
    const [likes, setLikes] = useState(initialLikes);
    const [shares, setShares] = useState(initialShares);
    const [liked, setLiked] = useState(isLiked);

    const handleLike = () => {
        setLiked(!liked);
        setLikes(liked ? likes - 1 : likes + 1);
        // TODO: Send API request to update like status
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `${username}'s post on Vistagram`,
                    text: caption,
                    url: window.location.href,
                });
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(window.location.href);
                // TODO: Show toast notification
                console.log('Link copied to clipboard!');
            }
            setShares(shares + 1);
            // TODO: Send API request to update share count
        } catch (error) {
            console.error('Error sharing:', error);
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
                        {timestamp}
                    </span>
                </div>
            </div>

            {/* Image */}
            <div className="relative aspect-square bg-gray-50">
                <img
                    src={imageUrl}
                    alt={`Post by ${username}`}
                    className="w-full h-full object-cover"
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
                                liked ? 'fill-current scale-110' : 'hover:scale-110'
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
                    <span className="font-semibold text-gray-900 mr-2">{username}</span>
                    <span className="text-gray-900">{caption}</span>
                </div>
            </div>
        </Card>
    );
};

export default PostCard;