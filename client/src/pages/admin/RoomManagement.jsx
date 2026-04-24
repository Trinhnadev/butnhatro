import { useState, useEffect } from 'react';
import { roomAPI } from '../../services/api';
import { formatPrice, formatDate } from '../../utils/helpers';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import RoomForm from '../../components/room/RoomForm';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { majorStreets, priceRanges } from '../../utils/constants';

const RoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [successModal, setSuccessModal] = useState({
        show: false,
        message: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0,
        limit: 10
    });

    // Filters state
    const [filters, setFilters] = useState({
        search: '',
        district: '',
        priceRange: '',
        status: 'active' // 'all', 'active', 'archived'
    });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchRooms();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [filters, currentPage]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                limit: 10,
                page: currentPage,
                search: filters.search,
                district: filters.district,
                priceRange: filters.priceRange,
            };

            // Handle status filter
            if (filters.status === 'archived') {
                params.includeArchived = 'true';
            } else if (filters.status === 'all') {
                params.includeArchived = 'true';
            } else {
                params.includeArchived = 'false';
            }

            const response = await roomAPI.getRooms(params);

            let fetchedRooms = response.data.rooms;

            // Client-side status filtering if backend returns mixed
            if (filters.status === 'archived') {
                fetchedRooms = fetchedRooms.filter(r => r.isArchived);
            } else if (filters.status === 'active') {
                fetchedRooms = fetchedRooms.filter(r => !r.isArchived);
            }

            setRooms(fetchedRooms);
            setPagination(response.data.pagination || { page: 1, pages: 1, total: response.data.rooms.length, limit: 10 });
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh sách phòng');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleResetFilters = () => {
        setFilters({
            search: '',
            district: '',
            priceRange: '',
            status: 'active'
        });
    };

    const handleArchive = async (id) => {
        if (!confirm('Bạn có chắc muốn lưu trữ phòng này?')) return;

        try {
            await roomAPI.archiveRoom(id);
            fetchRooms();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể lưu trữ phòng');
        }
    };

    const handleUnarchive = async (id) => {
        try {
            await roomAPI.unarchiveRoom(id);
            fetchRooms();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể khôi phục phòng');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa phòng này?')) return;

        try {
            await roomAPI.deleteRoom(id);
            fetchRooms();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể xóa phòng');
        }
    };

    const handleCreateRoom = async (roomData) => {
        try {
            if (editingRoom) {
                await roomAPI.updateRoom(editingRoom._id, roomData);
                setSuccessModal({
                    show: true,
                    message: 'Thông tin phòng đã được cập nhật thành công!'
                });
            } else {
                await roomAPI.createRoom(roomData);
                setSuccessModal({
                    show: true,
                    message: 'Phòng mới đã được đăng và sẵn sàng hiển thị!'
                });
            }
            setShowModal(false);
            setEditingRoom(null);
            fetchRooms();
        } catch (err) {
            console.error(err);
            throw err; // Form checks this
        }
    };

    const openCreateModal = () => {
        setEditingRoom(null);
        setShowModal(true);
    };

    const openEditModal = (room) => {
        setEditingRoom(room);
        setShowModal(true);
    };

    const [showFilters, setShowFilters] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Quản lý phòng</h2>
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 shadow-sm hover:shadow active:scale-95"
                        onClick={openCreateModal}
                    >
                        <span>+</span> <span className="hidden sm:inline">Thêm phòng mới</span>
                    </button>
                </div>

                {/* Mobile Filter Toggle */}
                <button
                    className="md:hidden flex items-center justify-between w-full bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm text-gray-700 font-medium"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <span className="flex items-center gap-2">
                        🔍 Bộ lọc tìm kiếm
                        {(filters.search || filters.district || filters.priceRange || filters.status !== 'active') && (
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
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    🔍
                                </span>
                                <input
                                    type="text"
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    placeholder="Tìm theo tên, địa chỉ..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* District */}
                        <div>
                            <select
                                name="district"
                                value={filters.district}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                <option value="">Tất cả khu vực</option>
                                {majorStreets.map((street) => (
                                    <option key={street} value={street}>{street}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                <option value="active">Đang hoạt động</option>
                                <option value="archived">Đã lưu trữ</option>
                                <option value="all">Tất cả trạng thái</option>
                            </select>
                        </div>

                        {/* Price & Reset */}
                        <div className="flex gap-2">
                            <select
                                name="priceRange"
                                value={filters.priceRange}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                <option value="">Tất cả giá</option>
                                {priceRanges.map((range) => (
                                    <option key={range.value} value={range.value}>{range.label}</option>
                                ))}
                            </select>

                            {(filters.search || filters.district || filters.priceRange || filters.status !== 'active') && (
                                <button
                                    onClick={handleResetFilters}
                                    className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transiton-colors"
                                    title="Xóa bộ lọc"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {loading && !rooms.length ? (
                <Loading message="Đang tải danh sách phòng..." />
            ) : error ? (
                <ErrorMessage message={error} onRetry={fetchRooms} />
            ) : rooms.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 text-lg">Không tìm thấy phòng nào phù hợp</p>
                    <button
                        className="mt-4 text-blue-600 font-medium hover:underline"
                        onClick={handleResetFilters}
                    >
                        Xóa bộ lọc
                    </button>
                    <div className="mt-2 text-sm text-gray-400">hoặc</div>
                    <button
                        className="mt-2 text-blue-600 font-medium hover:underline"
                        onClick={openCreateModal}
                    >
                        Tạo phòng mới
                    </button>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 shadow-sm relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        )}
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                                    <th className="px-6 py-4">Tiêu đề</th>
                                    <th className="px-6 py-4">Giá</th>
                                    <th className="px-6 py-4">Địa điểm</th>
                                    <th className="px-6 py-4">Diện tích</th>
                                    <th className="px-6 py-4">Trạng thái</th>
                                    <th className="px-6 py-4">Ngày tạo</th>
                                    <th className="px-6 py-4 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {rooms.map((room) => (
                                    <tr key={room._id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {room.images?.[0] && (
                                                    <img
                                                        src={room.images[0].url}
                                                        alt={room.title}
                                                        className="w-12 h-12 object-cover rounded-lg border border-gray-100 shadow-sm"
                                                    />
                                                )}
                                                <span className="font-medium text-gray-900 line-clamp-2 max-w-[200px]">{room.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-blue-600 whitespace-nowrap">{room.priceMonthly} Triệu/tháng</td>
                                        <td className="px-6 py-4 text-gray-600 text-sm max-w-[170px] truncate" title={room.location.streetAddress}>{room.location.streetAddress}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {room.areaMin && room.areaMax
                                                ? `${room.areaMin}-${room.areaMax}m²`
                                                : room.area
                                                    ? `${room.area}m²`
                                                    : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {room.isArchived ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                    Đã lưu trữ
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                    Hoạt động
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">{formatDate(room.createdAt)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                                    title="Chỉnh sửa"
                                                    onClick={() => openEditModal(room)}
                                                >
                                                    ✏️
                                                </button>
                                                {room.isArchived ? (
                                                    <button
                                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                                                        title="Khôi phục"
                                                        onClick={() => handleUnarchive(room._id)}
                                                    >
                                                        ↩️
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200"
                                                        title="Lưu trữ"
                                                        onClick={() => handleArchive(room._id)}
                                                    >
                                                        📦
                                                    </button>
                                                )}
                                                <button
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                    title="Xóa"
                                                    onClick={() => handleDelete(room._id)}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden grid grid-cols-1 gap-4">
                        {rooms.map((room) => (
                            <div key={room._id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4">
                                {/* Left: Image */}
                                <div className="flex-shrink-0">
                                    {room.images?.[0] ? (
                                        <img
                                            src={room.images[0].url}
                                            alt={room.title}
                                            className="w-24 h-24 object-cover rounded-lg border border-gray-100"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                            🏠
                                        </div>
                                    )}
                                </div>

                                {/* Right: Info */}
                                <div className="flex-grow min-w-0 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                                                {room.title}
                                            </h3>
                                            {room.isArchived ? (
                                                <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                    Lưu trữ
                                                </span>
                                            ) : (
                                                <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800 border border-green-200">
                                                    Hoạt động
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                            <span className="text-blue-600 font-semibold">{room.priceMonthly} Tr</span>
                                            <span>•</span>
                                            <span>
                                                {room.areaMin && room.areaMax
                                                    ? `${room.areaMin}-${room.areaMax}m²`
                                                    : room.area
                                                        ? `${room.area}m²`
                                                        : '-'}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 truncate">
                                            📍 {room.location.streetAddress}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-2 mt-3">
                                        <button
                                            className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"
                                            onClick={() => openEditModal(room)}
                                        >
                                            ✏️
                                        </button>
                                        {room.isArchived ? (
                                            <button
                                                className="p-1.5 text-gray-400 hover:text-green-600 bg-gray-50 hover:bg-green-50 rounded-lg transition-colors"
                                                onClick={() => handleUnarchive(room._id)}
                                            >
                                                ↩️
                                            </button>
                                        ) : (
                                            <button
                                                className="p-1.5 text-gray-400 hover:text-amber-600 bg-gray-50 hover:bg-amber-50 rounded-lg transition-colors"
                                                onClick={() => handleArchive(room._id)}
                                            >
                                                📦
                                            </button>
                                        )}
                                        <button
                                            className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors"
                                            onClick={() => handleDelete(room._id)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
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

            {/* Modal Overlay */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingRoom ? 'Chỉnh sửa tin đăng' : 'Đăng tin mới'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6">
                            <RoomForm
                                initialData={editingRoom}
                                onSubmit={handleCreateRoom}
                                onCancel={() => setShowModal(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            <Modal
                isOpen={successModal.show}
                onClose={() => setSuccessModal(prev => ({ ...prev, show: false }))}
                actions={
                    <button
                        onClick={() => setSuccessModal(prev => ({ ...prev, show: false }))}
                        className="w-full px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
                    >
                        Tuyệt vời!
                    </button>
                }
            >
                <div className="flex flex-col items-center text-center w-full py-2">
                    <div className="mb-4">
                        <svg className="checkmark-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                            <circle className="checkmark-svg__circle" cx="26" cy="26" r="25" fill="none"/>
                            <path className="checkmark-svg__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Thành công!</h3>
                    <p className="text-gray-600 leading-relaxed max-w-[240px]">
                        {successModal.message}
                    </p>
                </div>
            </Modal>

            <style>{`
                .checkmark-svg {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    display: block;
                    stroke-width: 3;
                    stroke: #fff;
                    stroke-miterlimit: 10;
                    margin: 0 auto;
                    box-shadow: inset 0px 0px 0px #10b981;
                    animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
                }

                .checkmark-svg__circle {
                    stroke-dasharray: 166;
                    stroke-dashoffset: 166;
                    stroke-width: 3;
                    stroke-miterlimit: 10;
                    stroke: #10b981;
                    fill: none;
                    animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
                }

                .checkmark-svg__check {
                    transform-origin: 50% 50%;
                    stroke-dasharray: 48;
                    stroke-dashoffset: 48;
                    animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
                }

                @keyframes stroke {
                    100% { stroke-dashoffset: 0; }
                }

                @keyframes scale {
                    0%, 100% { transform: none; }
                    50% { transform: scale3d(1.1, 1.1, 1); }
                }

                @keyframes fill {
                    100% { box-shadow: inset 0px 0px 0px 32px #10b981; }
                }
            `}</style>
        </div>
    );
};

export default RoomManagement;
