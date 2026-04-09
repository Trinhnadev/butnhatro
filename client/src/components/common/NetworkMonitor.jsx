import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * NetworkMonitor - Tự động redirect sang /offline khi mất mạng,
 * và quay lại trang cũ khi có mạng trở lại.
 * Đặt component này bên trong <Router> để dùng useNavigate.
 */
const NetworkMonitor = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // Lưu trang trước khi offline để quay lại sau
    const previousPathRef = useRef(location.pathname);

    useEffect(() => {
        const handleOffline = () => {
            // Lưu lại trang hiện tại (không lưu nếu đang ở /offline)
            if (location.pathname !== '/offline') {
                previousPathRef.current = location.pathname + location.search;
            }
            navigate('/offline', { replace: true });
        };

        const handleOnline = () => {
            // Khi có mạng lại, quay về trang trước đó
            const returnPath = previousPathRef.current || '/';
            navigate(returnPath, { replace: true });
        };

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        // Kiểm tra ngay khi mount (trường hợp app load khi đã offline)
        if (!navigator.onLine && location.pathname !== '/offline') {
            previousPathRef.current = location.pathname + location.search;
            navigate('/offline', { replace: true });
        }

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []); // chỉ mount 1 lần

    return null;
};

export default NetworkMonitor;
