import { useState, useEffect } from 'react';
import { roomAPI } from '../../services/api';
import RoomCard from '../../components/room/RoomCard';
import RoomFilter from '../../components/room/RoomFilter';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import ContactButtons from '../../components/common/ContactButtons';

const TypewriterEffect = ({ text }) => {
    return (
        <span className="inline-block">
            {text}
            <span className="animate-pulse">|</span>
        </span>
    );
};

const Home = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [filters, setFilters] = useState({});

    // Typewriter State
    const [displayText, setDisplayText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);

    const phrases = ["Tại Cần Thơ", "Giá Tốt Nhất", "An Ninh Cao", "Đầy Đủ Tiện Nghi", "Cho Sinh Viên"];

    useEffect(() => {
        const handleTyping = () => {
            const i = loopNum % phrases.length;
            const fullText = phrases[i];

            setDisplayText(isDeleting
                ? fullText.substring(0, displayText.length - 1)
                : fullText.substring(0, displayText.length + 1)
            );

            setTypingSpeed(isDeleting ? 30 : 150);

            if (!isDeleting && displayText === fullText) {
                setTimeout(() => setIsDeleting(true), 1500); // Pause at end
            } else if (isDeleting && displayText === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [displayText, isDeleting, loopNum, phrases, typingSpeed]);

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
            <section className="relative overflow-hidden bg-gradient-to-br from-primary to-indigo-900 text-white py-12 md:py-20 text-center mb-8">
                {/* Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
                    <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
                    <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-yellow-300 blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-5 z-10">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
                        <span className="block md:inline">Tìm nhà trọ</span>
                        <span className="block md:inline text-yellow-300 md:ml-3 min-h-[40px] md:min-h-0">
                            <TypewriterEffect text={displayText} />
                        </span>
                    </h1>
                    <p className="hidden md:block text-xl text-gray-200 max-w-2xl mx-auto">
                        Hệ thống tìm kiếm phòng trọ thông minh, kết nối trực tiếp chủ nhà và người thuê nhanh chóng, an toàn.
                    </p>
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
