import swal from 'sweetalert';
import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../Cart/CartContext';
import ProductCard from '../Product/ProductCard';
import classNames from 'classnames';

export default function ProductDetail() {
    const { id } = useParams(); // Lấy ID từ URL
    const [product, setProduct] = useState(null);
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedWeight, setSelectedWeight] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [currentImages, setCurrentImages] = useState([]);
    const [mainImage, setMainImage] = useState('');
    const [currentPrice, setCurrentPrice] = useState(0);
    const [currentQuantity, setCurrentQuantity] = useState(0);


    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState(1);
    const { setCartItemCount } = useContext(CartContext);

    // Lấy dữ liệu sản phẩm từ API
    useEffect(() => {
        const fetchProductDetail = async () => {
            try {

                const response = await axios.get(`http://localhost:8080/api/san-pham-ct/${id}/detaill-with-promotion`);
                const productData = response.data;

                setProduct(productData);


                // Chọn màu sắc và trọng lượng đầu tiên
                setSelectedColor(productData.mauSac[0]);
                setSelectedWeight(productData.trongLuong[0]);
                setCurrentImages(productData.hinhAnhUrls);
                setMainImage(productData.hinhAnhUrls[0]);
                setCurrentQuantity(productData.soLuong);

                
                // Tìm variant đầu tiên để set giá ban đầu
                const firstVariant = productData.variants.find(
                    v => v.mauSacTen === productData.mauSac[0] && v.trongLuongTen === productData.trongLuong[0]
                );
                if (firstVariant) {
                    setCurrentPrice(firstVariant.giaKhuyenMai || firstVariant.donGia);
                }
            } catch (error) {
                console.error('Failed to fetch product detail', error);
            }
        };

        fetchProductDetail();
    }, [id]);

    // Cập nhật hình ảnh, giá và số lượng dựa trên màu sắc và trọng lượng đã chọn
    useEffect(() => {
        if (product) {
            const selectedVariant = product.variants.find(
                (v) => v.mauSacTen === selectedColor && v.trongLuongTen === selectedWeight,
            );

            if (selectedVariant) {
                setCurrentImages(selectedVariant.hinhAnhUrls);
                setMainImage(selectedVariant.hinhAnhUrls[0]);

                setCurrentPrice(selectedVariant.giaKhuyenMai || selectedVariant.donGia);
                setCurrentQuantity(selectedVariant.soLuong);
                setQuantity(1);
            }
        }
    }, [selectedColor, selectedWeight, product]);

    const handleIncrease = () => {
        const selectedVariant = product.variants.find(
            (v) => v.mauSacTen === selectedColor && v.trongLuongTen === selectedWeight,
        );
        if (selectedVariant && quantity < selectedVariant.soLuong) {
            setQuantity(quantity + 1);
        }
    };

    const handleDecrease = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleAddCart = async () => {
        const selectedVariant = product.variants.find(
            (v) => v.mauSacTen === selectedColor && v.trongLuongTen === selectedWeight,
        );
        if (!selectedVariant) {
            swal('Thất bại!', 'Vui lòng chọn màu sắc và trọng lượng!', 'error');
            return;
        }
        if (quantity > selectedVariant.soLuong) {
            swal('Thất bại!', 'Số lượng vượt quá số lượng trong kho!', 'error');
            return;
        }

        const idTaiKhoan = 1; // ID tài khoản thực tế
        const payload = {
            idTaiKhoan: idTaiKhoan,
            idSanPhamCT: selectedVariant.id,
            soLuong: quantity,
        };
        try {
            const response = await axios.post('http://localhost:8080/api/gio-hang/them', payload);
            if (response.status === 201) {
                swal('Thành công!', 'Sản phẩm đã được thêm vào giỏ hàng!', 'success');
                // Gọi API để lấy số lượng sản phẩm trong giỏ hàng
                const countResponse = await axios.get(`http://localhost:8080/api/gio-hang/${idTaiKhoan}/count`);
                setCartItemCount(countResponse.data); // Cập nhật số lượng giỏ hàng
            } else {
                swal('Thất bại!', 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng!', 'error');
            }
        } catch (error) {
            console.error('Failed to add product to cart', error);
            swal('Thất bại!', 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng!', 'error');
        }
    };

    const handleThumbnailClick = (image) => {
        setMainImage(image);
    };

    // Hàm để thêm bình luận
    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (newComment.trim() === '') return; // Không cho phép bình luận trống
        const commentData = {
            text: newComment,
            rating: newRating,
        };
        setComments([...comments, commentData]);
        setNewComment('');
        setNewRating(1); // Reset đánh giá về 1 sao
    };

    if (!product) {
        return <div>Loading...</div>; // Hiển thị loading khi dữ liệu chưa được tải
    }

    return (
        <div className="bg-white">
            <div className="pt-6">
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-10 px-4 pt-10">
                    {/* Image gallery */}
                    <div className="flex flex-col items-center h-[510px]">
                        <div className="overflow-hidden rounded-lg max-w-[30rem] max-h-[35rem]">
                            <img alt={mainImage} src={mainImage} className="h-full w-full object-cover object-center" />
                        </div>
                        <div className="flex flex-wrap space-x-5 justify-center">
                            {currentImages.map((link, index) => (
                                <div
                                    key={index}
                                    className="aspect-h-2 aspect-w-3 overflow-hidden rounded-lg max-w-[5rem] max-h-[10rem] mt-4"
                                    onClick={() => handleThumbnailClick(link)}
                                >
                                    <img
                                        alt={`Image ${index}`}
                                        src={link}
                                        className="h-full w-full object-cover object-center cursor-pointer"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product info */}
                    <div className="lg:col-span-1 maxt-auto max-w-2xl px-4 pb-16 sm:px-6 lg:max-w-7xl lg:px-8 lg:pb-24">
                        <div className="lg:col-span-2">
                            <h1 className="text-[25px] lg:text-[29px] font-semibold text-gray-900">
                                {product.tenSanPham}
                            </h1>
                            <div className="flex justify-between text-sm">
                                <p>
                                    Thương hiệu: <span className="text-[#2f19ae]">{product.thuongHieu}</span>
                                </p>
                                <p>
                                    Tình trạng:
                                    <span className="text-[#2f19ae]">
                                        {product.soLuong > 0 ? ' Còn hàng' : ' Hết hàng'}
                                    </span>
                                </p>
                                <p>
                                    Số lượng trong kho:
                                    <span className="text-[#2f19ae]">{currentQuantity}</span>
                                </p>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="mt-4 lg:row-span-3 lg:mt-0">
                            <h2 className="sr-only">Product information</h2>
                            <div className="flex items-center space-x-4">
                                {product && product.variants.length > 0 && (
                                    <>
                                        {product.variants.map((variant) => {
                                            if (
                                                variant.mauSacTen === selectedColor &&
                                                variant.trongLuongTen === selectedWeight
                                            ) {
                                                return (
                                                    <div key={variant.id} className="flex items-center space-x-2">
                                                        {/* Giá khuyến mãi */}
                                                        <span className="text-3xl font-bold text-red-600">

                                                            {(variant.giaKhuyenMai || variant.donGia).toLocaleString()} ₫
                                                        </span>

                                                        {/* Giá gốc và % giảm */}
                                                        {variant.giaKhuyenMai && variant.giaTriKhuyenMai && (
                                                            <>
                                                                <span className="text-[17px] text-gray-500 line-through">
                                                                    {variant.donGia.toLocaleString()} ₫
                                                                </span>
                                                                <span className="bg-red-500 text-white text-sm font-medium px-2 py-1 rounded">
                                                                    -{variant.giaTriKhuyenMai}%
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                    </>
                                )}
                            </div>

                            <form className="mt-5">
                                {/* Color Selection */}
                                <div className="bg-white border border-gray-200 rounded-2xl p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <div className="w-4 h-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mr-2"></div>
                                        Màu sắc
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {product.mauSac.map((color) => (
                                            <div
                                                key={color}
                                                className={`group relative flex items-center p-2 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                                                    selectedColor === color
                                                        ? 'border-indigo-500 bg-indigo-50 shadow-md transform scale-105'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                onClick={() => {
                                                    setSelectedColor(color);
                                                    const foundVariant =
                                                        product.variants.find(
                                                            (v) =>
                                                                v.mauSacTen === color &&
                                                                v.trongLuongTen === selectedWeight,
                                                        ) || product.variants.find((v) => v.mauSacTen === color);
                                                    if (foundVariant) {
                                                        setCurrentImages(foundVariant.hinhAnhUrls);
                                                        setMainImage(foundVariant.hinhAnhUrls[0]);

                                                        setCurrentPrice(foundVariant.giaKhuyenMai || foundVariant.donGia);

                                                        setCurrentQuantity(foundVariant.soLuong);
                                                        setQuantity(1);
                                                    }
                                                }}
                                            >
                                                {selectedColor === color && (
                                                    <div className="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full p-1">
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div className="relative overflow-hidden rounded-lg mr-2">
                                                    <img
                                                        src={
                                                            product.variants.find((v) => v.mauSacTen === color)
                                                                ?.hinhAnhUrls[0] || ''
                                                        }
                                                        alt={color}
                                                        className="h-12 w-12 object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                </div>
                                                <div className="flex flex-col flex-1">
                                                    <span className="text-sm font-medium text-gray-900">{color}</span>
                                                    <span className="text-lg font-bold text-red-600">
                                                        {product.variants
                                                            .find((v) => v.mauSacTen === color)

                                                            ?.giaKhuyenMai?.toLocaleString() || 
                                                            product.variants
                                                            .find((v) => v.mauSacTen === color)
                                                            ?.donGia.toLocaleString()}
                                                        <span className="text-sm ml-1">₫</span>
                                                    </span>
                                                    {product.variants.find((v) => v.mauSacTen === color)?.giaKhuyenMai && (

                                                        <span className="text-sm text-gray-500 line-through">
                                                            {product.variants
                                                                .find((v) => v.mauSacTen === color)
                                                                ?.donGia.toLocaleString() || ''}
                                                            <span className="text-sm ml-1">₫</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Weight Selection */}
                                <div className="bg-white border border-gray-200 rounded-2xl p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mr-2"></div>
                                            Trọng lượng
                                        </h3>
                                    </div>
                                    <fieldset aria-label="Chọn trọng lượng" className="mt-4">
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                            {product.trongLuong.map((weight) => {
                                                const variant = product.variants.find(
                                                    (v) => v.mauSacTen === selectedColor && v.trongLuongTen === weight,
                                                );
                                                const inStock = variant && variant.soLuong > 0;
                                                return (
                                                    <div
                                                        key={weight}
                                                        className={`relative flex items-center justify-center rounded-xl border-2 px-2 py-2 text-sm font-semibold transition-all duration-300 ${
                                                            selectedWeight === weight
                                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md transform scale-105'
                                                                : 'border-gray-300'
                                                        } ${
                                                            inStock
                                                                ? 'cursor-pointer bg-white text-gray-900 hover:border-gray-400 hover:shadow-sm'
                                                                : 'cursor-not-allowed bg-gray-50 text-gray-300'
                                                        }`}
                                                        onClick={() => {
                                                            if (inStock) {
                                                                setSelectedWeight(weight);
                                                            }
                                                        }}
                                                    >
                                                        {selectedWeight === weight && (
                                                            <div className="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full p-1">
                                                                <svg
                                                                    className="w-3 h-3"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            </div>
                                                        )}
                                                        <span className="text-center">{weight}</span>
                                                        {!inStock && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <span className="text-xs text-red-500 font-medium">
                                                                    Hết hàng
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </fieldset>
                                </div>

                                {/* Quantity Selector */}
                                <div className="bg-gray-20 rounded-2xl p-4 h-[50px] flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            type="button"
                                            className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-300 bg-white hover:border-indigo-500 hover:text-indigo-500 transition-colors duration-200"
                                            onClick={handleDecrease}
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M20 12H4"
                                                />
                                            </svg>
                                        </button>

                                        <div className="relative">
                                            <input
                                                className="w-16 h-10 text-center text-lg font-semibold border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                                                min="1"
                                                type="number"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-300 bg-white hover:border-indigo-500 hover:text-indigo-500 transition-colors duration-200"
                                            onClick={handleIncrease}
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Add to Cart Button */}
                                <button
                                    type="button"
                                    onClick={handleAddCart}
                                    className="w-full bg-gradient-to-r from-purple-800 to-pink-200 text-white font-semibold py-3 px-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
                                >
                                    <div className="flex items-center justify-center space-x-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 7H3M7 13v8a2 2 0 002 2h6a2 2 0 002-2v-8m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6"
                                            />
                                        </svg>
                                        <span>Thêm vào giỏ hàng</span>
                                    </div>
                                </button>
                            </form>
                        </div>
                    </div>
                </section>

                {/* Phần bình luận và đánh giá */}
                <div className="mt-10 px-4">
                    <h2 className="text-lg font-semibold">Bình luận và đánh giá</h2>
                    <form onSubmit={handleCommentSubmit} className="mt-4">
                        <textarea
                            className="w-full border rounded-md p-2"
                            rows="4"
                            placeholder="Nhập bình luận của bạn..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <div className="flex items-center mt-2">
                            <span className="mr-2">Đánh giá:</span>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={classNames(
                                        'cursor-pointer',
                                        newRating >= star ? 'text-yellow-500' : 'text-gray-300',
                                    )}
                                    onClick={() => setNewRating(star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <button type="submit" className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md">
                            Gửi bình luận
                        </button>
                    </form>

                    {/* Hiển thị danh sách bình luận */}
                    <div className="mt-6">
                        {comments.length > 0 ? (
                            comments.map((comment, index) => (
                                <div key={index} className="border-b py-2">
                                    <div className="flex items-center">
                                        <span className="text-yellow-500">
                                            {Array.from({ length: comment.rating }, (_, i) => (
                                                <span key={i}>★</span>
                                            ))}
                                            {Array.from({ length: 5 - comment.rating }, (_, i) => (
                                                <span key={i} className="text-gray-300">
                                                    ★
                                                </span>
                                            ))}
                                        </span>
                                    </div>
                                    <p className="mt-1">{comment.text}</p>
                                </div>
                            ))
                        ) : (
                            <p>Chưa có bình luận nào.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
