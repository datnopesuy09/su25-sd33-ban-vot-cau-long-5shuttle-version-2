import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

function ProductCard({ product }) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/san-pham/san-pham-ct/${product.id}`);
    };


    // Lấy thông tin giá
    const originalPrice = product.donGia;
    const discountedPrice = product.giaKhuyenMai;
    const discountPercentage = product.giaTri;

    // Kiểm tra xem sản phẩm có đang giảm giá không
    const isDiscounted = discountedPrice && discountedPrice < originalPrice;

    return (
        <div className="flex justify-center p-4 hover:scale-105 transition-transform">
            <div
                className="productCard w-[195px] m-3 rounded-lg shadow-lg border border-gray-200 transition-shadow hover:shadow-xl cursor-pointer"
                onClick={handleClick}
            >
                <div className="h-[15rem] overflow-hidden rounded-t-lg">
                    <img
                        className="w-full h-full object-cover hover:transform hover:scale-105 transition-transform duration-300"
                        src={product.hinhAnhDaiDien}
                        alt={product.tenSanPham}
                        onError={(e) => {
                            e.target.src = 'https://placehold.co/300x300';
                        }}
                    />
                </div>

                <div className="textPart bg-white p-4 rounded-b-lg relative">
                    <h3 className="text-lg font-semibold text-gray-700 line-clamp-2">{product.tenSanPham}</h3>
                    
                    {/* Hiển thị giá */}
                    <div className="mt-2 flex items-center justify-between">

                        {isDiscounted ? (
                            <>
                                <span className="text-xl font-bold text-red-600">
                                    {discountedPrice.toLocaleString()} ₫
                                </span>
                                <span className="text-[10px] text-gray-500 line-through">
                                    {originalPrice.toLocaleString()} ₫
                                </span>
                            </>
                        ) : (
                            <span className="text-xl font-bold text-gray-800">
                                {originalPrice.toLocaleString()} ₫
                            </span>
                        )}
                    </div>

                    {/* Hiển thị % giảm giá nếu có */}
                    {isDiscounted && discountPercentage && (

                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            -{discountPercentage}%
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
