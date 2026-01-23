import { useState } from 'react';

const RoomFilter = ({ onFilterChange, loading }) => {
    const [filters, setFilters] = useState({
        district: '',
        ward: '',
        priceRange: '',
        people: '',
        search: '',
        petFriendly: false,
        carParking: false,
    });

    const majorStreets = [
        'Đường 3/2',
        'Đường 30/4',
        'Đại lộ Hòa Bình',
        'Đường Nguyễn Văn Cừ',
        'Đường Mậu Thân',
        'Đường Trần Hưng Đạo',
        'Đường Lý Tự Trọng',
        'Đường Võ Văn Kiệt',
        'Đường Nguyễn Trãi',
        'Đường Cách Mạng Tháng 8',
        'Đường Trần Hoàng Na',
        'Đường Nguyễn Văn Linh',
        'Đường Hoàng Quốc Việt',
        'Đường Phạm Hùng',
        'Đường Hùng Vương',
        'Đường Trần Việt Châu',
        'Đường Trương Vĩnh Nguyên',
        'Đường Trần Vĩnh Kiết',
        'KDC 91B',
        'KDC Hồng Phát',
        'KDC Nam Long',
        'KDC Metro',
        'KDC Hưng Phú',
        'KDC Phú An'
    ];

    const priceRanges = [
        { label: '1.5 - 2 triệu', value: '1.5-2' },
        { label: '2 - 3 triệu', value: '2-3' },
        { label: '3 - 4 triệu', value: '3-4' },
        { label: '4 - 5 triệu', value: '4-5' },
        { label: 'Trên 5 triệu', value: '5-999' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onFilterChange(filters);
    };

    const handleReset = () => {
        const resetFilters = {
            district: '',
            ward: '',
            priceRange: '',
            people: '',
            search: '',
            petFriendly: false,
            carParking: false,
        };
        setFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col">
                        <label className="font-semibold mb-2 text-dark">🔍 Tìm kiếm</label>
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleChange}
                            placeholder="Nhập từ khóa..."
                            className="px-3 py-2 border border-border rounded-lg text-base"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="font-semibold mb-2 text-dark">📍 Đường/Khu vực</label>
                        <select
                            name="district"
                            value={filters.district}
                            onChange={handleChange}
                            className="px-3 py-2 border border-border rounded-lg text-base"
                        >
                            <option value="">Tất cả</option>
                            {majorStreets.map((street) => (
                                <option key={street} value={street}>
                                    {street}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="font-semibold mb-2 text-dark">👥 Số người</label>
                        <input
                            type="number"
                            name="people"
                            value={filters.people}
                            onChange={handleChange}
                            placeholder="Số người"
                            min="1"
                            className="px-3 py-2 border border-border rounded-lg text-base"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-6 mb-4">
                    <label className="flex items-center space-x-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                        <input
                            type="checkbox"
                            name="petFriendly"
                            checked={filters.petFriendly || false}
                            onChange={(e) => handleChange({ target: { name: 'petFriendly', value: e.target.checked } })}
                            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                        />
                        <span className="text-sm font-medium text-gray-700">🐶 Cho nuôi thú cưng</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                        <input
                            type="checkbox"
                            name="carParking"
                            checked={filters.carParking || false}
                            onChange={(e) => handleChange({ target: { name: 'carParking', value: e.target.checked } })}
                            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                        />
                        <span className="text-sm font-medium text-gray-700">🚗 Có chỗ đậu ô tô</span>
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                        <label className="font-semibold mb-2 text-dark">💰 Khoảng giá</label>
                        <select
                            name="priceRange"
                            value={filters.priceRange}
                            onChange={handleChange}
                            className="px-3 py-2 border border-border rounded-lg text-base"
                        >
                            <option value="">Tất cả</option>
                            {priceRanges.map((range) => (
                                <option key={range.value} value={range.value}>
                                    {range.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-4 items-end">
                        <button
                            type="submit"
                            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold cursor-pointer transition-all hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-custom-lg disabled:opacity-60 disabled:cursor-not-allowed border-0"
                            disabled={loading}
                        >
                            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-6 py-3 bg-white text-dark border border-border rounded-lg font-semibold cursor-pointer transition-all hover:bg-light"
                        >
                            Đặt lại
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RoomFilter;
