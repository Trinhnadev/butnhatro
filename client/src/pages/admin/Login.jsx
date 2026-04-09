import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        loginInput: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.loginInput || !formData.password) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        try {
            setLoading(true);
            const data = await login(formData.loginInput, formData.password);

            // Redirect based on role
            if (data.user?.role === 'admin') {
                navigate('/admin');
            } else {
                // If user has phone, go directly to their booking list, else go to normal search
                if (data.user?.phone) {
                    navigate(`/booking-list?phone=${data.user.phone}`);
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-8">
            <div className="w-full max-w-md px-5">
                <div className="bg-white p-10 rounded-lg shadow-custom-lg">
                    <h1 className="text-center mb-2 text-2xl font-bold">Đăng nhập</h1>
                    <p className="text-center text-secondary mb-8">Đăng nhập vào hệ thống Hades House</p>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block font-semibold mb-2">Email hoặc Số điện thoại</label>
                            <input
                                type="text"
                                name="loginInput"
                                value={formData.loginInput}
                                onChange={handleChange}
                                placeholder="Email hoặc SĐT..."
                                autoComplete="username"
                                className="w-full px-3 py-2 border border-border rounded-lg text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block font-semibold mb-2">Mật khẩu</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
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
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-secondary">
                        Chưa có tài khoản? <Link to="/register" className="text-primary no-underline font-semibold">Đăng ký ngay</Link>
                    </p>


                </div>
            </div>
        </div>
    );
};

export default Login;
