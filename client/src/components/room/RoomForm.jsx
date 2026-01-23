import { useState } from 'react';
import { uploadAPI } from '../../services/api';

const STREETS = [
    'Đường 3/2',
    'Đường 30/4',
    'Đại lộ Hòa Bình',
    'Đường Nguyễn Văn Cừ',
    'Đường Mậu Thân',
    'Đường Trần Hưng Đạo',
    'Đường Lý Tự Trọng',
    'Đường Võ Văn Kiệt',
    'Đường Nguyễn Trãi',
    'Đường Cách Mạng Tháng 8',
    'Đường Trần Hoàng Na',
    'Đường Nguyễn Văn Linh',
    'Đường Hoàng Quốc Việt',
    'Đường Phạm Hùng',
    'Đường Hùng Vương',
    'Đường Trần Việt Châu',
    'Đường Trương Vĩnh Nguyên',
    'Đường Trần Vĩnh Kiết',
    'KDC 91B',
    'KDC Hồng Phát',
    'KDC Nam Long',
    'KDC Metro',
    'KDC Hưng Phú',
    'KDC Phú An',
];

const UNIVERSITIES = [
    'Đại học Cần Thơ',
    'Đại học Y Dược Cần Thơ',
    'Đại học Nam Cần Thơ',
    'Đại học Tây Đô',
    'Đại học Kỹ thuật - Công nghệ Cần Thơ',
    'Đại học FPT Cần Thơ',
    'Cao đẳng Cộng đồng Cần Thơ',
    'Cao đẳng Sư phạm Cần Thơ',
    'Cao đẳng Y tế Cần Thơ',
];

const CATEGORIES = [
    'Phòng trọ',
    'Minihouse',
    'Căn hộ',
    'Nhà nguyên căn',
    'Mặt bằng',
];

const FURNITURES = [
    'Máy lạnh',
    'Tủ lạnh',
    'Máy giặt',
    'Giường',
    'Nệm',
    'Tủ quần áo',
    'Tivi',
    'Sofa',
    'Bếp',
    'Nước nóng lạnh',
    'Wifi',
    'Kệ bếp',
    'Bàn ghế',
    'Lavabo',
];

const AMENITIES = [
    { key: 'freeTime', label: 'Giờ giấc tự do' },
    { key: 'securityGate', label: 'Cổng an ninh' },
    { key: 'fingerprintLock', label: 'Khoá vân tay' },
    { key: 'parking', label: 'Chỗ để xe' },
    { key: 'carParking', label: 'Có thể đậu oto' },
    { key: 'petFriendly', label: 'Cho nuôi thú cưng' },
    { key: 'hasBalcony', label: 'Có ban công' },
    { key: 'hasElevator', label: 'Có thang máy' },
    { key: 'withOwner', label: 'Chung chủ' },
];

