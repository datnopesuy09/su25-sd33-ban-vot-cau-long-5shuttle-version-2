// import React, { useState, useEffect } from 'react';
// import { X, Receipt, Search, Filter, Plus, Minus} from 'lucide-react';
// import swal from 'sweetalert';



// const ProductModal = ({ showProductModal, handleCloseProductModal, idBill, onAddProduct }) => {
//     const [searchTerm, setSearchTerm] = useState('');
//     const [brandFilter, setBrandFilter] = useState('');
//     const [colorFilter, setColorFilter] = useState('');
//     const [weightFilter, setWeightFilter] = useState('');
//     const [priceFilter, setPriceFilter] = useState('');
//     const [products, setProducts] = useState([]);
//     const [showDetailModal, setShowDetailModal] = useState(false);
//         const [selectedProduct, setSelectedProduct] = useState(null);
//         const [quantity, setQuantity] = useState(1);

//     // Gọi API để lấy dữ liệu sản phẩm
//     useEffect(() => {
//         const fetchProducts = async () => {
//             try {
//                 const response = await fetch('http://localhost:8080/api/san-pham-ct/all-with-image');
//                 const data = await response.json();
//                 setProducts(data);
//             } catch (error) {
//                 console.error('Error fetching products:', error);
//             }
//         };

//         fetchProducts();
//     }, []);

    
//     const handleOpenDetailModal = (product) => {
           
//             setSelectedProduct(product);
//             setQuantity(1);
//             setShowDetailModal(true);
//         };

//     // Lọc sản phẩm
//     const filteredProducts = products.filter((product) => {
//         const matchesSearch = searchTerm === '' || product.tenSanPham.toLowerCase().includes(searchTerm.toLowerCase());
//         const matchesBrand = brandFilter === '' || product.thuongHieu.toLowerCase().includes(brandFilter.toLowerCase());
//         const matchesColor = colorFilter === '' || product.mauSac.toLowerCase().includes(colorFilter.toLowerCase());
//         const matchesWeight = weightFilter === '' || product.trongLuong === weightFilter;
//         const matchesPrice = priceFilter === '' || product.donGia <= priceFilter;

//         return matchesSearch && matchesBrand && matchesColor && matchesWeight && matchesPrice;
//     });

//     const handleConfirmAddProduct = async () => {
//             try {
//                 const billDetail = {
//                     idSanPhamCT: selectedProduct.id,
//                     idHoaDon: idBill.id,
//                     soLuong: quantity,
//                     giaBan: selectedProduct.donGia,
//                     trangThai: 1,
//                 };
    
//                 await onAddProduct(billDetail);
//                 setShowDetailModal(false);
//                 swal('Thành công', 'Đã thêm sản phẩm vào hóa đơn', 'success');
//                 console.log('biu di theo: ', billDetail);
//             } catch (error) {
//                 console.error('Error adding product to bill:', error);
//                 swal('Lỗi', 'Không thể thêm sản phẩm vào hóa đơn', 'error');
//             }
//         };

//     if (!showProductModal) return null;

//     return (
//         <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
//             {/* Backdrop */}
//             <div
//                 className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
//                 onClick={handleCloseProductModal}
//             />

//             {/* Modal Container */}
//             <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
//                 {/* Header */}
//                 <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6 h-[80px]">
//                     <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-4">
//                             <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
//                                 <Receipt className="w-7 h-7" />
//                             </div>
//                             <div>
//                                 <h2 className="text-2xl font-bold">Thông tin sản phẩm</h2>
//                             </div>
//                         </div>
//                         <button
//                             onClick={handleCloseProductModal}
//                             className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:rotate-90"
//                         >
//                             <X className="w-6 h-6" />
//                         </button>
//                     </div>
//                 </div>

//                 {/* Content */}
//                 <div className="p-6 overflow-y-auto max-h-[80vh]">
//                     {' '}
//                     {/* Thay đổi max-h thành 80vh */}
//                     {/* Search and Filters */}
//                     <div className="mb-8 space-y-4">
//                         {/* Search Bar */}
//                         <div className="relative">
//                             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                             <input
//                                 type="text"
//                                 placeholder="Tìm kiếm sản phẩm..."
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 text-gray-700"
//                             />
//                         </div>

//                         {/* Filters */}
//                         <div className="flex items-center space-x-2 mb-4">
//                             <div className="flex items-center space-x-2 text-gray-600">
//                                 <Filter className="w-5 h-5" />
//                                 <span className="font-medium">Bộ lọc:</span>
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                             <select
//                                 value={brandFilter}
//                                 onChange={(e) => setBrandFilter(e.target.value)}
//                                 className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 bg-white"
//                             >
//                                 <option value="">Tất cả thương hiệu</option>
//                                 <option value="Yonex">Yonex</option>
//                                 <option value="Lining">Lining</option>
//                                 <option value="Victor">Victor</option>
//                                 <option value="Mizuno">Mizuno</option>
//                                 <option value="Adidas">Adidas</option>
//                             </select>

//                             <select
//                                 value={colorFilter}
//                                 onChange={(e) => setColorFilter(e.target.value)}
//                                 className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 bg-white"
//                             >
//                                 <option value="">Tất cả màu sắc</option>
//                                 <option value="Đỏ">Đỏ</option>
//                                 <option value="Xanh">Xanh</option>
//                                 <option value="Trắng">Trắng</option>
//                             </select>

