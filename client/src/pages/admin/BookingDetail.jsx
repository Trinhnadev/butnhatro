import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI } from '../../services/api';
import { formatPrice, formatDateTime, formatDate, getStatusLabel, getStatusColor } from '../../utils/helpers';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const BookingDetail = () => {
    const { id } = useParams();
    const { isAdmin } = useAuth();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchBooking();
    }, [id]);

    const fetchBooking = async () => {
        try {
            setLoading(true);
            const response = await bookingAPI.getBooking(id);
            setBooking(response.data.booking);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải thông tin đặt phòng');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            setUpdating(true);
            await bookingAPI.updateBookingStatus(id, newStatus);
            // Refresh data to ensure sync
            fetchBooking();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể cập nhật trạng thái');
            setUpdating(false);
        }
    };

    if (loading) return <Loading message="Đang tải thông tin chi tiết..." />;
    if (error) return <ErrorMessage message={error} onRetry={fetchBooking} />;
    if (!booking) return <ErrorMessage message="Không tìm thấy đặt phòng" />;

    const STATUS_STYLES = {
        pending: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20',
        scheduled: 'bg-violet-50 text-violet-700 border-violet-200 ring-violet-600/20',
        done: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
        canceled: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20',
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="bg-white shadow-sm mb-6 md:mb-8">
                <div className="container mx-auto px-4 py-4 md:py-6">
                    <div className="flex items-center gap-4 mb-4 md:mb-2">
                        <Link to="/admin" className="text-gray-500 hover:text-blue-600 transition-colors inline-block pb-safe">
                            ← Quay lại Danh sách
                        </Link>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                                Đơn đặt phòng <span className="text-blue-600">#{booking.bookingCode}</span>
                            </h1>
                            <div className="flex w-full md:w-auto">
                                <span className={`inline-flex w-full md:w-auto justify-center items-center px-4 py-1.5 rounded-lg text-sm font-bold border shadow-sm ${STATUS_STYLES[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                                    <span className="w-2.5 h-2.5 rounded-full bg-current mr-2 animate-pulse"></span>
                                    {getStatusLabel(booking.status)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Customer & Booking Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Admin Action Card (Moved to top) */}
                        {isAdmin && (
                            <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                    <svg className="w-24 h-24 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 relative z-10">
                                    ⚙️ Thao tác Quản trị
                                </h2>
                                <div className="relative z-10 space-y-3">
                                    <label className="text-sm font-medium text-gray-700 block">Cập nhật nhanh trạng thái đơn:</label>
                                    <div className="relative">
                                        <select
                                            value={booking.status}
                                            onChange={(e) => handleStatusChange(e.target.value)}
                                            disabled={updating}
                                            className={`appearance-none w-full rounded-xl shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-base font-medium py-3 px-4 pr-10 transition-colors outline-none cursor-pointer border-2 ${
                                                updating ? 'bg-gray-100 border-gray-200 opacity-70' : 'bg-white border-blue-200 hover:border-blue-300'
                                            }`}
                                        >
                                            <option value="pending" className="font-medium text-amber-700">Chờ xử lý</option>
                                            <option value="scheduled" className="font-medium text-violet-700">Đã hẹn</option>
                                            <option value="done" className="font-medium text-emerald-700">Hoàn thành</option>
                                            <option value="canceled" className="font-medium text-rose-700">Đã hủy</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                            <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                        </div>
                                    </div>
                                    {updating && <p className="text-xs text-blue-600 font-medium animate-pulse mt-2 text-left">Đang cập nhật...</p>}
                                </div>
                            </div>
                        )}

                        {/* Customer Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                👤 Thông tin khách hàng
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Họ tên</label>
                                    <div className="font-medium text-gray-900 text-lg">{booking.customerName}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Số điện thoại</label>
                                    <div className="font-medium text-gray-900 text-lg">{booking.phone}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email (Đăng ký)</label>
                                    <div className="text-gray-900">{booking.userId?.email || 'Khách vãng lai'}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Số người ở</label>
                                    <div className="text-gray-900">{booking.peopleCount}</div>
                                </div>
                            </div>

                            {booking.notes && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ghi chú từ khách</label>
                                    <div className="bg-gray-50 p-4 rounded-lg text-gray-700 italic border border-gray-200">
                                        "{booking.notes}"
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Timeline Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                📅 Lịch trình
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-4 p-4 rounded-xl mb-4 md:mb-0 border border-blue-50 bg-blue-50/30">
                                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shadow-sm">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 font-medium mb-1">Thời gian xem phòng</div>
                                        <div className="text-xl md:text-2xl font-bold text-gray-900">
                                            {formatDateTime(booking.viewTime)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-xl border border-green-50 bg-green-50/30">
                                    <div className="p-3 bg-green-100 text-green-600 rounded-xl shadow-sm">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 font-medium mb-1">Dự kiến chuyển vào</div>
                                        <div className="text-xl md:text-2xl font-bold text-gray-900">
                                            {formatDate(booking.moveInDate)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between text-xs text-gray-400 mt-2 gap-2 text-center md:text-left">
                            <span>Tạo ngày: {formatDateTime(booking.createdAt)}</span>
                            <span>Cập nhật lần cuối: {formatDateTime(booking.updatedAt)}</span>
                        </div>
                    </div>

                    {/* Right Column - Room Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                🏠 Thông tin phòng
                            </h2>

                            {booking.roomId ? (
                                <div>
                                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100 mb-4 border border-gray-200">
                                        {booking.roomId.images && booking.roomId.images[0] ? (
                                            <img
                                                src={booking.roomId.images[0].url}
                                                alt={booking.roomId.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">Không có ảnh</div>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-gray-900 text-lg mb-1">{booking.roomId.title}</h3>
                                    <p className="text-primary font-bold text-xl mb-4">{booking.roomId.priceMonthly} Triệu/tháng</p>

                                    <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-4">
                                        <div className="flex gap-2">
                                            <span>📍</span>
                                            <span>
                                                {booking.roomId.location.streetAddress}, {booking.roomId.location.street}, {booking.roomId.location.district}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                                        <Link
                                            to={`/rooms/${booking.roomId._id}`}
                                            target="_blank"
                                            className="inline-block w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors border border-gray-200"
                                        >
                                            Xem chi tiết phòng ↗
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                    🚫 Phòng này đã bị xóa khỏi hệ thống
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                💰 Ngân sách khách hàng
                            </h2>
                            <div className="text-center py-6 bg-blue-50 rounded-xl border border-blue-100 shadow-inner">
                                <span className="text-4xl font-bold text-blue-700">{booking.budgetMax}</span>
                                <span className="text-base text-blue-600 font-medium block mt-2">Triệu (Tối đa)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetail;
