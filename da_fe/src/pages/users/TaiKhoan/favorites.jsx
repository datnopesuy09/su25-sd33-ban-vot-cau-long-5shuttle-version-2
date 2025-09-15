import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { Heart } from 'lucide-react';
import axios from 'axios';
import { useUserAuth } from '../../../contexts/userAuthContext';
import { toast } from 'react-toastify';
import ProductCard from '../Product/ProductCard';
import '../Product/ProductCard.css';

function Favorites() {
    const { user } = useUserAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Hàm lấy token từ user hoặc localStorage
    const getToken = () => {
        const token = user?.token || localStorage.getItem('userToken');
        console.log('Token from user:', user?.token);
        console.log('Token from localStorage (userToken):', localStorage.getItem('userToken'));
        console.log('Final token used:', token);
        return token;
    };

    // Gọi API để lấy danh sách sản phẩm yêu thích
    useEffect(() => {
        const fetchFavorites = async () => {
            const token = getToken();
            if (!token) {
                toast.error('Vui lòng đăng nhập để xem danh sách yêu thích.');
                setLoading(false);
                localStorage.removeItem('userToken');
                return;
            }

            try {
                setLoading(true);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout 10s

                const response = await axios.get('http://localhost:8080/wish-list', {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);

                const data = response.data;
                console.log('Wish-list API response:', data);

                if (data.code === 1000) {
                    const productDetails = data.result.sanPhamList.map((item) => ({
                        id: item.id,
                        tenSanPham: item.ten || 'Sản phẩm không tên',
                        hinhAnhDaiDien: item.hinhAnh || 'https://placehold.co/300x300',
                        donGia: item.donGia || 0,
                        giaKhuyenMai: item.giaKhuyenMai || null,
                        giaTriKhuyenMai: item.giaTriKhuyenMai || null,
                    }));
                    setFavorites(productDetails);
                } else {
                    toast.error('Không thể tải danh sách yêu thích.');
                }
            } catch (error) {
                console.error('Lỗi khi gọi API wish-list:', error);
                if (error.response?.status === 401) {
                    toast.error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
                    localStorage.removeItem('userToken');
                } else if (error.name === 'AbortError') {
                    toast.error('Yêu cầu tải quá lâu, vui lòng thử lại.');
                } else {
                    toast.error('Có lỗi xảy ra khi tải danh sách yêu thích.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [user]);

    return (
        <Box className="bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen p-4 sm:p-6 lg:p-20 max-w-7xl mx-auto">
            <Box className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                    <Heart className="h-8 w-8 text-white" />
                </div>
                <div>
                    <Typography
                        variant="h4"
                        className="font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
                    >
                        Sản Phẩm Yêu Thích
                    </Typography>
                    <Typography className="text-gray-600 mt-2">
                        {loading ? 'Đang tải...' : `(${favorites.length} sản phẩm)`}
                    </Typography>
                </div>
            </Box>

            {loading ? (
                <Box className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, index) => (
                        <Box key={index} className="p-4 rounded-lg shadow-lg bg-gray-100 animate-pulse">
                            <Box className="h-48 w-full bg-gray-200 rounded-t-lg"></Box>
                            <Box className="p-4 space-y-2">
                                <Box className="h-6 w-3/4 bg-gray-200 rounded"></Box>
                            </Box>
                        </Box>
                    ))}
                </Box>
            ) : favorites.length === 0 ? (
                <Box className="text-center py-20">
                    <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <Typography variant="h6" className="text-gray-600 mb-4">
                        Chưa có sản phẩm yêu thích nào!
                    </Typography>
                    <Link to="/san-pham">
                        <Button
                            variant="contained"
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2"
                        >
                            Khám phá ngay
                        </Button>
                    </Link>
                </Box>
            ) : (
                <Box className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {favorites.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </Box>
            )}
        </Box>
    );
}

export default Favorites;
