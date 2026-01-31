import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { roomAPI } from '../../services/api';
import ImageGallery from '../../components/room/ImageGallery';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatPrice } from '../../utils/helpers';

const RoomDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRoom();
    }, [id]);

    const fetchRoom = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await roomAPI.getRoom(id);
            setRoom(response.data.room);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải thông tin phòng');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading message="Đang tải thông tin phòng..." />;
    if (error) return <ErrorMessage message={error} onRetry={fetchRoom} />;
    if (!room) return <ErrorMessage message="Không tìm thấy phòng" />;

    return (
        <div className="py-8 bg-gray-50 from-gray-50 to-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Navigation */}
                <Link to="/" className="inline-flex items-center mb-6 text-primary font-medium hover:underline transition-all">
                    <span className="mr-1 text-xl">←</span> Quay lại danh sách
                </Link>

                {/* Images */}
                <div className="mb-8 rounded-2xl overflow-hidden shadow-sm">
                    <ImageGallery images={room.images} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content (Left Column) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header Section */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                                    {room.title}
                                </h1>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                                <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                                    <span className="mr-2">📍</span>
                                    {room.location.streetAddress}, {room.location.street}, {room.location.city}
                                </div>
                                <div className="text-primary font-bold text-xl md:text-2xl">
                                    {room.priceMonthly} Triệu/tháng
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <a
                                    href={room.googleMapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(room.location.streetAddress + ', ' + room.location.city)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                                >
                                    🗺️ Xem trên bản đồ
                                </a>
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {(room.area != 0) && (
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                                    <span className="text-2xl mb-1">📐</span>
                                    <span className="text-sm text-gray-500 font-medium">Diện tích</span>
                                    <span className="text-gray-900 font-bold">
                                        {room.area}m²
                                    </span>
                                </div>
                            )}

                            {room.maxPeople && (
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                                    <span className="text-2xl mb-1">👥</span>
                                    <span className="text-sm text-gray-500 font-medium">Sức chứa</span>
                                    <span className="text-gray-900 font-bold">{room.maxPeople} người</span>
                                </div>
                            )}

                            {room.bedrooms > 0 && (
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                                    <span className="text-2xl mb-1">🛏️</span>
                                    <span className="text-sm text-gray-500 font-medium">Phòng ngủ</span>
                                    <span className="text-gray-900 font-bold">{room.bedrooms}</span>
                                </div>
                            )}

                            {room.layout && (
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                                    <span className="text-2xl mb-1">🏠</span>
                                    <span className="text-sm text-gray-500 font-medium">Loại phòng</span>
                                    <span className="text-gray-900 font-bold text-sm truncate w-full px-1">{room.layout}</span>
                                </div>
                            )}
                        </div>

                        {/* Amenities Section */}
                        {((room.amenities && Object.values(room.amenities).some(v => v)) || (room.furnitures && room.furnitures.length > 0)) && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                    <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">✨</span>
                                    Tiện nghi & Nội thất
                                </h3>

                                {room.furnitures && room.furnitures.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Nội thất có sẵn</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {room.furnitures.map((item, index) => {
                                                const iconMap = {
                                                    'máy lạnh': '❄️',
                                                    'tủ lạnh': '🧊',
                                                    'máy giặt': '🧺',
                                                    'giường': '🛏️',
                                                    'tủ quần áo': '🚪',
                                                    'kệ bếp': '🍳',
                                                    'bàn ghế': '🪑',
                                                    'nệm': '🛌',
                                                    'sofa': '🛋️',
                                                    'wifi': '📶',
                                                    'tivi': '📺',
                                                    'nóng lạnh': '🚿',
                                                };
                                                // Try exact match or strict includes for better matching
                                                const lowerItem = item.toLowerCase();
                                                const icon = iconMap[lowerItem] ||
                                                    Object.entries(iconMap).find(([key]) => lowerItem.includes(key))?.[1] ||
                                                    '✨'; // Default sparkle instead of chair if unknown

                                                return (
                                                    <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-800">
                                                        <span className="mr-1.5">{icon}</span> {item}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {room.amenities && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Tiện ích chung</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {room.amenities.freeTime && (
                                                <div className="flex items-center text-gray-700">
                                                    <span className="text-green-500 mr-2">✓</span> Giờ giấc tự do
                                                </div>
                                            )}
                                            {room.amenities.securityGate && (
                                                <div className="flex items-center text-gray-700">
                                                    <span className="text-green-500 mr-2">✓</span> Cổng khóa an ninh
                                                </div>
                                            )}
                                            {room.amenities.fingerprintLock && (
                                                <div className="flex items-center text-gray-700">
                                                    <span className="text-green-500 mr-2">✓</span> Khóa vân tay
                                                </div>
                                            )}
                                            {room.amenities.parking && (
                                                <div className="flex items-center text-gray-700">
                                                    <span className="text-green-500 mr-2">✓</span> Chỗ để xe
                                                </div>
                                            )}
                                            {room.amenities.carParking && (
                                                <div className="flex items-center text-gray-700">
                                                    <span className="text-green-500 mr-2">✓</span> Đậu được ô tô
                                                </div>
                                            )}
                                            {room.amenities.petFriendly && (
                                                <div className="flex items-center text-gray-700">
                                                    <span className="text-green-500 mr-2">✓</span> Cho nuôi thú cưng
                                                </div>
                                            )}
                                            {room.amenities.hasBalcony && (
                                                <div className="flex items-center text-gray-700">
                                                    <span className="text-green-500 mr-2">✓</span> Có ban công
                                                </div>
                                            )}
                                            {room.amenities.hasElevator && (
                                                <div className="flex items-center text-gray-700">
                                                    <span className="text-green-500 mr-2">✓</span> Có thang máy
                                                </div>
                                            )}
                                            {room.amenities.withOwner && (
                                                <div className="flex items-center text-gray-700">
                                                    <span className="text-blue-500 mr-2">ℹ️</span> Ở chung chủ
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Description Section - Moved to Bottom */}
                        {room.description && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="bg-yellow-100 text-yellow-600 p-2 rounded-lg mr-3">📝</span>
                                    Mô tả chi tiết
                                </h3>
                                <div className="text-gray-600 whitespace-pre-line leading-relaxed text-base">
                                    {room.description}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar (Right Column) */}
                    <div className="space-y-6 sticky top-4 self-start">
                        {/* Booking Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                            <div className="text-center mb-6">
                                <p className="text-sm text-gray-500 mb-1">Giá thuê phòng</p>
                                <p className="text-3xl font-bold text-primary">{room.priceMonthly} Triệu/tháng</p>
                            </div>

                            <button
                                onClick={() => navigate(`/booking/${room._id}`)}
                                className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none mb-4"
                                disabled={room.isArchived}
                            >
                                {room.isArchived ? '❌ Đã cho thuê' : '📅 Đặt lịch xem phòng'}
                            </button>

                            <div className="text-center">
                                <p className="text-xs text-gray-400">Không tính phí đặt lịch xem phòng</p>
                            </div>

                            <hr className="my-6 border-gray-100" />

                            {/* Costs Breakdown */}
                            {room.costs && (
                                <div className="space-y-3 text-sm">
                                    <h4 className="font-semibold text-gray-900 mb-2">Chi phí khác</h4>
                                    {room.costs.electricityPrice && (
                                        <div className="flex justify-between py-1 border-b border-gray-50">
                                            <span className="text-gray-500">⚡ Điện</span>
                                            <span className="font-medium text-gray-900">{room.costs.electricityPrice}</span>
                                        </div>
                                    )}
                                    {room.costs.waterPrice && (
                                        <div className="flex justify-between py-1 border-b border-gray-50">
                                            <span className="text-gray-500">💧 Nước</span>
                                            <span className="font-medium text-gray-900">{room.costs.waterPrice}</span>
                                        </div>
                                    )}
                                    {room.costs.utilityPerPerson && (
                                        <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-xs mt-2">
                                            ℹ️ Tiền nước tính theo đầu người
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Terms */}
                            {room.terms && (room.terms.contractMonths || room.terms.depositMonths) && (
                                <div className="mt-6 space-y-3 text-sm">
                                    <h4 className="font-semibold text-gray-900 mb-2">Điều khoản</h4>
                                    {room.terms.contractMonths > 0 && (
                                        <div className="flex justify-between py-1">
                                            <span className="text-gray-500">Hợp đồng</span>
                                            <span className="font-medium text-gray-900">{room.terms.contractMonths} tháng</span>
                                        </div>
                                    )}
                                    {room.terms.depositMonths > 0 && (
                                        <div className="flex justify-between py-1">
                                            <span className="text-gray-500">Đặt cọc</span>
                                            <span className="font-medium text-gray-900">{room.terms.depositMonths} tháng</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Nearby Universities */}
                        {room.nearbyUniversities && room.nearbyUniversities.length > 0 && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-3">🎓</span>
                                    Trường gần đây
                                </h3>
                                <div className="space-y-3">
                                    {room.nearbyUniversities.map((uni, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-700 font-medium">{uni.name}</span>
                                            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap">
                                                {uni.distanceKm} km
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomDetail;
