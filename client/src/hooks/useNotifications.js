import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const useNotifications = (user) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const socketRef = useRef(null);

    // Fetch noti từ API
    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const res = await api.get('/notifications');
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.unreadCount || 0);
        } catch (err) {
            console.error('Fetch notifications error:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Kết nối Socket.io + lắng nghe noti mới
    useEffect(() => {
        if (!user) return;

        fetchNotifications();

        const socket = io(SOCKET_URL, { withCredentials: true });
        socketRef.current = socket;

        // Đăng ký vào room của user
        socket.on('connect', () => {
            socket.emit('join', user._id || user.id);
        });

        // Nhận noti mới
        socket.on('notification', (noti) => {
            setNotifications(prev => [noti, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Cập nhật badge trên icon PWA
            if ('setAppBadge' in navigator) {
                navigator.setAppBadge(unreadCount + 1).catch(() => {});
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    // Cập nhật badge khi unreadCount thay đổi
    useEffect(() => {
        if ('setAppBadge' in navigator) {
            if (unreadCount > 0) {
                navigator.setAppBadge(unreadCount).catch(() => {});
            } else {
                navigator.clearAppBadge?.().catch(() => {});
            }
        }
    }, [unreadCount]);

    const markRead = useCallback(async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('markRead error:', err);
        }
    }, []);

    const markAllRead = useCallback(async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            if ('clearAppBadge' in navigator) navigator.clearAppBadge().catch(() => {});
        } catch (err) {
            console.error('markAllRead error:', err);
        }
    }, []);

    return { notifications, unreadCount, loading, markRead, markAllRead, refetch: fetchNotifications };
};
