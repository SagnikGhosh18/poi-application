import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { login, signup } from '@/services/authService';

interface AuthModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AuthModal({
    open,
    onOpenChange,
}: AuthModalProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                await login(username, password);
            } else {
                await signup(username, password);
            }

            // Reset form
            setUsername('');
            setPassword('');
            setError('');

            onOpenChange(false);
            window.location.reload();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
    };

    const handleModalOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            // Reset form when closing
            setUsername('');
            setPassword('');
            setError('');
            setIsLogin(true);
            setIsLoading(false);
        }
        onOpenChange(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleModalOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-bold font-lato text-center">
                        {isLogin ? 'Login' : 'Sign Up'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username Field */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="username"
                            className="text-sm font-medium font-lato"
                        >
                            Username
                        </Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            disabled={isLoading}
                            className="font-lato"
                        />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="password"
                            className="text-sm font-medium font-lato"
                        >
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            className="font-lato"
                        />
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription className="font-lato">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full font-lato"
                        size="lg"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? isLogin
                                ? 'Logging in...'
                                : 'Signing up...'
                            : isLogin
                              ? 'Login'
                              : 'Sign Up'}
                    </Button>

                    {/* Toggle Mode Button */}
                    <div className="text-center">
                        <Button
                            type="button"
                            variant="link"
                            onClick={toggleMode}
                            disabled={isLoading}
                            className="font-lato text-sm"
                        >
                            {isLogin
                                ? 'Need an account? Sign Up'
                                : 'Already have an account? Login'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
