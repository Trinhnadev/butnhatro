import { useState, useEffect } from 'react';

const ContactButtons = () => {
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        // Initial expand after 2 seconds (for demo)
        const initialTimer = setTimeout(() => {
            setExpanded(true);
            setTimeout(() => {
                setExpanded(false);
            }, 5000);
        }, 2000);

        // Auto-expand every 20 seconds
        const interval = setInterval(() => {
            setExpanded(true);
            // Auto-collapse after 5 seconds
            setTimeout(() => {
                setExpanded(false);
            }, 5000);
        }, 20000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    const handleToggle = () => {
        setExpanded(!expanded);
    };

    return (
        <>
            {/* Floating Contact Bar - Desktop */}
            <div className="hidden md:block fixed bottom-8 right-8 z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-3 border-2 border-primary/20">
                    <div className="text-center mb-2">
                        <p className="font-bold text-gray-800 text-xs">Liên hệ ngay</p>
                        <p className="text-[10px] text-gray-500">Hỗ trợ 24/7</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        {/* Zalo Button */}
                        <a
                            href="https://zalo.me/0919723728"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:scale-105 hover:from-blue-600 hover:to-blue-700"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none">
                                <circle cx="24" cy="24" r="20" fill="white" />
                                <path d="M24 8C14.06 8 6 15.37 6 24.5c0 5.63 3.06 10.58 7.69 13.56.19.12.31.31.34.53l.26 2.88c.03.34.38.57.69.45l3.47-1.53c.13-.06.28-.07.42-.04 1.44.31 2.96.48 4.52.48 9.94 0 18-7.37 18-16.5S33.94 8 24 8z" fill="#0068FF" />
                                <path d="M17 26.5h6.5v1.5H17v-1.5zm0-3.5h10.5v1.5H17V23zm0-3.5h10.5v1.5H17v-1.5z" fill="white" />
                            </svg>
                            <span>Chat Zalo</span>
                        </a>

                        {/* Facebook Button */}
                        <a
                            href="https://m.me/nguyenanhtrinh"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:scale-105 hover:from-blue-700 hover:to-blue-800"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            <span>Chat Facebook</span>
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContactButtons;
