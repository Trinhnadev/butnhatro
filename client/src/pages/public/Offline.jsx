import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Offline = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [reconnecting, setReconnecting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setReconnecting(true);
            // NetworkMonitor sẽ xử lý redirect, nhưng nếu user vào /offline thủ công thì tự về home
            setTimeout(() => navigate('/', { replace: true }), 1500);
        };
        const handleOffline = () => {
            setIsOnline(false);
            setReconnecting(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [navigate]);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background circles decoration */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 60%)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.04)', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)', pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.06)', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)', pointerEvents: 'none'
            }} />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1, maxWidth: '400px', width: '100%' }}>

                {/* Animated icon */}
                <div style={{
                    width: '100px', height: '100px',
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '28px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 32px',
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 20px 40px rgba(0,0,0,0.4)',
                    animation: isOnline ? 'none' : 'float 3s ease-in-out infinite',
                    transition: 'all 0.5s ease'
                }}>
                    <span style={{ fontSize: '44px' }}>
                        {reconnecting ? '✅' : isOnline ? '🌐' : '📡'}
                    </span>
                </div>

                <h1 style={{
                    fontSize: '28px', fontWeight: 800,
                    marginBottom: '12px', letterSpacing: '-0.5px',
                    transition: 'all 0.3s ease'
                }}>
                    {reconnecting ? 'Đã kết nối lại!' : 'Không có kết nối'}
                </h1>

                <p style={{
                    color: '#6b7280', fontSize: '15px', lineHeight: 1.6,
                    marginBottom: '28px', transition: 'all 0.3s ease'
                }}>
                    {reconnecting
                        ? 'Đang đưa bạn trở lại ứng dụng...'
                        : 'Vui lòng kiểm tra kết nối mạng. Ứng dụng sẽ tự động tiếp tục khi có mạng trở lại.'
                    }
                </p>

                {/* Network status badge */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isOnline ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    borderRadius: '100px', padding: '8px 18px',
                    marginBottom: '32px', fontSize: '13px', color: '#9ca3af',
                    transition: 'all 0.4s ease'
                }}>
                    <span style={{
                        width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                        background: isOnline ? '#22c55e' : '#ef4444',
                        boxShadow: isOnline ? '0 0 8px #22c55e' : 'none',
                        animation: isOnline ? 'none' : 'blink 1.5s ease-in-out infinite',
                    }} />
                    {reconnecting
                        ? 'Đã có kết nối – đang chuyển hướng...'
                        : 'Đang ngoại tuyến · Chờ kết nối...'
                    }
                </div>

                {/* Action buttons */}
                {!reconnecting && (
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
                        <button
                            onClick={() => window.location.reload()}
                            id="offline-retry-btn"
                            style={{
                                padding: '12px 28px',
                                background: 'white', color: '#111111',
                                border: 'none', borderRadius: '12px',
                                fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(255,255,255,0.15)'
                            }}
                            onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 20px rgba(255,255,255,0.25)'; }}
                            onMouseLeave={e => { e.target.style.transform = ''; e.target.style.boxShadow = '0 4px 12px rgba(255,255,255,0.15)'; }}
                        >
                            🔄 Tải lại trang
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            id="offline-home-btn"
                            style={{
                                padding: '12px 22px',
                                background: 'rgba(255,255,255,0.08)',
                                color: '#d1d5db',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.12)'}
                            onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
                        >
                            🏠 Trang chủ
                        </button>
                    </div>
                )}

                {/* Loading spinner khi đang reconnect */}
                {reconnecting && (
                    <div style={{
                        width: '36px', height: '36px', margin: '0 auto 40px',
                        border: '3px solid rgba(255,255,255,0.1)',
                        borderTop: '3px solid white',
                        borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite'
                    }} />
                )}

                {/* Tips */}
                {!reconnecting && (
                    <div style={{
                        padding: '20px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '16px', textAlign: 'left'
                    }}>
                        <div style={{
                            fontSize: '11px', color: '#4b5563', fontWeight: 700,
                            marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em'
                        }}>
                            Gợi ý xử lý
                        </div>
                        {[
                            'Kiểm tra WiFi hoặc dữ liệu di động',
                            'Tắt và bật lại chế độ máy bay',
                            'Thử kết nối với mạng khác',
                        ].map((tip, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                fontSize: '13px', color: '#6b7280',
                                marginBottom: i < 2 ? '8px' : 0
                            }}>
                                <span style={{
                                    width: '5px', height: '5px', borderRadius: '50%',
                                    background: '#374151', flexShrink: 0
                                }} />
                                {tip}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Offline;
