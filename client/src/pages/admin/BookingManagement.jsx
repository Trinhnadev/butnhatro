import { useState, useEffect } from 'react';
import { bookingAPI } from '../../services/api';
import { formatPrice, formatDateTime, getStatusLabel, getStatusColor } from '../../utils/helpers';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBookings();
    }, [filterStatus]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError(null);
            const params = {};
            if (filterStatus) params.status = filterStatus;

            const response = await bookingAPI.getBookings(params);
            setBookings(response.data.bookings);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh sách đặt phòng');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await bookingAPI.updateBookingStatus(id, newStatus);
            fetchBookings();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể cập nhật trạng thái');
        }
    };

    const filteredBookings = bookings.filter((booking) => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            booking.customerName.toLowerCase().includes(search) ||
            booking.phone.includes(search) ||
            booking.bookingCode.toLowerCase().includes(search)
        );
    });

    if (loading) return <Loading message="Đang tải danh sách đặt phòng..." />;
    if (error) return <ErrorMessage message={error} onRetry={fetchBookings} />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Quản lý đặt phòng</h2>
                <div className="text-sm text-gray-500">
                    Tổng số: <span className="font-bold text-gray-900 ml-1">{filteredBookings.length}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="form-select rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2"
                    >
                        <option value="">Tất cả</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="contacted">Đã liên hệ</option>
                        <option value="scheduled">Đã hẹn</option>
                        <option value="done">Hoàn thành</option>
                        <option value="canceled">Đã hủy</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Tìm kiếm:</label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tên, SĐT, mã đặt phòng..."
                        className="form-input rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2"
                    />
                </div>
            </div>

            {filteredBookings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-500 text-lg">Không tìm thấy đặt phòng nào</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                                <th className="px-6 py-4">Mã</th>
                                <th className="px-6 py-4">Khách hàng</th>
                                <th className="px-6 py-4">SĐT</th>
                                <th className="px-6 py-4">Phòng</th>
                                <th className="px-6 py-4">Số người</th>
                                <th className="px-6 py-4">Ngày nhận</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Ngày đặt</th>
                                <th className="px-6 py-4">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded text-xs">
                                            {booking.bookingCode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{booking.customerName}</td>
                                    <td className="px-6 py-4 text-gray-600 font-mono text-sm">{booking.phone}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">{booking.roomId?.title || 'Phòng đã xóa'}</div>
                                            <div className="text-blue-600 font-medium text-xs mt-0.5">{formatPrice(booking.roomId?.priceMonthly || 0)}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-600">{booking.peopleCount}</td>
                                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap text-sm">{formatDateTime(booking.moveInDate).split(' ')[0]}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border"
                                            style={{
                                                backgroundColor: `${getStatusColor(booking.status)}20`,
                                                color: getStatusColor(booking.status),
                                                borderColor: `${getStatusColor(booking.status)}30`
                                            }}
                                        >
                                            {getStatusLabel(booking.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">{formatDateTime(booking.createdAt)}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={booking.status}
                                            onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs py-1.5"
                                        >
                                            <option value="pending">Chờ xử lý</option>
                                            <option value="contacted">Đã liên hệ</option>
                                            <option value="scheduled">Đã hẹn</option>
                                            <option value="done">Hoàn thành</option>
                                            <option value="canceled">Đã hủy</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BookingManagement;
