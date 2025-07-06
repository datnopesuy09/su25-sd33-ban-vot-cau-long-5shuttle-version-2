import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';

function DefaultLayout({ children }) {
    // const { setCartItemCount } = useContext(CartContext);

    // const loadCarts = async (taiKhoanId) => {
    //     try {
    //         const response = await axios.get(`http://localhost:8080/api/gio-hang/with-images/${taiKhoanId}`);
    //         const carts = response.data;

    //         // Lọc giỏ hàng để lấy số lượng sản phẩm không trùng lặp
    //         const productMap = new Map();
    //         carts.forEach((cart) => {
    //             const productId = cart.gioHang.sanPhamCT.sanPham.id;
    //             if (!productMap.has(productId)) {
    //                 productMap.set(productId, cart);
    //             }
    //         });

    //         setCartItemCount(productMap.size); // Cập nhật số lượng sản phẩm không trùng lặp
    //     } catch (error) {
    //         console.error('Failed to fetch Carts', error);
    //     }
    // };

    // useEffect(() => {
    //     loadCarts(1); // Thay đổi ID tài khoản nếu cần
    // }, []);

    return (
        <div className="DefaultLayout">
            <Navbar />
            <div className="container mt-[70px]">
                <div className="content">{children}</div>
            </div>
            <Footer />
        </div>
    );
}

export default DefaultLayout;
