const Footer = () => {
    return (
        <footer className="bg-dark text-white pt-8 pb-4 mt-16">
            <div className="max-w-7xl mx-auto px-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <h3 className="mb-4">Butt Nha Tro</h3>
                        <p className="text-slate-300">Hệ thống quản lý và tìm kiếm nhà trọ tại Cần Thơ</p>
                    </div>

                    <div>
                        <h4 className="mb-4">Liên hệ</h4>
                        <p className="mb-2 text-slate-300">📍 Cần Thơ, Việt Nam</p>
                        <p className="mb-2 text-slate-300">📞 0919723728</p>
                        <div className="flex gap-2.5 mt-2.5 items-center">
                            <a
                                href="https://zalo.me/0919723728"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-slate-300 no-underline transition-all hover:text-white hover:opacity-80"
                            >
                                <img src="/zalo-icon.png" alt="Zalo" className="w-6 h-6" />
                                <p className="m-0">0919723728</p>
                            </a>
                        </div>
                        <div className="flex gap-2.5 mt-2.5 items-center">
                            <a
                                href="https://www.facebook.com/natdev05.10/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-slate-300 no-underline transition-all hover:text-white hover:opacity-80"
                            >
                                <img src="/facebook-icon.png" alt="Facebook" className="w-6 h-6" />
                                <p className="m-0">Nguyễn Anh Trinh</p>
                            </a>
                        </div>

                    </div>

                    <div>
                        <h4 className="mb-4">Thông tin</h4>
                        <p className="text-slate-300">Giờ làm việc: 8:00 - 20:00</p>
                        <p className="text-slate-300">Hỗ trợ 24/7</p>
                    </div>
                </div>

                <div className="text-center pt-4 border-t border-white/10 text-slate-400">
                    <p>&copy; 2026 Butt Nha Tro. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
