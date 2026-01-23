import { useState } from 'react';

const ImageGallery = ({ images }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="bg-white rounded-lg overflow-hidden mb-8 shadow-md">
                <img
                    src="https://via.placeholder.com/800x600?text=No+Images"
                    alt="No images"
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg overflow-hidden mb-8 shadow-md">
            <div className="relative w-full h-[500px]">
                <img
                    src={images[selectedIndex].url}
                    alt={`Image ${selectedIndex + 1}`}
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg">
                    {selectedIndex + 1} / {images.length}
                </div>
            </div>

            {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                    {images.map((image, index) => (
                        <img
                            key={index}
                            src={image.url}
                            alt={`Thumbnail ${index + 1}`}
                            className={`w-24 h-20 object-cover rounded-lg cursor-pointer opacity-60 transition-all border-2 border-transparent hover:opacity-100 ${index === selectedIndex ? 'opacity-100 !border-primary' : ''
                                }`}
                            onClick={() => setSelectedIndex(index)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageGallery;
