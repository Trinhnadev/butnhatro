
import { useState } from 'react';
import { majorStreets, priceRanges } from '../../utils/constants';

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
    const [isExpanded, setIsExpanded] = useState(false);

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
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                    {/* Top Row: Search & Mobile Toggle */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-grow">
                            <label className="lg:hidden block text-xs font-semibold text-gray-500 mb-1">Tìm kiếm</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    🔍
                                </span>
                                <input
                                    type="text"
                                    name="search"
                                    value={filters.search}
                                    onChange={handleChange}
                                    placeholder="Tìm theo tên phòng, địa chỉ..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-primary focus:border-primary focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Mobile Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <span>{isExpanded ? 'Thu gọn bộ lọc' : 'Bộ lọc nâng cao'}</span>
                            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>

                    {/* Expandable Section */}
                    <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">📍 Khu vực</label>
                                <select
                                    name="district"
                                    value={filters.district}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary focus:outline-none"
                                >
                                    <option value="">Tất cả khu vực</option>
                                    {majorStreets.map((street) => (
                                        <option key={street} value={street}>{street}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">💰 Khoảng giá</label>
                                <select
                                    name="priceRange"
                                    value={filters.priceRange}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary focus:outline-none"
                                >
                                    <option value="">Tất cả mức giá</option>
                                    {priceRanges.map((range) => (
                                        <option key={range.value} value={range.value}>{range.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">👥 Số người</label>
                                <input
                                    type="number"
                                    name="people"
                                    value={filters.people}
                                    onChange={handleChange}
                                    placeholder="Số người ở..."
                                    min="1"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary focus:outline-none"
                                />
                            </div>

                            <div className="flex gap-2 items-end">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg font-semibold cursor-pointer transition-all hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed border-0 text-sm h-[42px]"
                                    disabled={loading}
                                >
                                    {loading ? 'Tìm...' : 'Tìm kiếm'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold cursor-pointer transition-all hover:bg-gray-200 border-0 text-sm h-[42px]"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>

                        {/* Additional Options */}
                        <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-100">
                            <label className="flex items-center space-x-2 cursor-pointer hover:text-primary transition-colors select-none">
                                <input
                                    type="checkbox"
                                    name="petFriendly"
                                    checked={filters.petFriendly || false}
                                    onChange={(e) => handleChange({ target: { name: 'petFriendly', value: e.target.checked } })}
                                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                />
                                <span className="text-sm font-medium text-gray-600">🐶 Cho nuôi thú cưng</span>
                            </label>

                            <label className="flex items-center space-x-2 cursor-pointer hover:text-primary transition-colors select-none">
                                <input
                                    type="checkbox"
                                    name="carParking"
                                    checked={filters.carParking || false}
                                    onChange={(e) => handleChange({ target: { name: 'carParking', value: e.target.checked } })}
                                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                />
                                <span className="text-sm font-medium text-gray-600">🚗 Có chỗ đậu ô tô</span>
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RoomFilter;
