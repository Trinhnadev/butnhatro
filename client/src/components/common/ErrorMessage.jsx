const ErrorMessage = ({ message, onRetry }) => {
    return (
        <div className="text-center py-12 bg-red-50 rounded-lg mb-8">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2">Đã xảy ra lỗi</h3>
            <p className="text-secondary mb-4">{message || 'Vui lòng thử lại sau'}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-6 py-3 bg-primary text-white rounded-lg font-semibold cursor-pointer transition-all hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-custom-lg border-0"
                >
                    Thử lại
                </button>
            )}
        </div>
    );
};

export default ErrorMessage;
