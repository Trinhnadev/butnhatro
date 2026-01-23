import { useState, useEffect } from 'react';
import { roomAPI } from '../../services/api';
import { formatPrice, formatDate } from '../../utils/helpers';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import RoomForm from '../../components/room/RoomForm';

const RoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showArchived, setShowArchived] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);

    useEffect(() => {
        fetchRooms();
    }, [showArchived]);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await roomAPI.getRooms({
                includeArchived: showArchived ? 'true' : 'false',
                limit: 100,
            });
            setRooms(response.data.rooms);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh sách phòng');
        } finally {
            setLoading(false);
        }
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
                alert('Cập nhật phòng thành công');
            } else {
                await roomAPI.createRoom(roomData);
                alert('Tạo phòng mới thành công');
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
        // Prepare data for form if mismatched structure
        setEditingRoom(room);
        setShowModal(true);
    };

    if (loading && !rooms.length) return <Loading message="Đang tải danh sách phòng..." />;
    if (error) return <ErrorMessage message={error} onRetry={fetchRooms} />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-bold text-gray-800">Quản lý phòng</h2>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-gray-700 cursor-pointer select-none hover:text-blue-600 transition-colors">
                        <input
                            type="checkbox"
                            checked={showArchived}
                            onChange={(e) => setShowArchived(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                        />
                        <span className="text-sm font-medium">Hiển thị phòng đã lưu trữ</span>
                    </label>
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 shadow-sm hover:shadow active:scale-95"
                        onClick={openCreateModal}
                    >
                        <span>+</span> Thêm phòng mới
                    </button>
                </div>
            </div>

            {rooms.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 text-lg">Chưa có phòng nào</p>
                    <button
                        className="mt-4 text-blue-600 font-medium hover:underline"
                        onClick={openCreateModal}
                    >
                        Tạo phòng đầu tiên ngay
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
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
                                    <td className="px-6 py-4 text-gray-600">{room.location.streetAddress}</td>
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
        </div>
    );
};

export default RoomManagement;
