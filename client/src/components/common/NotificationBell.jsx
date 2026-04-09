import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../context/AuthContext';

const notiIcons = {
    booking_new: '📋',
    booking_approved: '✅',
    booking_scheduled: '📅',
    booking_rejected: '❌',
    booking_canceled: '🚫',
    booking_done: '🏁',
};

const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'vừa xong';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
};

const NotificationBell = () => {
    const { user } = useAuth();
    const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications(user);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    const handleNotiClick = (noti) => {
        if (!noti.read) markRead(noti._id);
    };

    const handleViewDetails = (e, noti) => {
        e.stopPropagation(); 
        if (!noti.read) markRead(noti._id);
        setIsOpen(false);
        
        if (noti.data?.bookingId) {
            if (user?.role === 'admin') {
                navigate(`/admin/bookings/${noti.data.bookingId}`);
            } else {
                if (user?.phone) {
                    navigate(`/booking-list?phone=${user.phone}`);
                } else if (noti.data?.phone) {
                    navigate(`/booking-list?phone=${noti.data.phone}`);
                } else {
                    navigate(`/booking-search`);
                }
            }
        }
    };

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            {/* Bell Button */}
            <button
                id="notification-bell-btn"
                onClick={() => setIsOpen(prev => !prev)}
                style={{
                    position: 'relative',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                    color: '#374151',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                aria-label="Thông báo"
            >
                {/* Bell Icon */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>

                {/* Badge */}
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '2px', right: '2px',
                        minWidth: '18px', height: '18px',
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: '9px',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 4px',
                        lineHeight: 1,
                        border: '2px solid white',
                        animation: 'badgePulse 2s ease-in-out infinite',
                    }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    id="notification-dropdown"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        width: '360px',
                        maxWidth: 'calc(100vw - 16px)',
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                        zIndex: 1000,
                        overflow: 'hidden',
                        animation: 'dropdownSlide 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 16px 12px',
                        borderBottom: '1px solid #f3f4f6',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>Thông báo</span>
                            {unreadCount > 0 && (
                                <span style={{
                                    background: '#111111', color: 'white',
                                    borderRadius: '100px', padding: '1px 8px',
                                    fontSize: '11px', fontWeight: 700
                                }}>
                                    {unreadCount} mới
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                style={{
                                    background: 'none', border: 'none',
                                    color: '#6b7280', fontSize: '12px', fontWeight: 600,
                                    cursor: 'pointer', padding: '4px 8px', borderRadius: '6px',
                                    transition: 'all 0.15s'
                                }}
                                onMouseEnter={e => { e.target.style.background = '#f3f4f6'; e.target.style.color = '#111827'; }}
                                onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.color = '#6b7280'; }}
                            >
                                Đọc tất cả
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                                Đang tải...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                                <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔔</div>
                                <div style={{ color: '#6b7280', fontSize: '14px' }}>Chưa có thông báo nào</div>
                            </div>
                        ) : (
                            (() => {
                                const grouped = {};
                                notifications.forEach(noti => {
                                    const date = new Date(noti.createdAt);
                                    const today = new Date();
                                    const yesterday = new Date(today);
                                    yesterday.setDate(yesterday.getDate() - 1);

                                    let dateLabel = '';
                                    if (date.toDateString() === today.toDateString()) {
                                        dateLabel = 'Hôm nay';
                                    } else if (date.toDateString() === yesterday.toDateString()) {
                                        dateLabel = 'Hôm qua';
                                    } else {
                                        dateLabel = date.toLocaleDateString('vi-VN');
                                    }
                                    if (!grouped[dateLabel]) grouped[dateLabel] = [];
                                    grouped[dateLabel].push(noti);
                                });

                                return Object.entries(grouped).map(([dateLabel, notis]) => (
                                    <div key={dateLabel}>
                                        <div style={{ padding: '8px 16px', background: '#f9fafb', fontSize: '12px', fontWeight: 'bold', color: '#6b7280', borderBottom: '1px solid #f3f4f6', position: 'sticky', top: 0, zIndex: 10 }}>
                                            {dateLabel}
                                        </div>
                                        {notis.map(noti => (
                                            <div
                                    key={noti._id}
                                    onClick={() => handleNotiClick(noti)}
                                    style={{
                                        display: 'flex',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        background: noti.read ? 'white' : '#f8faff',
                                        borderBottom: '1px solid #f9fafb',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s',
                                        position: 'relative',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                                    onMouseLeave={e => e.currentTarget.style.background = noti.read ? 'white' : '#f8faff'}
                                >
                                    {/* Icon */}
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '12px',
                                        background: '#f3f4f6', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        fontSize: '18px', flexShrink: 0,
                                    }}>
                                        {notiIcons[noti.type] || '🔔'}
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontWeight: noti.read ? 500 : 700,
                                            fontSize: '13px', color: '#111827',
                                            marginBottom: '3px', lineHeight: 1.3,
                                        }}>
                                            {noti.title}
                                        </div>
                                        <div style={{
                                            fontSize: '12px', color: '#6b7280',
                                            lineHeight: 1.4,
                                            overflow: 'hidden', textOverflow: 'ellipsis',
                                            display: '-webkit-box', WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                        }}>
                                            {noti.message}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                                            {timeAgo(noti.createdAt)}
                                        </div>

                                        {noti.data?.bookingId && (
                                            <button
                                                onClick={(e) => handleViewDetails(e, noti)}
                                                style={{
                                                    marginTop: '8px',
                                                    padding: '4px 12px',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    color: '#2563eb',
                                                    background: '#eff6ff',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s',
                                                    display: 'inline-block',
                                                }}
                                                onMouseEnter={e => { e.target.style.background = '#dbeafe'; e.target.style.transform = 'translateY(-1px)'; }}
                                                onMouseLeave={e => { e.target.style.background = '#eff6ff'; e.target.style.transform = 'translateY(0)'; }}
                                                onMouseDown={e => { e.target.style.transform = 'translateY(1px)'; }}
                                                onMouseUp={e => { e.target.style.transform = 'translateY(-1px)'; }}
                                            >
                                                Xem chi tiết
                                            </button>
                                        )}
                                    </div>

                                    {/* Unread dot */}
                                    {!noti.read && (
                                        <div style={{
                                            width: '8px', height: '8px', borderRadius: '50%',
                                            background: '#3b82f6', flexShrink: 0,
                                            alignSelf: 'center',
                                        }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    ));
                })()
            )}
                    </div>

                    {/* View All Link */}
                    <div style={{ borderTop: '1px solid #f3f4f6' }}>
                        <button
                            onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                            style={{ width: '100%', padding: '14px', background: '#f9fafb', border: 'none', cursor: 'pointer', color: '#2563eb', fontWeight: 600, fontSize: '14px', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.target.style.background = '#f3f4f6'}
                            onMouseLeave={e => e.target.style.background = '#f9fafb'}
                        >
                            Xem tất cả thông báo →
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes badgePulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                @keyframes dropdownSlide {
                    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};

export default NotificationBell;
