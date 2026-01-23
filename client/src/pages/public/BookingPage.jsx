import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomAPI, bookingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatPrice, isValidPhone } from '../../utils/helpers';

const BookingPage = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [formData, setFormData] = useState({
        customerName: user?.name || '',
        phone: '',
        desiredArea: '',
        peopleCount: 1,
        budgetMax: '',
        moveInDate: '',
        viewTime: '',
        notes: '',
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchRoom();
    }, [roomId]);

    const fetchRoom = async () => {
        try {
            setLoading(true);
            const response = await roomAPI.getRoom(roomId);
            setRoom(response.data.room);
            setFormData((prev) => ({
                ...prev,
                desiredArea: response.data.room.location.district,
                budgetMax: response.data.room.priceMonthly,
            }));
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải thông tin phòng');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.customerName.trim()) {
            newErrors.customerName = 'Vui lòng nhập họ tên';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại';
        } else if (!isValidPhone(formData.phone)) {
            newErrors.phone = 'Số điện thoại không hợp lệ';
        }

        if (!formData.peopleCount || formData.peopleCount < 1) {
            newErrors.peopleCount = 'Vui lòng nhập số người';
        }

        if (!formData.moveInDate) {
            newErrors.moveInDate = 'Vui lòng chọn ngày dự kiến chuyển vào';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const response = await bookingAPI.createBooking({
                roomId,
                ...formData,
            });

            setSuccess({
                bookingCode: response.data.bookingCode,
                message: response.data.message,
            });

            setFormData({
                customerName: user?.name || '',
                phone: '',
                desiredArea: '',
                peopleCount: 1,
                budgetMax: '',
                moveInDate: '',
                viewTime: '',
                notes: '',
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tạo đặt phòng');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loading message="Đang tải thông tin..." />;
    if (error && !room) return <ErrorMessage message={error} onRetry={fetchRoom} />;

    return (
        <div className="py-8">
            <div className="max-w-7xl mx-auto px-5">
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
                    <div className="mb-8 pb-8 border-b border-border">
                        <h1 className="mb-4">Đặt phòng</h1>
                        {room && (
                            <div className="bg-light p-4 rounded-lg">
                                <h3 className="mb-2">{room.title}</h3>
                                <p className="text-2xl font-bold text-primary my-2">{room.priceMonthly} Triệu/tháng</p>
                                <p className="text-secondary">
                                    📍 {room.location.streetAddress}, {room.location.street}, {room.location.city}
                                </p>
                            </div>
                        )}
                    </div>

                    {success ? (
                        <div className="text-center py-8">
                            <div className="text-6xl mb-4">✅</div>
                            <h2 className="text-success mb-4">Đặt phòng thành công!</h2>
                            <p className="mb-2 text-lg">Mã đặt phòng của bạn: <strong>{success.bookingCode}</strong></p>
                            <p className="mb-8">Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.</p>
                            <div className="flex gap-4 justify-center mt-8">
                                <button
                                    onClick={() => navigate('/')}
                                    className="px-6 py-3 bg-primary text-white rounded-lg font-semibold cursor-pointer transition-all hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-custom-lg border-0"
                                >
                                    Về trang chủ
                                </button>
                                <button
                                    onClick={() => setSuccess(null)}
                                    className="px-6 py-3 bg-white text-dark border border-border rounded-lg font-semibold cursor-pointer transition-all hover:bg-light"
                                >
                                    Đặt phòng khác
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <h3 className="mb-6">Thông tin của bạn</h3>

                            <div className="mb-6">
                                <label className="block font-semibold mb-2">
                                    Họ và tên <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleChange}
                                    placeholder="Nguyễn Văn A"
                                    className="w-full px-3 py-2 border border-border rounded-lg text-base focus:outline-none focus:border-primary"
                                />
                                {errors.customerName && <span className="text-danger text-sm mt-1 block">{errors.customerName}</span>}
                            </div>

                            <div className="mb-6">
                                <label className="block font-semibold mb-2">
                                    Số điện thoại (Zalo) <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="0901234567"
                                    className="w-full px-3 py-2 border border-border rounded-lg text-base focus:outline-none focus:border-primary"
                                />
                                {errors.phone && <span className="text-danger text-sm mt-1 block">{errors.phone}</span>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block font-semibold mb-2">Khu vực mong muốn</label>
                                    <input
                                        type="text"
                                        name="desiredArea"
                                        value={formData.desiredArea}
                                        onChange={handleChange}
                                        placeholder="Ninh Kiều"
                                        className="w-full px-3 py-2 border border-border rounded-lg text-base focus:outline-none focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold mb-2">
                                        Số người <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="peopleCount"
                                        value={formData.peopleCount}
                                        onChange={handleChange}
                                        min="1"
                                        className="w-full px-3 py-2 border border-border rounded-lg text-base focus:outline-none focus:border-primary"
                                    />
                                    {errors.peopleCount && <span className="text-danger text-sm mt-1 block">{errors.peopleCount}</span>}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block font-semibold mb-2">Ngân sách tối đa (Triệu)</label>
                                <input
                                    type="number"
                                    name="budgetMax"
                                    value={formData.budgetMax}
                                    onChange={handleChange}
                                    placeholder="2.5"
                                    className="w-full px-3 py-2 border border-border rounded-lg text-base focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block font-semibold mb-2">
                                        Ngày dự kiến chuyển vào <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="moveInDate"
                                        value={formData.moveInDate}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-border rounded-lg text-base focus:outline-none focus:border-primary"
                                    />
                                    {errors.moveInDate && <span className="text-danger text-sm mt-1 block">{errors.moveInDate}</span>}
                                </div>

                                <div>
                                    <label className="block font-semibold mb-2">Thời gian xem phòng</label>
                                    <input
                                        type="datetime-local"
                                        name="viewTime"
                                        value={formData.viewTime}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-border rounded-lg text-base focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block font-semibold mb-2">Ghi chú thêm</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Yêu cầu đặc biệt hoặc câu hỏi..."
                                    className="w-full px-3 py-2 border border-border rounded-lg text-base focus:outline-none focus:border-primary resize-none"
                                ></textarea>
                            </div>

                            {error && (
                                <div className="bg-red-100 text-danger px-4 py-3 rounded-lg mb-4">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-4 justify-end mt-8">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="px-6 py-3 bg-white text-dark border border-border rounded-lg font-semibold cursor-pointer transition-all hover:bg-light disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={submitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-primary text-white rounded-lg font-semibold cursor-pointer transition-all hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-custom-lg disabled:opacity-60 disabled:cursor-not-allowed border-0"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Đang gửi...' : 'Xác nhận đặt phòng'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
