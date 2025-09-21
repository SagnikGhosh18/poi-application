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
};

export default App;
