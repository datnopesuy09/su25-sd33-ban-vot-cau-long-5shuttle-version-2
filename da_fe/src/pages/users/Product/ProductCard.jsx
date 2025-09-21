import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ProductCard.css';

function ProductCard({ product }) {
    const navigate = useNavigate();
    const [productVariants, setProductVariants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [variantsCached, setVariantsCached] = useState(false);
    const [currentVariantIndex, setCurrentVariantIndex] = useState(0);
    const [displayedVariant, setDisplayedVariant] = useState(null);
    const intervalRef = useRef(null);

    const handleClick = () => {
        navigate(`/san-pham/san-pham-ct/${product.id}`);
    };

    // Lấy thông tin giá từ variant hiện tại hoặc sản phẩm gốc
    const getCurrentVariant = () => {
        if (displayedVariant) {
            return {
                originalPrice: displayedVariant.originalPrice,
                discountedPrice:
                    displayedVariant.price < displayedVariant.originalPrice ? displayedVariant.price : null,
                discountPercentage:
                    displayedVariant.price < displayedVariant.originalPrice
                        ? Math.round(
                              ((displayedVariant.originalPrice - displayedVariant.price) /
                                  displayedVariant.originalPrice) *
                                  100,
                          )
                        : null,
                image: displayedVariant.image,
                color: displayedVariant.color,
            };
        }
        return {
            originalPrice: product.donGia,
            discountedPrice: product.giaKhuyenMai,
            discountPercentage: product.giaTriKhuyenMai,
            image: product.hinhAnhDaiDien,
            color: null,
        };
    };

    const currentVariant = getCurrentVariant();
    const isDiscounted =
        currentVariant.discountedPrice != null &&
        currentVariant.originalPrice != null &&
        currentVariant.discountedPrice < currentVariant.originalPrice;

    // Lấy variants khi component mount
    const fetchProductVariants = async () => {
        if (!product.id || loading || variantsCached) return;

        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:8080/api/san-pham-ct/${product.id}/detaill-with-promotion`,
            );
            const productData = response.data;

            // Lọc các màu sắc khác nhau (chỉ lấy màu sắc, không cần trọng lượng) và chỉ lấy biến thể active
            const activeVariants = productData.variants.filter(variant => variant.trangThai === 1);
            const uniqueColors = [...new Set(activeVariants.map((v) => v.mauSacTen))];
            const colorVariants = uniqueColors.map((color) => {
                const variant = activeVariants.find((v) => v.mauSacTen === color);
                return {
                    color: color,
                    image: variant?.hinhAnhUrls?.[0] || product.hinhAnhDaiDien,
                    price: variant?.giaKhuyenMai || variant?.donGia || product.donGia,
                    originalPrice: variant?.donGia || product.donGia,
                    id: variant?.id || product.id,
                };
            });

            setProductVariants(colorVariants);
            setDisplayedVariant(colorVariants[0]); // Hiển thị variant đầu tiên
            setVariantsCached(true);
        } catch (error) {
            console.error('Error fetching product variants:', error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-cycle through variants every 5 seconds
    useEffect(() => {
        if (productVariants.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentVariantIndex((prev) => {
                    const nextIndex = (prev + 1) % productVariants.length;
                    setDisplayedVariant(productVariants[nextIndex]);
                    return nextIndex;
                });
            }, 3000);

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [productVariants]);

    // Fetch variants on component mount
    useEffect(() => {
        fetchProductVariants();
    }, [product.id]);

    const handleDotClick = (index, e) => {
        e.stopPropagation();
        setCurrentVariantIndex(index);
        setDisplayedVariant(productVariants[index]);

        // Reset interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = setInterval(() => {
                setCurrentVariantIndex((prev) => {
                    const nextIndex = (prev + 1) % productVariants.length;
                    setDisplayedVariant(productVariants[nextIndex]);
                    return nextIndex;
                });
            }, 5000);
        }
    };

    return (
        <div className="flex justify-center p-4 hover:scale-105 transition-transform">
            <div
                className="productCard w-[195px] m-3 rounded-lg shadow-lg border border-gray-200 transition-shadow hover:shadow-xl cursor-pointer relative group"
                onClick={handleClick}
            >
                <div className="h-[15rem] overflow-hidden rounded-t-lg relative">
                    <img
                        className="w-full h-full object-cover hover:transform hover:scale-105 transition-all duration-500"
                        src={currentVariant.image || 'https://placehold.co/300x300'}
                        alt={product.tenSanPham || 'Sản phẩm không tên'}
                        onError={(e) => {
                            e.target.src = 'https://placehold.co/300x300';
                        }}
                    />

                    {/* Color dots indicator */}
                    {productVariants.length > 1 && (
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
                            {productVariants.map((_, index) => (
                                <button
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                        index === currentVariantIndex
                                            ? 'bg-black shadow-lg scale-125'
                                            : 'bg-black bg-opacity-50 hover:bg-opacity-80'
                                    }`}
                                    onClick={(e) => handleDotClick(index, e)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="textPart bg-white p-4 rounded-b-lg relative">
                    <h3 className="text-lg font-semibold text-gray-700 line-clamp-2">
                        {product.tenSanPham || 'Sản phẩm không tên'}
                    </h3>

                    {/* Hiển thị màu sắc hiện tại */}
                    {currentVariant.color && (
                        <div className="mt-1 mb-2">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {currentVariant.color}
                            </span>
                        </div>
                    )}

                    {/* Hiển thị giá */}
                    <div className="mt-2 flex items-center justify-between">
                        {currentVariant.originalPrice != null ? (
                            isDiscounted ? (
                                <>
                                    <span className="text-xl font-bold text-red-600">
                                        {currentVariant.discountedPrice.toLocaleString('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        })}
                                    </span>
                                    <span className="text-[10px] text-gray-500 line-through">
                                        {currentVariant.originalPrice.toLocaleString('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        })}
                                    </span>
                                </>
                            ) : (
                                <span className="text-xl font-bold text-gray-800">
                                    {currentVariant.originalPrice.toLocaleString('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    })}
                                </span>
                            )
                        ) : (
                            <span className="text-sm text-red-500">Giá sản phẩm không khả dụng</span>
                        )}
                    </div>

                    {/* Hiển thị % giảm giá nếu có */}
                    {isDiscounted && currentVariant.discountPercentage != null && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            -{currentVariant.discountPercentage}%
                        </div>
                    )}

                    {/* Loading indicator khi đang tải variants */}
                    {loading && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <span>...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