//                             <select
//                                 value={weightFilter}
//                                 onChange={(e) => setWeightFilter(e.target.value)}
//                                 className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 bg-white"
//                             >
//                                 <option value="">Tất cả trọng lượng</option>
//                                 <option value="2U">2U</option>
//                                 <option value="3U">3U</option>
//                                 <option value="4U">4U</option>
//                                 <option value="5U">5U</option>
//                                 <option value="6U">6U</option>
//                             </select>

//                             <select
//                                 value={priceFilter}
//                                 onChange={(e) => setPriceFilter(e.target.value)}
//                                 className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 bg-white"
//                             >
//                                 <option value="">Tất cả giá</option>
//                                 <option value="1000000">Dưới 1 triệu</option>
//                                 <option value="3000000">Dưới 3 triệu</option>
//                                 <option value="5000000">Dưới 5 triệu</option>
//                             </select>
//                         </div>
//                     </div>
//                     {/* Products Grid */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                         {filteredProducts.map((product) => (
//                             <div
//                                 key={product.id}
//                                 className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1"
//                             >
//                                 {/* Product Image */}
//                                 <div className="relative overflow-hidden">
//                                     <div className="absolute top-3 right-3 z-10">
//                                         <button
//                                                                                         className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-blue-500 hover:text-white transition-all group-hover:scale-110"
//                                                                                         onClick={() => handleOpenDetailModal(product)}
//                                                                                     >
//                                                                                         <Plus className="w-5 h-5" />
//                                                                                     </button>
//                                     </div>

//                                     <img
//                                         src={product.anhDaiDien || 'https://via.placeholder.com/400'} // Placeholder nếu không có ảnh
//                                         alt={product.tenSanPham}
//                                         className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
//                                     />
//                                 </div>

//                                 {/* Product Info */}
//                                 <div className="p-5">
//                                     <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-blue-600 transition-colors duration-200">
//                                         {product.tenSanPham}
//                                     </h3>

//                                     {/* Hiển thị màu sắc */}
//                                     {product.mauSac && (
//                                         <div className="mb-2 text-sm text-gray-600">
//                                             Màu sắc: <span className="font-medium">{product.mauSac}</span>
//                                         </div>
//                                     )}

//                                     <div className="flex items-center justify-between mb-3">
//                                         <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
//                                             {product.trongLuong}
//                                         </span>
//                                         <span
//                                             className={`px-3 py-1 rounded-full text-sm font-medium ${
//                                                 product.soLuong > 5
//                                                     ? 'bg-green-100 text-green-700'
//                                                     : product.soLuong > 0
//                                                       ? 'bg-yellow-100 text-yellow-700'
//                                                       : 'bg-red-100 text-red-700'
//                                             }`}
//                                         >
//                                             SL: {product.soLuong}
//                                         </span>
//                                     </div>

//                                     {/* Giá tiền màu đỏ */}
//                                     <span className="text-2xl font-bold text-red-600">
//                                         {product.donGia.toLocaleString()}₫
//                                     </span>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                     {/* No products found */}
//                     {filteredProducts.length === 0 && (
//                         <div className="text-center py-12">
//                             <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
//                                 <Search className="w-8 h-8 text-gray-400" />
//                             </div>
//                             <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy sản phẩm</h3>
//                             <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
//                         </div>
//                     )}
//                 </div>
//             </div>
//             {showDetailModal && selectedProduct && (
//                 <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
//                     <div
//                         className="absolute inset-0 bg-black/60 backdrop-blur-sm"
//                         onClick={() => setShowDetailModal(false)}
//                     />
//                     <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
//                         <h2 className="text-2xl font-bold mb-4">{selectedProduct.tenSanPham}</h2>

//                         <div className="mb-4 space-y-2">
//                             <p className="font-semibold">Thương hiệu: {selectedProduct.thuongHieu}</p>
//                             <p className="font-semibold">Màu sắc: {selectedProduct.mauSac}</p>
//                             <p className="font-semibold">Trọng lượng: {selectedProduct.trongLuong}</p>
//                             <p className="font-semibold">Đơn giá: {selectedProduct.donGia.toLocaleString()}₫</p>
//                             <p className="font-semibold">SL tồn: {selectedProduct.soLuong}</p>
//                         </div>

//                         <div className="flex items-center mb-6">
//                             <button
//                                 onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
//                                 className="bg-gray-200 p-2 rounded-lg"
//                             >
//                                 <Minus className="w-5 h-5" />
//                             </button>
//                             <span className="mx-4 font-bold text-xl">{quantity}</span>
//                             <button
//                                 onClick={() => setQuantity((prev) => Math.min(selectedProduct.soLuong, prev + 1))}
//                                 className="bg-gray-200 p-2 rounded-lg"
//                             >
//                                 <Plus className="w-5 h-5" />
//                             </button>
//                         </div>

//                         <p className="text-lg font-bold mb-4">
//                             Thành tiền:{' '}
//                             <span className="text-red-600">
//                                 {(selectedProduct.donGia * quantity).toLocaleString()}₫
//                             </span>
//                         </p>

//                         <div className="flex space-x-4">
//                             <button
//                                 onClick={() => setShowDetailModal(false)}
//                                 className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium"
//                             >
//                                 Hủy
//                             </button>
//                             <button
//                                 onClick={handleConfirmAddProduct}
//                                 className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700"
//                             >
//                                 Xác nhận
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ProductModal;
