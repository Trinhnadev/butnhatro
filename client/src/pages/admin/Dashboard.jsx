import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RoomManagement from './RoomManagement';
import BookingManagement from './BookingManagement';

const Dashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('rooms');

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="bg-white shadow-sm mb-8">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">🏠 Quản lý Butt Nha Tro</h1>
                    <p className="text-gray-600">Xin chào, <span className="font-medium text-gray-900">{user?.name}</span>!</p>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="border-b border-gray-200">
                        <div className="flex overflow-x-auto">
                            <button
                                className={`px-6 py-4 text-sm font-medium transition-colors duration-200 border-b-2 whitespace-nowrap ${activeTab === 'rooms'
                                        ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                onClick={() => setActiveTab('rooms')}
                            >
                                🏠 Quản lý phòng
                            </button>
                            <button
                                className={`px-6 py-4 text-sm font-medium transition-colors duration-200 border-b-2 whitespace-nowrap ${activeTab === 'bookings'
                                        ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                onClick={() => setActiveTab('bookings')}
                            >
                                📋 Quản lý đặt phòng
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {activeTab === 'rooms' && <RoomManagement />}
                        {activeTab === 'bookings' && <BookingManagement />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
