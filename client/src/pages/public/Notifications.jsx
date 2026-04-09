import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';

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

const groupNotificationsByDay = (notifications) => {
    const groups = {};
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

        if (!groups[dateLabel]) groups[dateLabel] = [];
        groups[dateLabel].push(noti);
    });
    return groups;
};

const Notifications = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { notifications, loading, markRead, markAllRead } = useNotifications(user);

    if (loading && notifications.length === 0) return <Loading message="Đang tải thông báo..." />;

    const handleNotiClick = (noti) => {
        if (!noti.read) markRead(noti._id);
        
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

    const groupedNotis = groupNotificationsByDay(notifications);

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl min-h-[calc(100vh-100px)]">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 m-0">Tất cả thông báo</h1>
                </div>
                {notifications.some(n => !n.read) && (
                    <button 
                        onClick={markAllRead}
                        className="text-sm font-medium px-4 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                    >
                        Đánh dấu tất cả đã đọc
                    </button>
                )}
            </div>

            <div className="md:bg-white md:rounded-2xl md:shadow-sm md:border md:border-gray-100 md:overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl shadow-sm border border-gray-100 md:border-none">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Bạn chưa có thông báo nào</h3>
                        <p className="text-gray-500">Các thông báo về lịch đặt phòng sẽ xuất hiện tại đây.</p>
                    </div>
                ) : (
                    <div className="flex flex-col pb-6 md:pb-0">
                        {Object.entries(groupedNotis).map(([dateLabel, notis]) => (
                            <div key={dateLabel}>
                                <div className="bg-transparent md:bg-gray-50/80 px-2 md:px-6 py-3 md:py-2.5 md:border-y md:border-gray-100 first:border-t-0 font-bold text-sm text-gray-500 md:text-gray-700 sticky top-[60px] md:top-0 z-10">
                                    {dateLabel}
                                </div>
                                <div className="flex flex-col gap-3 md:block md:divide-y md:divide-gray-50">
                                    {notis.map(noti => (
                                        <div
                                            key={noti._id}
                                            onClick={() => handleNotiClick(noti)}
                                            className={`p-4 md:p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 cursor-pointer transition-colors rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-gray-100 md:border-0 ${
                                                noti.read 
                                                ? 'bg-white hover:bg-gray-50' 
                                                : 'bg-blue-50/50 hover:bg-blue-100/50 md:bg-blue-50/30 md:hover:bg-blue-50/50 border-blue-100 md:border-transparent relative'
                                            }`}
                                        >
                                            {!noti.read && (
                                                <span className="absolute top-4 left-4 md:top-6 md:left-2 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-50 md:ring-0"></span>
                                            )}
                                            <div className="flex items-center gap-3 max-w-full">
                                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 bg-white shadow-sm border border-gray-100 md:ml-0 ml-4">
                                                    {notiIcons[noti.type] || '🔔'}
                                                </div>
                                                <div className="flex-1 min-w-0 md:hidden">
                                                    <div className="flex flex-col justify-center">
                                                        <span className="text-xs text-gray-500 font-medium">
                                                            {timeAgo(noti.createdAt)}
                                                        </span>
                                                        <h4 className={`text-sm m-0 truncate ${noti.read ? 'font-medium text-gray-800' : 'font-bold text-gray-900'}`}>
                                                            {noti.title}
                                                        </h4>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="hidden md:flex flex-row justify-between items-start gap-1 mb-1">
                                                    <h4 className={`text-base m-0 ${noti.read ? 'font-medium text-gray-800' : 'font-bold text-gray-900'}`}>
                                                        {noti.title}
                                                    </h4>
                                                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                                                        {timeAgo(noti.createdAt)}
                                                    </span>
                                                </div>
                                                <p className={`text-[13px] md:text-sm m-0 leading-relaxed ${noti.read ? 'text-gray-500' : 'text-gray-700'}`}>
                                                    {noti.message}
                                                </p>
                                            </div>
                                            <div className="hidden sm:flex text-gray-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
