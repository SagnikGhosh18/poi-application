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
        <Card className="overflow-hidden shadow-card hover:shadow-hover transition-smooth mb-6">
            {/* Post Header */}
            <div className="p-4 pb-3">
                <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground font-lato">
                        {username}
                    </span>
                    <span className="text-sm font-light text-muted-foreground font-lato">
                        {timestamp}
                    </span>
                </div>
            </div>

            {/* Image */}
            <div className="relative">
                <img
                    src={imageUrl}
                    alt={`Post by ${username}`}
                    className="w-full h-auto object-cover"
                />
            </div>

            {/* Action Bar */}
            <div className="p-4 pt-3">
                <div className="flex items-center gap-4 mb-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-2 p-0 h-auto font-light ${
                            liked
                                ? 'text-like hover:text-like'
                                : 'text-muted-foreground hover:text-like'
                        }`}
                        onClick={handleLike}
                    >
                        <Heart
                            className={`h-5 w-5 transition-smooth ${
                                liked ? 'fill-current' : ''
                            }`}
                        />
                        <span className="font-lato">{likes}</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 p-0 h-auto text-muted-foreground hover:text-primary font-light"
                        onClick={handleShare}
                    >
                        <Share className="h-5 w-5" />
                        <span className="font-lato">{shares}</span>
                    </Button>
                </div>

                {/* Caption */}
                <div className="text-sm">
                    <span className="font-bold font-lato mr-2">{username}</span>
                    <span className="font-lato">{caption}</span>
                </div>
            </div>
        </Card>
    );
};

export default PostCard;
