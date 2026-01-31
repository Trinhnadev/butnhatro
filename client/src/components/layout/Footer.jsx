const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white pt-12 pb-6 mt-16 font-sans">
            <div className="max-w-7xl mx-auto px-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Brand Section */}
                    <div>
                        <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                            Butt Nhà Trọ
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            Hệ thống tìm kiếm và quản lý nhà trọ hàng đầu tại Cần Thơ. Kết nối chủ nhà và người thuê nhanh chóng, uy tín và tiện lợi.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white">Liên kết nhanh</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="/" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Trang chủ</a></li>
                            <li><a href="/bookings" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Tra cứu đặt phòng</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Chính sách bảo mật</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Điều khoản sử dụng</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white">Liên hệ</h4>
                        <div className="space-y-3 text-sm text-gray-400">
                            <p className="flex items-start gap-3">
                                <span className="text-xl">📍</span>
                                <span>Ninh Kiều, Cần Thơ, Việt Nam</span>
                            </p>
                            <p className="flex items-center gap-3">
                                <span className="text-xl">📧</span>
                                <a href="mailto:support@buttnhatro.com" className="hover:text-white transition-colors">support@buttnhatro.com</a>
                            </p>
                            <p className="flex items-center gap-3">
                                <span className="text-xl">📞</span>
                                <a href="tel:0919723728" className="hover:text-white transition-colors">0919723728</a>
                            </p>
                        </div>
                    </div>

                    {/* Socials & Support */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white">Mạng xã hội</h4>
                        <p className="text-gray-400 text-sm mb-4">Kết nối với chúng tôi để nhận ưu đãi mới nhất.</p>
                        <div className="flex gap-4">
                            {/* Facebook */}
                            <a
                                href="https://www.facebook.com/natdev05.10/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center text-white hover:scale-110 hover:shadow-lg transition-all"
                                title="Facebook"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>

                            {/* Zalo - Custom Styled */}
                            <a
                                href="https://zalo.me/0919723728"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white hover:scale-110 hover:shadow-lg transition-all font-bold text-xs"
                                title="Zalo"
                            >
                                Zalo
                            </a>
                        </div>
                    </div>
                </div>

                <div className="text-center pt-8 border-t border-gray-800 text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Butt Nha Tro. Designed by Nguyen Anh Trinh.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
