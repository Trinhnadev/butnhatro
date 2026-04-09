import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, actions }) => {
    // Prevent background scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all"
                style={{ animation: 'modalSlideUp 0.3s ease-out forwards' }}
            >
                {title && (
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                        <button 
                            onClick={onClose} 
                            className="bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
                <div className="p-6 text-gray-700 min-h-[80px] flex items-center">
                    {children}
                </div>
                {actions && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                        {actions}
                    </div>
                )}
            </div>
            <style>{`
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};

export default Modal;
