// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home, NotFound } from './pages';
import { useEffect, useState } from 'react';
import { getToken } from '@/services/authService';
import AuthModal from '@/components/authmodal/AuthModal';

const App = () => {
    const [showAuth, setShowAuth] = useState(false);

    useEffect(() => {
        if (!getToken()) setShowAuth(true);
    }, []);

    const handleAuth = () => setShowAuth(false);
    return (
        <>
            {showAuth && <AuthModal open={showAuth} onOpenChange={setShowAuth} />}
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </>
    );
    // <QueryClientProvider client={queryClient}>
    //   <TooltipProvider>
    //     <Toaster />
    //     <Sonner />

    //   </TooltipProvider>
    // </QueryClientProvider>
};

export default App;
