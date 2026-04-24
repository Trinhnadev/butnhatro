import React from 'react';

const Pagination = ({ pagination, onPageChange }) => {
    if (!pagination || pagination.pages <= 1) return null;

    const { page, pages, total } = pagination;

    // Generate page numbers to show
    const getPageNumbers = () => {
        const delta = 2; // Number of pages to show before and after current page
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= pages; i++) {
            if (i === 1 || i === pages || (i >= page - delta && i <= page + delta)) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-sm text-gray-500">
                Hiển thị <span className="font-semibold text-gray-900">{Math.min(pagination.limit, total - (page - 1) * pagination.limit)}</span> /
                <span className="font-semibold text-gray-900"> {pagination.limit}</span> kết quả
            </div>

            <nav className="flex items-center gap-1">
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                    {getPageNumbers().map((p, index) => (
                        <React.Fragment key={index}>
                            {p === '...' ? (
                                <span className="px-3 py-2 text-gray-400">...</span>
                            ) : (
                                <button
                                    onClick={() => onPageChange(p)}
                                    className={`min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium transition-all ${page === p
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                                        : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                                        }`}
                                >
                                    {p}
                                </button>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Next Button */}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === pages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </nav>
        </div>
    );
};

export default Pagination;
