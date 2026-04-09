import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register, verifyOTP, resendOTP } = useAuth(); // Added resendOTP

    const [step, setStep] = useState(1); // 1: Register, 2: OTP
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // OTP Timer State
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Timer effect
    useEffect(() => {
        let timer;
        if (step === 2 && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            setCanResend(true);
        }
        return () => clearInterval(timer);
    }, [step, countdown]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu nhập lại không khớp');
            return;
        }

        try {
            setLoading(true);
            const res = await register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });

            if (res.requireOtp) {
                setStep(2);
                setCountdown(60); // Reset timer on new registration attempt
                setCanResend(false);
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            setLoading(true);
            const data = await verifyOTP(formData.email, otp);
            if (data.user?.phone) {
                navigate(`/booking-list?phone=${data.user.phone}`);
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Xác thực OTP thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            setLoading(true);
            setError('');
            await resendOTP(formData.email);
            setCountdown(60);
            setCanResend(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Gửi lại OTP thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-8">
            <div className="w-full max-w-md px-5">
                <div className="bg-white p-10 rounded-lg shadow-custom-lg">
                    <h1 className="text-center mb-2 text-2xl font-bold">Đăng ký tài khoản</h1>
                    <p className="text-center text-secondary mb-8">
                        {step === 1 ? 'Tạo tài khoản mới tại Hades House' : 'Nhập mã xác thực đã được gửi đến email của bạn'}
                    </p>

                    {step === 1 ? (
                        <form onSubmit={handleRegisterSubmit}>
                            <div className="mb-4">
                                <label className="block font-semibold mb-2">Họ và tên</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nguyễn Văn A"
                                    required
                                    className="w-full px-3 py-2 border border-border rounded-lg text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block font-semibold mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                    required
                                    className="w-full px-3 py-2 border border-border rounded-lg text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block font-semibold mb-2">Số điện thoại</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="0912345678"
                                    required
                                    className="w-full px-3 py-2 border border-border rounded-lg text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block font-semibold mb-2">Mật khẩu</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        className="w-full px-3 py-2 border border-border rounded-lg text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer bg-transparent border-0"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block font-semibold mb-2">Nhập lại mật khẩu</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        className="w-full px-3 py-2 border border-border rounded-lg text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleConfirmPasswordVisibility}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer bg-transparent border-0"
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                    >
                                        {showConfirmPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-danger px-4 py-3 rounded-lg mb-4 text-sm border border-red-200">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold cursor-pointer transition-all hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed border-0 shadow-sm"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Đăng ký'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleOtpSubmit}>
                            <div className="mb-6">
                                <label className="block font-semibold mb-2">Mã OTP (6 chữ số)</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="123456"
                                    maxLength={6}
                                    required
                                    className="w-full px-3 py-2 border border-border rounded-lg text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-center tracking-widest text-2xl"
                                />
                                <p className="text-sm text-secondary mt-2">
                                    Mã OTP đã được gửi đến <strong>{formData.email}</strong>
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-danger px-4 py-3 rounded-lg mb-4 text-sm border border-red-200">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-1/3 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold cursor-pointer transition-all hover:bg-gray-200 border-0"
                                    disabled={loading}
                                >
                                    Quay lại
                                </button>
                                <button
                                    type="submit"
                                    className="w-2/3 px-6 py-3 bg-primary text-white rounded-lg font-semibold cursor-pointer transition-all hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed border-0 shadow-sm"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
                                </button>
                            </div>

                            {/* Resend OTP Section */}
                            <div className="mt-6 text-center">
                                <p className="text-secondary text-sm">
                                    Chưa nhận được mã?{' '}
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={!canResend || loading}
                                        className={`font-semibold bg-transparent border-0 cursor-pointer ${canResend
                                            ? 'text-primary hover:text-primary-dark'
                                            : 'text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {canResend ? 'Gửi lại mã' : `Gửi lại sau ${countdown}s`}
                                    </button>
                                </p>
                            </div>
                        </form>
                    )}

                    <p className="text-center mt-6 text-secondary">
                        Đã có tài khoản? <Link to="/login" className="text-primary no-underline font-semibold">Đăng nhập</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
