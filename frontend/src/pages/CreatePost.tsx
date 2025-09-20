import { useState } from 'react';
import { Camera, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface CreatePostModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const CreatePostModal = ({ open, onOpenChange }: CreatePostModalProps) => {
    const [step, setStep] = useState<'camera' | 'preview'>('camera');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCapture = () => {
        // Simulate image capture
        setCapturedImage(
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=600&fit=crop'
        );
        setStep('preview');
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setStep('camera');
    };

    const handlePost = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Reset form and close modal
        setStep('camera');
        setCapturedImage(null);
        setCaption('');
        setIsLoading(false);
        onOpenChange(false);

        // TODO: Add new post to timeline and show success toast
        console.log('Post created successfully!');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-bold font-lato">
                        {step === 'camera' ? 'Take a Photo' : 'Create Post'}
                    </DialogTitle>
                </DialogHeader>

                {step === 'camera' && (
                    <div className="space-y-4">
                        {/* Camera placeholder */}
                        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                                <Camera className="h-16 w-16 mx-auto mb-2" />
                                <p className="font-lato">
                                    Camera access needed
                                </p>
                                <p className="text-sm font-light font-lato">
                                    Click capture to simulate taking a photo
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={handleCapture}
                            className="w-full font-lato"
                            size="lg"
                        >
                            <Camera className="h-5 w-5 mr-2" />
                            Capture
                        </Button>
                    </div>
                )}

                {step === 'preview' && capturedImage && (
                    <div className="space-y-4">
                        {/* Image Preview */}
                        <div className="relative">
                            <img
                                src={capturedImage}
                                alt="Captured"
                                className="w-full aspect-square object-cover rounded-lg"
                            />
                        </div>

                        {/* Caption Input */}
                        <Textarea
                            placeholder="Write a caption..."
                            value={caption}
                            onChange={e => setCaption(e.target.value)}
                            className="resize-none font-lato"
                            rows={3}
                        />

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleRetake}
                                className="flex-1 font-lato"
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Retake
                            </Button>

                            <Button
                                onClick={handlePost}
                                disabled={isLoading}
                                className="flex-1 font-lato"
                            >
                                {isLoading ? 'Posting...' : 'Post'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default CreatePostModal;
