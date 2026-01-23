const Loading = ({ message = 'Đang tải...' }) => {
    return (
        <div className="text-center py-16">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-secondary">{message}</p>
        </div>
    );
};

export default Loading;
