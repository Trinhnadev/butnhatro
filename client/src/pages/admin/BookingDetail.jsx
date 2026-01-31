import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import { formatPrice, formatDateTime, formatDate, getStatusLabel, getStatusColor } from '../../utils/helpers';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const BookingDetail = () => {
    const { id } = useParams();
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
        contacted: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20',
        scheduled: 'bg-violet-50 text-violet-700 border-violet-200 ring-violet-600/20',
        done: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
        canceled: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20',
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="bg-white shadow-sm mb-8">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-4 mb-2">
                        <Link to="/admin" className="text-gray-500 hover:text-blue-600 transition-colors">
                            ← Quay lại Dashboard
                        </Link>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            Chi tiết đặt phòng #{booking.bookingCode}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium border shadow-sm ${STATUS_STYLES[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                                <span className="w-2 h-2 rounded-full bg-current mr-2 opacity-60"></span>
                                {getStatusLabel(booking.status)}
                            </span>
                        </h1>

                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-700">Cập nhật trạng thái:</label>
                            <select
                                value={booking.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                disabled={updating}
                                className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 pl-3 pr-8 min-w-[150px]"
                            >
                                <option value="pending">Chờ xử lý</option>
                                <option value="contacted">Đã liên hệ</option>
                                <option value="scheduled">Đã hẹn</option>
                                <option value="done">Hoàn thành</option>
                                <option value="canceled">Đã hủy</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Customer & Booking Info */}
                    <div className="lg:col-span-2 space-y-6">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                        👁️
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">Thời gian xem phòng</div>
                                        <div className="text-2xl font-bold text-blue-600 mt-1">
                                            {formatDateTime(booking.viewTime)}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">Lịch hẹn khách đã chọn</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                        🚚
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">Dự kiến chuyển vào</div>
                                        <div className="text-2xl font-bold text-green-600 mt-1">
                                            {formatDate(booking.moveInDate)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between text-xs text-gray-400">
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
                            <div className="text-center py-4 bg-blue-50 rounded-xl border border-blue-100">
                                <span className="text-3xl font-bold text-blue-700">{booking.budgetMax}</span>
                                <span className="text-sm text-blue-600 font-medium block mt-1">Triệu (Tối đa)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetail;
