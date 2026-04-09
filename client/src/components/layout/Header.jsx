import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationBell from '../common/NotificationBell';
import Modal from '../common/Modal';

const Header = () => {
    const { user, logout, isAdmin } = useAuth();
    const { unreadCount } = useNotifications(user);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const location = useLocation();

    // Helper to check active path
    const isActive = (path) => location.pathname === path;
    const isBookingsActive = location.pathname.includes('booking');

    const handleLogoutClick = () => {
        setIsMenuOpen(false);
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        setShowLogoutConfirm(false);
        logout();
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center gap-2 no-underline text-dark text-2xl font-bold">
                            <img src="/logo.png" alt="Hades House Logo" className="h-12 md:h-14 w-auto object-contain drop-shadow-sm" />
                            <span className="hidden sm:block">Hades House</span>
                            <span className="sm:hidden text-xl pt-1">Hades House</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link to="/" className="no-underline text-secondary font-medium hover:text-primary transition-all">
                            Trang chủ
                        </Link>
                        {!user && (
                            <Link to="/booking-search" className="no-underline text-secondary font-medium hover:text-primary transition-all">
                                Tra cứu booking
                            </Link>
                        )}

                        {user ? (
                            <>
                                {isAdmin ? (
                                    <Link to="/admin" className="no-underline text-secondary font-medium hover:text-primary transition-all">
                                        Quản lý
                                    </Link>
                                ) : (
                                    <Link to={user.phone ? `/booking-list?phone=${user.phone}` : '/booking-search'} className="no-underline text-secondary font-medium hover:text-primary transition-all">
                                        Đặt phòng của tôi
                                    </Link>
                                )}
                                <NotificationBell />
                                <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                                    <span className="font-semibold text-dark truncate max-w-[150px]">{user.name}</span>
                                    <button
                                        onClick={handleLogoutClick}
                                        className="px-4 py-2 bg-light border border-border rounded-lg cursor-pointer transition-all hover:bg-border text-sm"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="no-underline text-secondary font-medium hover:text-primary transition-all">
                                    Đăng nhập
                                </Link>
                                <Link to="/register" className="px-5 py-2.5 bg-primary text-white rounded-lg font-semibold cursor-pointer transition-all hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-custom-lg no-underline text-sm">
                                    Đăng ký
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Mobile Top Controls */}
                    <div className="flex items-center gap-3 md:hidden">
                        {/* Empty intentionally, bell moved to bottom nav */}
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation Bar (App-like) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[100] pb-safe">
                <div className="flex justify-around items-center h-16">
                    {/* Home */}
                    <Link to="/" className={`flex flex-col items-center justify-center w-full h-full no-underline ${isActive('/') ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/') ? "2.5" : "2"} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-[10px] font-medium">Trang chủ</span>
                    </Link>

                    {/* Search / My Bookings / Admin */}
                    {isAdmin ? (
                        <Link to="/admin" className={`flex flex-col items-center justify-center w-full h-full no-underline ${location.pathname.startsWith('/admin') ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
                            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={location.pathname.startsWith('/admin') ? "2.5" : "2"} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={location.pathname.startsWith('/admin') ? "2.5" : "2"} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-[10px] font-medium">Quản lý</span>
                        </Link>
                    ) : (
                        <Link to={user?.phone ? `/booking-list?phone=${user.phone}` : '/booking-search'} className={`flex flex-col items-center justify-center w-full h-full no-underline ${isBookingsActive ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
                            {user?.phone ? (
                                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isBookingsActive ? "2.5" : "2"} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isBookingsActive ? "2.5" : "2"} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            )}
                            <span className="text-[10px] font-medium">{user?.phone ? 'Của tôi' : 'Tra cứu'}</span>
                        </Link>
                    )}

                    {/* Contact Menu */}
                    <div onClick={() => setIsContactOpen(true)} className={`flex flex-col items-center justify-center w-full h-full cursor-pointer transition-colors ${isContactOpen ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isContactOpen ? "2.5" : "2"} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-[10px] font-medium">Liên hệ</span>
                    </div>

                    {/* Notifications (Mobile) */}
                    {user && (
                        <Link to="/notifications" className={`flex flex-col items-center justify-center w-full h-full no-underline ${isActive('/notifications') ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
                            <div className="relative flex justify-center">
                                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/notifications') ? "2.5" : "2"} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1.5 min-w-[16px] h-[16px] bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center px-1 border-2 border-white shadow-sm">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium">Thông báo</span>
                        </Link>
                    )}

                    {/* Profile / Menu Drawer Alternative */}
                    {user ? (
                        <div onClick={() => setIsMenuOpen(true)} className={`flex py-2 flex-col items-center justify-center w-full h-full cursor-pointer transition-colors ${isMenuOpen ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
                            <div className="w-6 h-6 mb-1 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold ring-2 ring-transparent">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[10px] font-medium">Tài khoản</span>
                        </div>
                    ) : (
                        <Link to="/login" className="flex flex-col items-center justify-center w-full h-full no-underline text-gray-500 hover:text-gray-900">
                            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-[10px] font-medium">Đăng nhập</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile Drawer (replaces dropdown) */}
            {isMenuOpen && user && (
                <div className="md:hidden fixed inset-0 z-[200] flex justify-end">
                    {/* Overlay */}
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setIsMenuOpen(false)}></div>

                    {/* Drawer */}
                    <div className="relative w-3/4 max-w-sm h-full bg-white shadow-xl flex flex-col animation-slideInRight">
                        <div className="p-6 bg-blue-50/50 border-b border-gray-100 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold text-2xl shadow-sm">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 m-0">{user.name}</h3>
                                <p className="text-sm text-gray-500 m-0">{user.phone || user.email}</p>
                            </div>
                        </div>

                        <div className="p-4 flex flex-col gap-2 flex-1">
                            {isAdmin && (
                                <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 no-underline font-medium">
                                    <span className="text-xl">⚙️</span> Quản lý hệ thống
                                </Link>
                            )}
                            <Link to={user.phone ? `/booking-list?phone=${user.phone}` : '/booking-search'} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 no-underline font-medium">
                                <span className="text-xl">📅</span> Lịch hẹn của tôi
                            </Link>
                        </div>

                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={handleLogoutClick}
                                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 font-bold border-0 cursor-pointer active:bg-red-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Contact Action Sheet */}
            {isContactOpen && (
                <div className="md:hidden fixed inset-0 z-[200] flex justify-center items-end">
                    {/* Overlay */}
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsContactOpen(false)}></div>

                    {/* Sheet */}
                    <div className="relative w-full bg-white rounded-t-3xl shadow-2xl flex flex-col animation-slideUp pb-safe">
                        <div className="flex justify-center p-3">
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                        </div>
                        <div className="px-6 pb-2 text-center">
                            <h3 className="font-bold text-gray-900 m-0 text-xl">Liên hệ hỗ trợ</h3>
                            <p className="text-sm text-gray-500 mt-2 mb-6">Chọn kênh liên hệ để được tư vấn nhanh nhất</p>
                        </div>

                        <div className="px-6 pb-8 flex flex-col gap-3">
                            {/* Zalo */}
                            <a href="https://zalo.me/0919723728" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-[#e5f1ff] text-[#0068ff] no-underline font-semibold text-lg transition-transform active:scale-95 border border-blue-100">
                                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#0068ff] text-white font-bold tracking-wider shadow-sm shadow-blue-200">
                                    <span style={{ fontSize: '14px' }}>Zalo</span>
                                </span>
                                Chat qua Zalo
                            </a>

                            {/* Facebook */}
                            <a href="https://www.facebook.com/natdev05.10/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-[#e8f0fe] text-[#1877F2] no-underline font-semibold text-lg transition-transform active:scale-95 border border-blue-50">
                                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#1877F2] text-white shadow-sm shadow-blue-100">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                </span>
                                Nhắn tin Facebook
                            </a>

                            {/* Hotline */}
                            <a href="tel:0919723728" className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 text-gray-800 no-underline font-semibold text-lg transition-transform active:scale-95 border border-gray-100">
                                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 text-white shadow-sm shadow-gray-200">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                </span>
                                Gọi 0919.723.728
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Modal */}
            <Modal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                title="Xác nhận đăng xuất"
                actions={
                    <>
                        <button
                            onClick={() => setShowLogoutConfirm(false)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border-0 cursor-pointer font-medium"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={confirmLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors border-0 cursor-pointer font-medium"
                        >
                            Đăng xuất
                        </button>
                    </>
                }
            >
                <div className="flex flex-col gap-2">
                    <p className="m-0 text-base">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản của mình?</p>
                </div>
            </Modal>

            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animation-slideInRight {
                    animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animation-slideUp {
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                /* Safe area padding for newer iPhones */
                .pb-safe {
                    padding-bottom: env(safe-area-inset-bottom);
                }
            `}</style>
        </header>
    );
};

export default Header;
