import Timeline from '../components/timeline/Timeline';
import Header from '@/components/layout/Header';

const Index = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Main content with proper spacing for fixed header and bottom nav */}
            <main className="pt-14 pb-20 md:pb-6">
                <div className="py-6">
                    <Timeline />
                </div>
            </main>

            {/* <BottomNav /> */}
        </div>
    );
};

export default Index;
