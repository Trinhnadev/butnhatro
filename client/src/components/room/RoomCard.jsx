import { Link } from 'react-router-dom';

const RoomCard = ({ room }) => {
    const mainImage = room.images?.[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image';

    return (
        <Link
            to={`/rooms/${room._id}`}
            className="bg-white rounded-lg overflow-hidden shadow-md transition-all hover:-translate-y-1 hover:shadow-custom-lg no-underline text-inherit block"
        >
            <div className="relative w-full h-52 overflow-hidden">
                <img src={mainImage} alt={room.title} className="w-full h-full object-cover" />
                {room.isArchived && (
                    <div className="absolute top-2.5 right-2.5 bg-danger text-white px-3 py-1 rounded-lg text-sm font-semibold">
                        Đã cho thuê
                    </div>
                )}
            </div>

            <div className="p-6">
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                    {room.title}
                </h3>

                <div className="text-2xl font-bold text-primary mb-2">
                    {room.priceMonthly} triệu/tháng
                </div>

                <div className="text-secondary mb-3 text-sm">
                    📍 {room.location.streetAddress} , {room.location.street}
                    {room.location.ward && `, ${room.location.ward}`}
                </div>

                {/* Furniture - show first 4 items */}
                {room.furnitures && room.furnitures.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {room.furnitures.slice(0, 4).map((furniture, index) => (
                            <span
                                key={index}
                                className="bg-light px-2 py-1 rounded text-xs text-secondary"
                            >
                                {furniture}
                            </span>
                        ))}
                        {room.furnitures.length > 4 && (
                            <span className="text-xs text-secondary">
                                +{room.furnitures.length - 4}
                            </span>
                        )}
                    </div>
                )}

                {/* Utility prices */}
                <div className="flex gap-4 text-secondary text-sm border-t pt-3 mt-3">
                    {room.costs?.electricityPrice && (
                        <span>⚡ {room.costs.electricityPrice}</span>
                    )}
                    {room.costs?.waterPrice && (
                        <span>💧 {room.costs.waterPrice}</span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default RoomCard;
