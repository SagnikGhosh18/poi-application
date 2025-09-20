import { useEffect, useRef, useState } from 'react';
import { Camera, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { createPost } from '@/lib/api';

interface CreatePostModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const CreatePostModal = ({ open, onOpenChange }: CreatePostModalProps) => {
    const [step, setStep] = useState<'camera' | 'preview'>('camera');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Camera refs and state
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (step === 'camera' && open) {
            navigator.mediaDevices
                .getUserMedia({ video: true })
                .then(stream => {
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play();
                    }
                })
                .catch(err => {
                    // Handle error (permission denied, etc)
                    console.error('Camera error:', err);
                });
        }
        // Cleanup on close or step change
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, [step, open]);

    const handleCapture = () => {
        const video = videoRef.current;
        if (!video) return;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            setCapturedImage(dataUrl);
            setStep('preview');
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setStep('camera');
    };

    const handlePost = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        // Simulate API call
        await createPost(token!, capturedImage!, caption);

        // Reset form and close modal
        setStep('camera');
        setCapturedImage(null);
        setCaption('');
        setIsLoading(false);
        onOpenChange(false);

        // TODO: Add new post to timeline and show success toast
        console.log('Post created successfully!');
    };

    const handleModalOpenClose = (isOpen: boolean) => {
        if (!isOpen) {
            setStep('camera');
            setCapturedImage(null);
            setCaption('');
            setIsLoading(false);
        }
        onOpenChange(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleModalOpenClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-bold font-lato">
                        {step === 'camera' ? 'Take a Photo' : 'Create Post'}
                    </DialogTitle>
                </DialogHeader>

                {step === 'camera' && (
                    <div className="space-y-4">
                        {/* Camera preview */}
                        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover rounded-lg"
                                autoPlay
                                playsInline
                                muted
                            />
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
