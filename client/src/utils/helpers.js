// Format price to Vietnamese currency
export const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
};

// Format date
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

// Format datetime
export const formatDateTime = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Get status badge color
export const getStatusColor = (status) => {
    const colors = {
        pending: '#f59e0b',
        contacted: '#3b82f6',
        scheduled: '#8b5cf6',
        done: '#10b981',
        canceled: '#ef4444',
    };
    return colors[status] || '#6b7280';
};

// Get status label in Vietnamese
export const getStatusLabel = (status) => {
    const labels = {
        pending: 'Chờ xử lý',
        contacted: 'Đã liên hệ',
        scheduled: 'Đã hẹn',
        done: 'Hoàn thành',
        canceled: 'Đã hủy',
    };
    return labels[status] || status;
};

// Validate Vietnamese phone number
export const isValidPhone = (phone) => {
    return /^(0|\+84)[0-9]{9,10}$/.test(phone);
};

// Truncate text
export const truncate = (text, length = 100) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
};
