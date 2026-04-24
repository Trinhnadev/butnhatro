import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Modal from '../../components/common/Modal';
import { formatPrice } from '../../utils/helpers';
import Pagination from '../../components/common/Pagination';

const BookingList = () => {
    const [searchParams] = useSearchParams();
    const phone = searchParams.get('phone');

    // Filters
    const [streetFilter, setStreetFilter] = useState('');
    const [codeFilter, setCodeFilter] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [isFilterExpanded, setIsFilterExpanded] = useState(false);

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancelingId, setCancelingId] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0,
        limit: 10
    });

    const [modalState, setModalState] = useState({
        isOpen: false,
        type: null, // 'login', 'confirmCancel', 'message'
        title: '',
        message: '',
        bookingToCancel: null,
    });

    const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        if (phone) {
            fetchBookings();
        }
    }, [phone, currentPage]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await bookingAPI.searchBookings(phone, {
                page: currentPage,
                limit: 10
            });
            setBookings(response.data.bookings || []);
            setPagination(response.data.pagination || { page: 1, pages: 1, total: (response.data.bookings || []).length, limit: 10 });
        } catch (err) {
            console.error(err);
            setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    const filteredBookings = bookings.filter(booking => {
        // Filter by street/location
        const streetMatch = !streetFilter ||
            (booking.roomId && booking.roomId.location &&
                (booking.roomId.location.street.toLowerCase().includes(streetFilter.toLowerCase()) ||
                    booking.roomId.location.streetAddress.toLowerCase().includes(streetFilter.toLowerCase())));

        // Filter by booking code
        const codeMatch = !codeFilter || booking.bookingCode.toLowerCase().includes(codeFilter.toLowerCase());

        // Filter by date range
        if (!dateRange.start && !dateRange.end) return streetMatch && codeMatch;

        const bookingDate = new Date(booking.createdAt);
        const start = dateRange.start ? new Date(dateRange.start) : new Date('1970-01-01');
        const end = dateRange.end ? new Date(dateRange.end) : new Date();
        if (dateRange.end) end.setHours(23, 59, 59, 999);

        const dateMatch = bookingDate >= start && bookingDate <= end;

        return streetMatch && codeMatch && dateMatch;
    });

    const canCancel = (booking) => {
        // Không hủy booking đã hủy hoặc hoàn thành
        if (booking.status === 'canceled' || booking.status === 'done') return false;
        // Nếu không có viewTime → cho phép hủy (sẽ yêu cầu đăng nhập nếu ấn vào)
        if (!booking.viewTime) return true;
        // Chỉ hiện nút hủy nếu giờ xem CHƯA qua
        const viewTimePassed = new Date(booking.viewTime) <= new Date();
        return !viewTimePassed;
    };

    const handleCancelClick = (booking) => {
        if (!user) {
            setModalState({
                isOpen: true,
                type: 'login',
                title: 'Yêu cầu đăng nhập',
                message: 'Vui lòng đăng nhập vào hệ thống để có quyền hủy lịch hẹn này.',
                bookingToCancel: null,
            });
            return;
        }

        setModalState({
            isOpen: true,
            type: 'confirmCancel',
            title: 'Xác nhận hủy lịch hẹn',
            message: `Bạn có chắc chắn muốn hủy yêu cầu đặt phòng mã ${booking.bookingCode} không? Hành động này sẽ thông báo cho quản trị viên và không thể hoàn tác.`,
            bookingToCancel: booking,
        });
    };

    const confirmCancel = async () => {
        const booking = modalState.bookingToCancel;
        if (!booking) return;

        try {
            setCancelingId(booking._id);
            closeModal(); // Đóng modal xác nhận
            await bookingAPI.cancelBooking(booking._id);
            setBookings(prev => prev.map(b =>
                b._id === booking._id ? { ...b, status: 'canceled' } : b
            ));
            
            // Xong thì báo modal thành công
            setTimeout(() => {
                setModalState({
                    isOpen: true,
                    type: 'message',
                    title: 'Hủy thành công',
                    message: 'Lịch hẹn của bạn đã được hủy bỏ.',
                    bookingToCancel: null,
                });
            }, 100);
        } catch (err) {
            const status = err.response?.status;
            const msg = err.response?.data?.message || 'Không thể hủy booking. Vui lòng thử lại.';
            
            setTimeout(() => {
                if (status === 401 || status === 403) {
                    setModalState({
                        isOpen: true,
                        type: 'login',
                        title: 'Tài khoản không hợp lệ',
                        message: msg,
                        bookingToCancel: null,
                    });
                } else {
                    setModalState({
                        isOpen: true,
                        type: 'message',
                        title: 'Lỗi',
                        message: msg,
                        bookingToCancel: null,
                    });
                }
            }, 100);
        } finally {
            setCancelingId(null);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            contacted: 'bg-blue-100 text-blue-800',
            scheduled: 'bg-purple-100 text-purple-800',
            done: 'bg-green-100 text-green-800',
            canceled: 'bg-red-100 text-red-800',
        };

        const labels = {
            pending: 'Đang chờ',
            contacted: 'Đã liên hệ',
            scheduled: 'Đã hẹn',
            done: 'Hoàn thành',
            canceled: 'Đã hủy',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (loading) return <Loading message="Đang tìm kiếm..." />;
    if (error) return <ErrorMessage message={error} />;

    // No phone provided
    if (!phone) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-4">Vui lòng nhập số điện thoại</h2>
                <Link to="/booking-search" className="text-primary hover:underline">Quay lại trang tìm kiếm</Link>
            </div>
        );
    }

    return (
        <div className="py-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Danh sách đặt phòng</h1>
                        <p className="text-gray-500">Số điện thoại: <span className="font-semibold text-primary">{phone}</span></p>
                    </div>
                    <Link to="/booking-search" className="text-gray-600 hover:text-primary transition-colors">
                        ← Tìm số khác
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center">
                        <div className="w-full lg:w-1/4">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Mã đặt phòng</label>
                            <input
                                type="text"
                                placeholder="Nhập mã BK..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary focus:outline-none"
                                value={codeFilter}
                                onChange={(e) => setCodeFilter(e.target.value)}
                            />
                        </div>

                        {/* Mobile Toggle Button */}
                        <button
                            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                            className="lg:hidden w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <span>{isFilterExpanded ? 'Thu gọn bộ lọc' : 'Thêm bộ lọc tìm kiếm'}</span>
                            <svg className={`w-4 h-4 transition-transform ${isFilterExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Collapsible Section on Mobile, Always visible on Desktop */}
                        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full lg:flex-1 ${isFilterExpanded ? 'block' : 'hidden lg:grid'}`}>
                            <div className="w-full">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Tìm theo tên đường</label>
                                <input
                                    type="text"
                                    placeholder="Nhập tên đường..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary focus:outline-none"
                                    value={streetFilter}
                                    onChange={(e) => setStreetFilter(e.target.value)}
                                />
                            </div>
                            <div className="w-full">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Từ ngày</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary focus:outline-none"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                />
                            </div>
                            <div className="w-full">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Đến ngày</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary focus:outline-none"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => { setStreetFilter(''); setCodeFilter(''); setDateRange({ start: '', end: '' }); }}
                            className={`px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors h-[38px] w-full lg:w-auto flex-shrink-0 ${isFilterExpanded ? 'block' : 'hidden lg:block'}`}
                        >
                            Xóa lọc
                        </button>
                    </div>
                </div>

                {filteredBookings.length === 0 ? (
                    <div className="text-center bg-white p-12 rounded-2xl shadow-sm">
                        <span className="text-4xl mb-4 block">📭</span>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy yêu cầu nào</h3>
                        <p className="text-gray-500">Không có lịch đặt phòng nào cho số điện thoại này hoặc không khớp với bộ lọc.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-6">
                            {filteredBookings.map((booking) => (
                                <div key={booking._id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-100">
                                    <div className="p-6">
                                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-100 pb-4 mb-4">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-bold text-gray-900">Mã: {booking.bookingCode}</h3>
                                                    {getStatusBadge(booking.status)}
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">Ngày tạo: {new Date(booking.createdAt).toLocaleString('vi-VN')}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-xs text-gray-500 uppercase font-semibold tracking-wider">Lịch hẹn xem phòng</span>
                                                <span className="text-lg font-bold text-primary">
                                                    {booking.viewTime ? new Date(booking.viewTime).toLocaleString('vi-VN', {
                                                        weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                                                    }) : 'Chưa xếp lịch'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Room Info */}
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Thông tin phòng</h4>
                                                {booking.roomId ? (
                                                    <div className="flex gap-4">
                                                        {booking.roomId.images && booking.roomId.images[0] && (
                                                            <img
                                                                src={booking.roomId.images[0].url || booking.roomId.images[0]}
                                                                alt={booking.roomId.title}
                                                                className="w-20 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100?text=No+Image'; }}
                                                            />
                                                        )}
                                                        <div>
                                                            <Link to={`/rooms/${booking.roomId._id}`} className="font-medium text-gray-900 hover:text-primary transition-colors line-clamp-1">
                                                                {booking.roomId.title}
                                                            </Link>
                                                            <p className="text-primary font-bold mt-1 text-sm">{booking.roomId.priceMonthly} Triệu/tháng</p>
                                                            <p className="text-gray-500 text-xs mt-1">
                                                                📍 {booking.roomId.location.streetAddress}, {booking.roomId.location.street}, {booking.roomId.location.city}
                                                            </p>
                                                            <a
                                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                                                    `${booking.roomId.location.streetAddress}, ${booking.roomId.location.street}, ${booking.roomId.location.city}`
                                                                )}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium mt-2 hover:underline"
                                                            >
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                Xem bản đồ
                                                            </a>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-red-500 italic">Phòng này không còn tồn tại</p>
                                                )}
                                            </div>

                                            {/* Booking Details */}
                                            <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Chi tiết yêu cầu</h4>
                                                <div className="grid grid-cols-2 gap-y-2 text-sm">
                                                    <span className="text-gray-500">Khách hàng:</span>
                                                    <span className="font-medium">{booking.customerName}</span>

                                                    <span className="text-gray-500">Số người:</span>
                                                    <span className="font-medium">{booking.peopleCount}</span>

                                                    <span className="text-gray-500">Dự kiến vào:</span>
                                                    <span className="font-medium">{new Date(booking.moveInDate).toLocaleDateString('vi-VN')}</span>

                                                    <span className="text-gray-500">Ngân sách:</span>
                                                    <span className="font-medium">{booking.budgetMax ? `${booking.budgetMax} Triệu` : '-'}</span>
                                                </div>
                                                {booking.notes && (
                                                    <div className="mt-3 bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic">
                                                        "{booking.notes}"
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Cancel Button */}
                                        {canCancel(booking) && (
                                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                                <button
                                                    onClick={() => handleCancelClick(booking)}
                                                    disabled={cancelingId === booking._id}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {cancelingId === booking._id ? (
                                                        <>
                                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                                            </svg>
                                                            Đang hủy...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            Hủy lịch hẹn
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Pagination
                            pagination={pagination}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </>
                )}
            </div>

            <Modal 
                isOpen={modalState.isOpen} 
                onClose={closeModal}
                title={modalState.title}
                actions={
                    modalState.type === 'login' ? (
                        <>
                            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Đóng</button>
                            <button onClick={() => { closeModal(); navigate('/login'); }} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm">Đến trang Đăng nhập</button>
                        </>
                    ) : modalState.type === 'confirmCancel' ? (
                        <>
                            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Trở lại</button>
                            <button onClick={confirmCancel} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm">Chắc chắn hủy</button>
                        </>
                    ) : (
                        <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm">Đã hiểu</button>
                    )
                }
            >
                <div className={`text-[15px] ${modalState.type === 'confirmCancel' ? 'text-red-700 bg-red-50 p-4 rounded-xl border border-red-100' : ''}`}>
                    {modalState.message}
                </div>
            </Modal>
        </div>
    );
};

export default BookingList;
