import { useState, useEffect } from 'react';
import { roomAPI } from '../../services/api';
import RoomCard from '../../components/room/RoomCard';
import RoomFilter from '../../components/room/RoomFilter';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import ContactButtons from '../../components/common/ContactButtons';

const Home = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [filters, setFilters] = useState({});

    useEffect(() => {
        fetchRooms();
    }, [pagination.page, filters]);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await roomAPI.getRooms({
                page: pagination.page,
                limit: 12,
                ...filters,
            });
            setRooms(response.data.rooms);
            setPagination(response.data.pagination);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh sách phòng');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div>
            <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-16 text-center mb-8">
                <div className="max-w-7xl mx-auto px-5">
                    <h1 className="text-4xl mb-4">Tìm nhà trọ tại Cần Thơ</h1>
                    <p className="text-xl opacity-90">Hệ thống quản lý và tìm kiếm nhà trọ uy tín, chất lượng</p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-5">
                <RoomFilter onFilterChange={handleFilterChange} loading={loading} />

                {error && <ErrorMessage message={error} onRetry={fetchRooms} />}

                {loading && <Loading message="Đang tải danh sách phòng..." />}

                {!loading && !error && rooms.length === 0 && (
                    <div className="text-center py-16">
                        <h3 className="text-2xl mb-2">Không tìm thấy phòng nào</h3>
                        <p className="text-secondary">Vui lòng thử điều chỉnh bộ lọc của bạn</p>
                    </div>
                )}

                {!loading && !error && rooms.length > 0 && (
                    <>
                        <div className="mb-6 text-secondary">
                            Tìm thấy <strong>{pagination.total}</strong> phòng
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                            {rooms.map((room) => (
                                <RoomCard key={room._id} room={room} />
                            ))}
                        </div>

                        {pagination.pages > 1 && (
                            <div className="flex justify-center items-center gap-4 my-8">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="px-6 py-3 bg-white text-dark border border-border rounded-lg font-semibold cursor-pointer transition-all hover:bg-light disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ← Trước
                                </button>

                                <span className="font-semibold">
                                    Trang {pagination.page} / {pagination.pages}
                                </span>

                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages}
                                    className="px-6 py-3 bg-white text-dark border border-border rounded-lg font-semibold cursor-pointer transition-all hover:bg-light disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sau →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Contact Buttons */}
            <ContactButtons />
        </div>
    );
};

export default Home;
