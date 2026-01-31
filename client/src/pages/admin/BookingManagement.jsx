import { useState, useEffect } from 'react';
import { bookingAPI } from '../../services/api';
import { formatPrice, formatDateTime, formatDate, getStatusLabel, getStatusColor } from '../../utils/helpers';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Filters state
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchBookings();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [filters]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError(null);

            // Remove empty filters
            const params = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );

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

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Status UI Configuration
    const STATUS_STYLES = {
        pending: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20',
        contacted: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20',
        scheduled: 'bg-violet-50 text-violet-700 border-violet-200 ring-violet-600/20',
        done: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
        canceled: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20',
    };

    const handleResetFilters = () => {
        setFilters({
            search: '',
            status: '',
            startDate: '',
            endDate: '',
        });
    };

    // Helper to check if any filter is active
    const hasActiveFilters = filters.search || filters.status || filters.startDate || filters.endDate;

    // We don't return early on loading to keep filter bar visible if possible, 
    // but usually 'loading' is true on initial load.
    // if (loading && !bookings.length) return <Loading message="Đang tải danh sách đặt phòng..." />;
    // if (error) return <ErrorMessage message={error} onRetry={fetchBookings} />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Quản lý đặt phòng</h2>
                    {!loading && bookings && (
                        <div className="text-sm text-gray-500">
                            Tổng số: <span className="font-bold text-gray-900 ml-1">{bookings.length}</span>
                        </div>
                    )}
                </div>

                {/* Mobile Filter Toggle */}
                <button
                    className="md:hidden flex items-center justify-between w-full bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm text-gray-700 font-medium"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <span className="flex items-center gap-2">
                        🔍 Bộ lọc tìm kiếm
                        {hasActiveFilters && (
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        )}
                    </span>
                    <span className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </button>

                {/* Filter Bar */}
                <div className={`bg-white p-4 rounded-xl border border-gray-200 shadow-sm ${showFilters ? 'block' : 'hidden md:block'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1 lg:hidden">Tìm kiếm</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    🔍
                                </span>
                                <input
                                    type="text"
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    placeholder="Tên, SĐT, mã đặt phòng..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 lg:hidden">Trạng thái</label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="pending">Chờ xử lý</option>
                                <option value="contacted">Đã liên hệ</option>
                                <option value="scheduled">Đã hẹn</option>
                                <option value="done">Hoàn thành</option>
                                <option value="canceled">Đã hủy</option>
                            </select>
                        </div>

                        {/* Date Range - Combined or Separate? Let's use 2 inputs for now, 
                            maybe taking up 2 columns or sharing 1 column if space permits.
                            With 5 columns: Search(2) + Status(1) + StartDate(1) + EndDate(1) = 5. 
                            But we need a bit of space for Reset button.
                            Let's make Search(1.5), Status(1), Start(1), End(1), Reset(0.5) roughly?
                            Or just put dates in one flex container.
                        */}
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-500 mb-1 lg:hidden">Từ ngày</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-500 mb-1 lg:hidden">Đến ngày</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Reset Button */}
                        <div className="flex items-end">
                            {hasActiveFilters && (
                                <button
                                    onClick={handleResetFilters}
                                    className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm w-full md:w-auto border border-gray-200 md:border-transparent"
                                >
                                    ✕ Xóa bộ lọc
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {loading && !bookings.length ? (
                <Loading message="Đang tải danh sách đặt phòng..." />
            ) : error ? (
                <ErrorMessage message={error} onRetry={fetchBookings} />
            ) : bookings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-500 text-lg">Không tìm thấy đặt phòng nào</p>
                    {hasActiveFilters && (
                        <button
                            className="mt-4 text-blue-600 font-medium hover:underline"
                            onClick={handleResetFilters}
                        >
                            Xóa bộ lọc
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        )}
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                                    <th className="px-6 py-4">Mã</th>
                                    <th className="px-6 py-4">Khách hàng</th>
                                    <th className="px-6 py-4">Phòng</th>
                                    <th className="px-6 py-4">Ngày xem</th>
                                    <th className="px-6 py-4">Ngày nhận</th>
                                    <th className="px-6 py-4">Trạng thái</th>
                                    <th className="px-6 py-4">Tạo ngày</th>
                                    <th className="px-6 py-4">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded text-xs">
                                                {booking.bookingCode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{booking.customerName}</span>
                                                <span className="text-gray-500 text-xs font-mono">{booking.phone}</span>
                                                <span className="text-gray-400 text-xs">{booking.peopleCount} người</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900 line-clamp-1 max-w-[150px]" title={booking.roomId?.title}>{booking.roomId?.title || 'Phòng đã xóa'}</div>
                                                <div className="text-blue-600 font-medium text-xs mt-0.5">{booking.roomId?.priceMonthly || 0} Triệu/tháng</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap text-sm">
                                            {formatDateTime(booking.viewTime)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap text-sm">
                                            {formatDate(booking.moveInDate)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-sm ${STATUS_STYLES[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-60"></span>
                                                {getStatusLabel(booking.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">{formatDate(booking.createdAt)}</td>
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

                    {/* Mobile Card View */}
                    <div className="md:hidden grid grid-cols-1 gap-4">
                        {bookings.map((booking) => (
                            <div key={booking._id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
                                {/* Header: Code & Status */}
                                <div className="flex justify-between items-start">
                                    <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded text-xs">
                                        {booking.bookingCode}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_STYLES[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-60"></span>
                                        {getStatusLabel(booking.status)}
                                    </span>
                                </div>

                                {/* Main Info */}
                                <div className="space-y-2 mt-1">
                                    <div>
                                        <div className="font-medium text-gray-900 text-base">{booking.customerName}</div>
                                        <div className="text-gray-500 text-xs flex items-center gap-2 mt-0.5">
                                            <span className="font-mono">{booking.phone}</span>
                                            <span>•</span>
                                            <span>{booking.peopleCount} người</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-2 rounded-lg space-y-1.5 border border-gray-100">
                                        <div className="text-gray-700 text-sm flex items-start gap-2">
                                            <span className="min-w-[70px] text-gray-500 text-xs">Phòng:</span>
                                            <span className="font-medium">{booking.roomId?.title || 'Phòng đã xóa'}</span>
                                        </div>
                                        <div className="text-gray-700 text-sm flex items-start gap-2">
                                            <span className="min-w-[70px] text-gray-500 text-xs">Xem phòng:</span>
                                            <span className="font-medium">{formatDateTime(booking.viewTime)}</span>
                                        </div>
                                        <div className="text-gray-700 text-sm flex items-start gap-2">
                                            <span className="min-w-[70px] text-gray-500 text-xs">Dọn vào:</span>
                                            <span className="font-medium">{formatDate(booking.moveInDate)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer: Update Status */}
                                <div className="pt-3 border-t border-gray-100 flex items-center gap-2 mt-auto">
                                    <label className="text-xs text-gray-500 font-medium">Cập nhật:</label>
                                    <select
                                        value={booking.status}
                                        onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                                        className="flex-grow rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5"
                                    >
                                        <option value="pending">Chờ xử lý</option>
                                        <option value="contacted">Đã liên hệ</option>
                                        <option value="scheduled">Đã hẹn</option>
                                        <option value="done">Hoàn thành</option>
                                        <option value="canceled">Đã hủy</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default BookingManagement;
