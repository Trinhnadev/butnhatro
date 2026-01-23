import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { user, logout, isAdmin } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center gap-2 no-underline text-dark text-2xl font-bold">
                            <span className="text-3xl">🏠</span>
                            <span className="hidden sm:block">Butt Nha Tro</span>
                            <span className="sm:hidden">Butt NT</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link to="/" className="no-underline text-secondary font-medium hover:text-primary transition-all">
                            Trang chủ
                        </Link>

                        {user ? (
                            <>
                                {isAdmin ? (
                                    <Link to="/admin" className="no-underline text-secondary font-medium hover:text-primary transition-all">
                                        Quản lý
                                    </Link>
                                ) : (
                                    <Link to="/my-bookings" className="no-underline text-secondary font-medium hover:text-primary transition-all">
                                        Đặt phòng của tôi
                                    </Link>
                                )}
                                <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                                    <span className="font-semibold text-dark truncate max-w-[150px]">{user.name}</span>
                                    <button
                                        onClick={logout}
                                        className="px-4 py-2 bg-light border border-border rounded-lg cursor-pointer transition-all hover:bg-border text-sm"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="no-underline text-secondary font-medium hover:text-primary transition-all">
                                    Đăng nhập
                                </Link>
                                <Link to="/register" className="px-5 py-2.5 bg-primary text-white rounded-lg font-semibold cursor-pointer transition-all hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-custom-lg no-underline text-sm">
                                    Đăng ký
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {/* Icon when menu is closed */}
                            {!isMenuOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                /* Icon when menu is open */
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link
                            to="/"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 bg-gray-50"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Trang chủ
                        </Link>

                        {user ? (
                            <>
                                {isAdmin ? (
                                    <Link
                                        to="/admin"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Quản lý
                                    </Link>
                                ) : (
                                    <Link
                                        to="/my-bookings"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Đặt phòng của tôi
                                    </Link>
                                )}
                                <div className="pt-4 pb-3 border-t border-gray-200 mt-2">
                                    <div className="flex items-center px-3 mb-3">
                                        <div className="flex-shrink-0">
                                            <span className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-base font-medium leading-none text-gray-800">{user.name}</div>
                                            <div className="text-sm font-medium leading-none text-gray-500 mt-1">{user.email}</div>
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <button
                                            onClick={() => {
                                                logout();
                                                setIsMenuOpen(false);
                                            }}
                                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50"
                                        >
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="pt-4 pb-3 border-t border-gray-200 mt-2 grid grid-cols-2 gap-4 px-2">
                                <Link
                                    to="/login"
                                    className="block w-full text-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-base font-medium text-primary bg-blue-50 hover:bg-blue-100"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="block w-full text-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
