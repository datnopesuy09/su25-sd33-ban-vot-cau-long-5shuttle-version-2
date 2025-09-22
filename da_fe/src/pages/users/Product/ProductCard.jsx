import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Heart } from 'lucide-react';
import { useUserAuth } from '../../../contexts/userAuthContext';
import { toast } from 'react-toastify';
import './ProductCard.css';

function ProductCard({ product }) {
    const navigate = useNavigate();
    const { user } = useUserAuth();
    const [productVariants, setProductVariants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [variantsCached, setVariantsCached] = useState(false);
    const [currentVariantIndex, setCurrentVariantIndex] = useState(0);
    const [displayedVariant, setDisplayedVariant] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const intervalRef = useRef(null);
    console.log('productVariants: ', productVariants);
    // Hàm lấy token từ user hoặc localStorage
    const getToken = () => {
        const token = user?.token || localStorage.getItem('userToken');
        return token;
    };

    // Kiểm tra sản phẩm có trong danh sách yêu thích không
    const checkFavoriteStatus = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await axios.get('http://localhost:8080/wish-list', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = response.data;
            if (data.code === 1000) {
                const favoriteIds = data.result.sanPhamList.map((item) => item.id);
                setIsFavorite(favoriteIds.includes(product.id));
            }
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    // Xử lý toggle yêu thích (thêm hoặc xóa)
    const handleToggleFavorite = async (e) => {
        e.stopPropagation(); // Ngăn sự kiện click lan sang thẻ sản phẩm
        const token = getToken();
        if (!token) {
            toast.error('Vui lòng đăng nhập để thêm/xóa sản phẩm khỏi danh sách yêu thích.');
            localStorage.removeItem('userToken');
            return;
        }

        try {
            if (isFavorite) {
                // Gọi API DELETE để xóa khỏi danh sách yêu thích
                const response = await axios.delete('http://localhost:8080/wish-list', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    data: { idSanPham: product.id },
                });
                const data = response.data;
                if (data.code === 1000) {
                    setIsFavorite(false);
                    toast.success('Đã xóa sản phẩm khỏi danh sách yêu thích.');
                } else {
                    toast.error('Không thể xóa sản phẩm khỏi danh sách yêu thích.');
                }
            } else {
                // Gọi API POST để thêm vào danh sách yêu thích
                const response = await axios.post(
                    'http://localhost:8080/wish-list',
                    { idSanPham: product.id },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );
                const data = response.data;
                if (data.code === 1000) {
                    setIsFavorite(true);
                    toast.success('Đã thêm sản phẩm vào danh sách yêu thích.');
                } else {
                    toast.error('Không thể thêm sản phẩm vào danh sách yêu thích.');
                }
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            if (error.response?.status === 401) {
                toast.error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
                localStorage.removeItem('userToken');
            } else {
                toast.error('Có lỗi xảy ra khi thêm/xóa sản phẩm khỏi danh sách yêu thích.');
            }
        }
    };

    // Gọi kiểm tra trạng thái yêu thích khi component mount
    useEffect(() => {
        checkFavoriteStatus();
    }, [product.id, user]);

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

            // Lọc các màu sắc khác nhau
            const uniqueColors = [...new Set(productData.variants.map((v) => v.mauSacTen))];
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
            setDisplayedVariant(colorVariants[0]);
            setVariantsCached(true);
        } catch (error) {
            console.error('Error fetching product variants:', error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-cycle through variants every 3 seconds
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

                    {/* Icon yêu thích */}
                    <button
                        onClick={handleToggleFavorite}
                        className={`absolute top-2 left-2 p-2 rounded-full transition-colors ${
                            isFavorite ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>

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