const RoomForm = ({ initialData, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        category: initialData?.category || 'Phòng trọ',
        priceMonthly: initialData?.priceMonthly || '',
        depositMonths: initialData?.terms?.depositMonths || 1,
        contractMonths: initialData?.terms?.contractMonths || 12,
        street: initialData?.location?.street || 'Đường 3/2',
        streetAddress: initialData?.location?.streetAddress || '',
        area: initialData?.area || '',
        maxPeople: initialData?.maxPeople || 2,
        bedrooms: initialData?.bedrooms || '',
        electricityPrice: initialData?.costs?.electricityPrice || '4.000đ/kwh',
        waterPrice: initialData?.costs?.waterPrice || '12.000đ/m3',
        utilityPerPerson: initialData?.costs?.utilityPerPerson || false,
        googleMapsLink: initialData?.googleMapsLink || '',
        shortTermRental: initialData?.shortTermRental || false,
        isFull: initialData?.isFull || false,
        furnitures: initialData?.furnitures || [],
        amenities: initialData?.amenities || {
            freeTime: true,
            securityGate: false,
            fingerprintLock: false,
            parking: true,
            carParking: false,
            petFriendly: false,
            hasBalcony: false,
            hasElevator: false,
            withOwner: false,
        },
        nearbyUniversities: initialData?.nearbyUniversities || [],
        images: initialData?.images || [],
    });

    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [showUniversityForm, setShowUniversityForm] = useState(false);
    const [selectedUniversity, setSelectedUniversity] = useState('');
    const [universityDistance, setUniversityDistance] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAmenityChange = (key) => {
        setFormData((prev) => ({
            ...prev,
            amenities: {
                ...prev.amenities,
                [key]: !prev.amenities[key],
            },
        }));
    };

    const handleFurnitureChange = (item) => {
        setFormData((prev) => {
            const exists = prev.furnitures.includes(item);
            return {
                ...prev,
                furnitures: exists
                    ? prev.furnitures.filter((f) => f !== item)
                    : [...prev.furnitures, item],
            };
        });
    };

    const handleAddUniversity = () => {
        if (selectedUniversity && universityDistance) {
            setFormData((prev) => ({
                ...prev,
                nearbyUniversities: [
                    ...prev.nearbyUniversities,
                    {
                        name: selectedUniversity,
                        distanceKm: Number(universityDistance),
                    },
                ],
            }));
            setSelectedUniversity('');
            setUniversityDistance('');
            setShowUniversityForm(false);
        }
    };

    const handleRemoveUniversity = (index) => {
        setFormData((prev) => ({
            ...prev,
            nearbyUniversities: prev.nearbyUniversities.filter((_, i) => i !== index),
        }));
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles((prev) => [...prev, ...selectedFiles]);

        // Generate previews
        const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
        setPreviews((prev) => [...prev, ...newPreviews]);
    };

    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const imageFiles = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    imageFiles.push(file);
                }
            }
        }

        if (imageFiles.length > 0) {
            setFiles((prev) => [...prev, ...imageFiles]);
            const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));
            setPreviews((prev) => [...prev, ...newPreviews]);
        }
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            let uploadedImages = [...formData.images];

            // Upload new files if any
            if (files.length > 0) {
                const uploadFormData = new FormData();
                files.forEach((file) => {
                    uploadFormData.append('images', file);
                });

                const response = await uploadAPI.uploadImages(uploadFormData);
                uploadedImages = [...uploadedImages, ...response.data.images];
            }

            // Prepare final data structure
            const submitData = {
                title: formData.title,
                description: formData.description || '', // Ensure description is sent
                category: formData.category,
                priceMonthly: Number(formData.priceMonthly),
                location: {
                    city: 'Can Tho',
                    street: formData.street,
                    streetAddress: formData.streetAddress,
                },
                area: Number(formData.area),
                maxPeople: Number(formData.maxPeople),
                bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
                layout: '', // Optional
                costs: {
                    electricityPrice: formData.electricityPrice,
                    waterPrice: formData.waterPrice,
                    utilityPerPerson: formData.utilityPerPerson,
                },
                terms: {
                    depositMonths: Number(formData.depositMonths),
                    contractMonths: Number(formData.contractMonths),
                },
                googleMapsLink: formData.googleMapsLink || undefined,
                shortTermRental: formData.shortTermRental,
                isFull: formData.isFull,
                furnitures: formData.furnitures,
                amenities: formData.amenities,
                nearbyUniversities: formData.nearbyUniversities,
                images: uploadedImages,
            };

            await onSubmit(submitData);
        } catch (error) {
            console.error('Submission error:', error);
            alert('Có lỗi xảy ra khi lưu phòng: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8" onPaste={handlePaste}>
            {/* Section 1: Basic Info */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">1. Thông tin cơ bản</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề bài đăng *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="form-input w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="VD: Minihouse mới xây Cần Thơ..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại phòng</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="form-select w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Đường / Khu vực</label>
                        <select
                            name="street"
                            value={formData.street}
                            onChange={handleChange}
                            className="form-select w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {STREETS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết *</label>
                        <input
                            type="text"
                            name="streetAddress"
                            value={formData.streetAddress}
                            onChange={handleChange}
                            className="form-input w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Số nhà, tên đường, khu dân cư..."
                            required
                        />
                    </div>

                    {/* Nearby Universities Section */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gần các trường đại học <span className="text-gray-400 font-normal">(Tùy chọn)</span>
                        </label>

                        {formData.nearbyUniversities.length > 0 && (
                            <div className="mb-3 space-y-2">
                                {formData.nearbyUniversities.map((uni, index) => (
                                    <div key={index} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                        <span className="text-sm text-gray-700">
                                            🎓 {uni.name} - <strong>{uni.distanceKm} km</strong>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveUniversity(index)}
                                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                            title="Xóa"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!showUniversityForm ? (
                            <button
                                type="button"
                                onClick={() => setShowUniversityForm(true)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 hover:underline"
                            >
                                + Thêm trường đại học
                            </button>
                        ) : (
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Chọn trường</label>
                                    <select
                                        value={selectedUniversity}
                                        onChange={(e) => setSelectedUniversity(e.target.value)}
                                        className="form-select w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    >
                                        <option value="">-- Chọn trường đại học --</option>
                                        {UNIVERSITIES.filter(
                                            (uni) => !formData.nearbyUniversities.some((u) => u.name === uni)
                                        ).map((uni) => (
                                            <option key={uni} value={uni}>{uni}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Khoảng cách (km)</label>
                                    <input
                                        type="number"
                                        value={universityDistance}
                                        onChange={(e) => setUniversityDistance(e.target.value)}
                                        className="form-input w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        placeholder="VD: 1.5"
                                        step="0.1"
                                        min="0"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleAddUniversity}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Thêm
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowUniversityForm(false);
                                            setSelectedUniversity('');
                                            setUniversityDistance('');
                                        }}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Section 2: Pricing & Specs */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">2. Chi phí & Thông số</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá thuê (VNĐ) *</label>
                        <input
                            type="number"
                            name="priceMonthly"
                            value={formData.priceMonthly}
                            onChange={handleChange}
                            className="form-input w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="4000000"
                            required
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiền cọc (tháng)</label>
                        <input
                            type="number"
                            name="depositMonths"
                            value={formData.depositMonths}
                            onChange={handleChange}
                            className="form-input w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hợp đồng (tháng)</label>
                        <input
                            type="number"
                            name="contractMonths"
                            value={formData.contractMonths}
                            onChange={handleChange}
                            className="form-input w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích (m²)</label>
                        <input
                            type="number"
                            name="area"
                            value={formData.area}
                            onChange={handleChange}
                            className="form-input w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số người ở tối đa</label>
                        <input
                            type="number"
                            name="maxPeople"
                            value={formData.maxPeople}
                            onChange={handleChange}
                            className="form-input w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số phòng ngủ</label>
                        <input
                            type="number"
                            name="bedrooms"
                            value={formData.bedrooms}
                            onChange={handleChange}
                            className="form-input w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="VD: 2"
                            min="0"
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá điện</label>
                        <input
                            type="text"
                            name="electricityPrice"
                            value={formData.electricityPrice}
                            onChange={handleChange}
                            className="form-input w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="VD: 4.000đ/kwh"
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá nước</label>
                        <input
                            type="text"
                            name="waterPrice"
                            value={formData.waterPrice}
                            onChange={handleChange}
                            className="form-input w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="VD: 15.000đ/kwh"
                        />
                    </div>

                    <div className="col-span-2 md:col-span-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.utilityPerPerson}
                                onChange={(e) => setFormData(prev => ({ ...prev, utilityPerPerson: e.target.checked }))}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Tiền điện nước tính theo người (thay vì theo đồng hồ)</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Section 3: Amenities & Furniture */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">3. Tiện ích & Nội thất</h3>

                <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Nội thất có sẵn</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {FURNITURES.map((item) => (
                            <label key={item} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50 border border-transparent hover:border-gray-200">
                                <input
                                    type="checkbox"
                                    checked={formData.furnitures.includes(item)}
                                    onChange={() => handleFurnitureChange(item)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{item}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Tiện ích & Quy định</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {AMENITIES.map(({ key, label }) => (
                            <label key={key} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50 border border-transparent hover:border-gray-200">
                                <input
                                    type="checkbox"
                                    checked={formData.amenities[key]}
                                    onChange={() => handleAmenityChange(key)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Tùy chọn khác</h4>
                    <div className="space-y-3">
                        <label className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={formData.shortTermRental}
                                onChange={(e) => setFormData(prev => ({ ...prev, shortTermRental: e.target.checked }))}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Có thể thuê ngắn hạn</span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={formData.isFull}
                                onChange={(e) => setFormData(prev => ({ ...prev, isFull: e.target.checked }))}
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-700 font-medium">🔒 Đánh dấu phòng đã full (Admin)</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Section 4: Images & Description */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">4. Hình ảnh & Mô tả</h3>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh phòng</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {/* Existing Images */}
                        {formData.images.map((img, index) => (
                            <div key={`existing-${index}`} className="relative group aspect-square">
                                <img src={img.url} alt={`Existing ${index}`} className="w-full h-full object-cover rounded-lg border border-gray-200" />
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}

                        {/* New Previews */}
                        {previews.map((preview, index) => (
                            <div key={`preview-${index}`} className="relative group aspect-square">
                                <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover rounded-lg border border-gray-200" />
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}

                        {/* Add Button */}
                        <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all aspect-square">
                            <span className="text-3xl text-gray-400 mb-2">+</span>
                            <span className="text-sm text-gray-500">Thêm ảnh</span>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">💡 Mẹo: Bạn có thể paste ảnh trực tiếp vào form (Ctrl+V)</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Google Maps</label>
                    <input
                        type="url"
                        name="googleMapsLink"
                        value={formData.googleMapsLink}
                        onChange={handleChange}
                        className="form-input w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="VD: https://maps.google.com/..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                        className="form-textarea w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Mô tả chi tiết về phòng, tiện ích, môi trường xung quanh..."
                    ></textarea>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 sticky bottom-0 bg-white p-4 border-t border-gray-200 shadow-lg -mx-6 -mb-6 mt-8 z-10">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Hủy bỏ
                </button>
                <button
                    type="submit"
                    disabled={uploading || loading}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {(uploading || loading) && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>}
                    {uploading ? 'Đang tải ảnh...' : loading ? 'Đang lưu...' : 'Lưu tin đăng'}
                </button>
            </div>
        </form>
    );
};

export default RoomForm;
