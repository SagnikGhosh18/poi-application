import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreatePostModal from '@/pages/CreatePost';
import { useState } from 'react';

const Header = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
            <CreatePostModal
                open={showCreateModal}
                onOpenChange={setShowCreateModal}
            />
            <div className="flex items-center justify-between px-4 h-14">
                <h1 className="text-xl font-bold text-primary font-lato">
                    Visitagram
                </h1>

                {/* Create Post button - only visible on tablet/desktop */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex text-primary hover:text-primary hover:bg-primary/10"
                    onClick={() => {
                        // Navigate to create post - will implement with routing
                        setShowCreateModal(true);
                    }}
                >
                    <Camera className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
};

export default Header;
