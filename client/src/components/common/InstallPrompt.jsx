import { useState, useEffect } from 'react';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSGuide, setShowIOSGuide] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Detect iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(isIOSDevice);

        if (isIOSDevice) {
            // Show iOS guide after 3s if not dismissed before
            const dismissed = localStorage.getItem('pwa-ios-dismissed');
            if (!dismissed) {
                const timer = setTimeout(() => setShowBanner(true), 3000);
                return () => clearTimeout(timer);
            }
            return;
        }

        // Listen for Chrome/Android install prompt
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            const dismissed = localStorage.getItem('pwa-banner-dismissed');
            if (!dismissed) {
                setTimeout(() => setShowBanner(true), 2000);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowBanner(false);
        });

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowBanner(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        localStorage.setItem(isIOS ? 'pwa-ios-dismissed' : 'pwa-banner-dismissed', '1');
    };

    if (isInstalled || !showBanner) return null;

    return (
        <>
            {/* Backdrop blur */}
            <div
                className="fixed inset-0 z-[998]"
                style={{ backdropFilter: 'blur(1px)', background: 'rgba(0,0,0,0.15)' }}
                onClick={handleDismiss}
            />

            {/* Banner */}
            <div
                id="pwa-install-banner"
                className="fixed bottom-5 left-1/2 z-[999]"
                style={{
                    transform: 'translateX(-50%)',
                    width: 'min(420px, calc(100vw - 32px))',
                    animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
            >
                <div style={{
                    background: '#111111',
                    borderRadius: '20px',
                    padding: '20px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
                    color: 'white',
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '14px',
                            background: 'white', padding: '4px', flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}>
                            <img src="/icons/icon-512x512.png" alt="App icon" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '10px' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '3px' }}>
                                Cài đặt ứng dụng
                            </div>
                            <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                                Nhà Trọ Cần Thơ • Miễn phí
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            id="pwa-dismiss-btn"
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '28px', height: '28px',
                                cursor: 'pointer', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '16px', flexShrink: 0
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Features */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr',
                        gap: '8px', marginBottom: '16px'
                    }}>
                        {[
                            { icon: '⚡', text: 'Mở nhanh như native app' },
                            { icon: '📴', text: 'Dùng được khi mất mạng' },
                            { icon: '🔔', text: 'Không tốn dung lượng' },
                            { icon: '🏠', text: 'Tìm phòng nhanh hơn' },
                        ].map((f, i) => (
                            <div key={i} style={{
                                background: 'rgba(255,255,255,0.06)',
                                borderRadius: '10px', padding: '10px 12px',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                <span style={{ fontSize: '16px' }}>{f.icon}</span>
                                <span style={{ fontSize: '12px', color: '#d1d5db', lineHeight: 1.3 }}>{f.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* iOS guide */}
                    {isIOS && showIOSGuide && (
                        <div style={{
                            background: 'rgba(255,255,255,0.06)',
                            borderRadius: '12px', padding: '12px',
                            marginBottom: '14px', fontSize: '13px', color: '#d1d5db'
                        }}>
                            <div style={{ marginBottom: '6px', fontWeight: 600, color: 'white' }}>Cách cài trên iOS:</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div>1. Nhấn nút <strong>Chia sẻ</strong> (□↑) ở thanh Safari</div>
                                <div>2. Chọn <strong>"Thêm vào Màn hình chính"</strong></div>
                                <div>3. Nhấn <strong>Thêm</strong> để hoàn tất</div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {isIOS ? (
                            <button
                                onClick={() => setShowIOSGuide(!showIOSGuide)}
                                id="pwa-ios-guide-btn"
                                style={{
                                    flex: 1, padding: '12px',
                                    background: 'white', color: '#111111',
                                    border: 'none', borderRadius: '12px',
                                    fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                                    transition: 'opacity 0.2s'
                                }}
                                onMouseEnter={e => e.target.style.opacity = '0.9'}
                                onMouseLeave={e => e.target.style.opacity = '1'}
                            >
                                {showIOSGuide ? 'Ẩn hướng dẫn' : '📋 Xem cách cài'}
                            </button>
                        ) : (
                            <button
                                onClick={handleInstall}
                                id="pwa-install-btn"
                                style={{
                                    flex: 1, padding: '12px',
                                    background: 'white', color: '#111111',
                                    border: 'none', borderRadius: '12px',
                                    fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                                    transition: 'opacity 0.2s'
                                }}
                                onMouseEnter={e => e.target.style.opacity = '0.9'}
                                onMouseLeave={e => e.target.style.opacity = '1'}
                            >
                                📲 Cài đặt ngay
                            </button>
                        )}
                        <button
                            onClick={handleDismiss}
                            style={{
                                padding: '12px 16px',
                                background: 'rgba(255,255,255,0.1)',
                                color: '#9ca3af',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                                transition: 'all 0.2s', whiteSpace: 'nowrap'
                            }}
                        >
                            Để sau
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { transform: translateX(-50%) translateY(100px); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
            `}</style>
        </>
    );
};

export default InstallPrompt;
