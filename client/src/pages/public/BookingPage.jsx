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
        peopleCount: '',
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

    // Helper to get formatted date string
    const getFormattedDateTime = (date = new Date()) => {
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
    };

    const getFormattedDate = (date = new Date()) => {
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 10);
    };

    // Calculate constraints
    const now = new Date();
    const minViewTime = getFormattedDateTime(now);

    const maxViewDate = new Date();
    maxViewDate.setDate(now.getDate() + 5);
    const maxViewTime = getFormattedDateTime(maxViewDate);

    const minMoveInDate = getFormattedDate(now);

    const validate = () => {
        const newErrors = {};
        const currentTime = new Date();

        if (!formData.viewTime) {
            newErrors.viewTime = 'Vui lòng chọn thời gian xem phòng';
        } else {
            const selectedViewTime = new Date(formData.viewTime);
            const maxAllowedTime = new Date();
            maxAllowedTime.setDate(currentTime.getDate() + 5);

            if (selectedViewTime < currentTime) {
                newErrors.viewTime = 'Thời gian xem phòng phải ở tương lai';
            } else if (selectedViewTime > maxAllowedTime) {
                newErrors.viewTime = 'Vui lòng chọn thời gian xem phòng trong vòng 5 ngày tới';
            }
        }

        if (!formData.customerName.trim()) {
            newErrors.customerName = 'Vui lòng nhập họ tên';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại';
        } else if (!isValidPhone(formData.phone)) {
            newErrors.phone = 'Số điện thoại không hợp lệ';
        }

        if (!formData.peopleCount.toString().trim()) {
            newErrors.peopleCount = 'Vui lòng nhập số người';
        }

        if (!formData.moveInDate) {
            newErrors.moveInDate = 'Vui lòng chọn ngày dự kiến chuyển vào';
        } else {
            const selectedMoveInDate = new Date(formData.moveInDate);
            // Compare dates only (ignore time)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            selectedMoveInDate.setHours(0, 0, 0, 0);

            if (selectedMoveInDate < today) {
                newErrors.moveInDate = 'Ngày chuyển vào không thể ở quá khứ';
            }
        }

        // Budget is explicitly not excluded from "required", so adding basic check if needed, 
        // but often rooms have fixed price. User said "fields must be mandatory except area and notes".
        // I'll add it to be safe.
        if (!formData.budgetMax) {
            newErrors.budgetMax = 'Vui lòng nhập ngân sách dự kiến';
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
                viewTime: new Date(formData.viewTime + ':00+07:00').toISOString(),
                moveInDate: new Date(formData.moveInDate + 'T00:00:00+07:00').toISOString(),
            });

            setSuccess({
                bookingCode: response.data.bookingCode,
                message: response.data.message,
            });

            // Auto redirect after 2 seconds
            setTimeout(() => {
                navigate(`/booking-list?phone=${formData.phone}`);
            }, 2000);

            setFormData({
                customerName: user?.name || '',
                phone: '',
                desiredArea: '',
                peopleCount: '',
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
    // Only show page-level error if room failed to load. 
    // Submit errors are shown in the modal.
    if (error && !room && !submitting) return <ErrorMessage message={error} onRetry={fetchRoom} />;

    return (
        <div className="py-8">
            <div className="max-w-7xl mx-auto px-5">
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
                    {/* Back Link */}
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center text-gray-500 hover:text-primary mb-6 transition-colors"
                    >
                        <span className="mr-2 text-xl">←</span> Quay lại
                    </button>

                    <div className="mb-8 pb-8 border-b border-border">
                        <h1 className="mb-4 text-2xl font-bold text-gray-800 text-center">Đặt lịch xem phòng</h1>
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

                    {/* Modern Status Modal */}
                    {(success || error) && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300">
                            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 transform transition-all scale-100 animate-fadeIn">
                                <div className="text-center">
                                    {/* Icon Animation */}
                                    <div className="mb-6 flex justify-center">
                                        {success ? (
                                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce-slow">
                                                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-shake">
                                                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <h3 className={`text-2xl font-bold mb-2 ${success ? 'text-green-600' : 'text-red-600'}`}>
                                        {success ? 'Đặt lịch thành công!' : 'Đặt lịch thất bại'}
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {success ? (
                                            <>
                                                Mã đặt phòng: <span className="font-bold text-gray-800">{success.bookingCode}</span>
                                                <br />
                                                Đang chuyển hướng đến danh sách...
                                            </>
                                        ) : (
                                            error
                                        )}
                                    </p>

                                    {/* Action Button (only for error or manual close) */}
                                    {!success && (
                                        <button
                                            onClick={() => setError(null)}
                                            className="w-full py-3 bg-gray-100 text-gray-800 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                                        >
                                            Thử lại
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <h3 className="mb-6">Thông tin đặt phòng</h3>

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
                                    type="text"
                                    name="peopleCount"
                                    value={formData.peopleCount}
                                    onChange={handleChange}
                                    placeholder="VD: 2 người lớn, 1 trẻ em"
                                    className="w-full px-3 py-2 border border-border rounded-lg text-base focus:outline-none focus:border-primary"
                                />
                                {errors.peopleCount && <span className="text-danger text-sm mt-1 block">{errors.peopleCount}</span>}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block font-semibold mb-2">
                                Ngân sách tối đa (Triệu) <span className="text-danger">*</span>
                            </label>
                            <input
                                type="number"
                                name="budgetMax"
                                value={formData.budgetMax}
                                onChange={handleChange}
                                placeholder="2.5"
                                className="w-full px-3 py-2 border border-border rounded-lg text-base focus:outline-none focus:border-primary"
                            />
                            {errors.budgetMax && <span className="text-danger text-sm mt-1 block">{errors.budgetMax}</span>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block font-semibold mb-2">
                                    Thời gian xem phòng <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    name="viewTime"
                                    value={formData.viewTime}
                                    onChange={handleChange}
                                    min={minViewTime}
                                    max={maxViewTime}
                                    className="w-full px-3 py-2 border border-border rounded-lg text-base focus:outline-none focus:border-primary"
                                />
                                <p className="text-xs text-gray-500 mt-1">Chỉ đặt lịch trong vòng 5 ngày tới</p>
                                {errors.viewTime && <span className="text-danger text-sm mt-1 block">{errors.viewTime}</span>}
                            </div>

                            <div>
                                <label className="block font-semibold mb-2">
                                    Ngày dự kiến chuyển vào <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="moveInDate"
                                    value={formData.moveInDate}
                                    onChange={handleChange}
                                    min={minMoveInDate}
                                    className="w-full px-3 py-2 border border-border rounded-lg text-base focus:outline-none focus:border-primary"
                                />
                                {errors.moveInDate && <span className="text-danger text-sm mt-1 block">{errors.moveInDate}</span>}
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
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
