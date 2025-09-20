import React from 'react';

const PolicyPage = () => {
    return (
        <div className="max-w-4xl mx-auto p-6 text-gray-800">
            <h1 className="text-3xl font-bold mb-6 text-center">Chính sách cửa hàng</h1>

            {/* Chính sách trả hàng */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">1. Chính sách trả hàng</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        Khách hàng có thể yêu cầu trả hàng <strong>trong vòng 14 ngày</strong> kể từ ngày đặt sản phẩm.
                    </li>
                    <li>Sản phẩm phải còn nguyên vẹn, không bị hư hỏng do lỗi từ phía khách hàng.</li>
                    <li>
                        Trường hợp sản phẩm lỗi, hư hỏng do nhà sản xuất hoặc giao sai mẫu, cửa hàng sẽ hoàn tiền 100%.
                    </li>
                    <li>
                        Với các trường hợp khác, cửa hàng hoàn tiền sau khi trừ chi phí vận chuyển và xử lý (nếu có).
                    </li>
                    <li>
                        Mỗi hóa đơn chỉ được tạo <strong>01 yêu cầu trả hàng</strong>.
                    </li>
                </ul>
            </section>

            {/* Chính sách bảo hành */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">2. Chính sách bảo hành</h2>
                <p>
                    Các sản phẩm của cửa hàng được bảo hành theo quy định của nhà sản xuất. Thời gian bảo hành tiêu
                    chuẩn: <strong>12 tháng</strong> kể từ ngày mua hàng.
                </p>
            </section>

            {/* Chính sách thanh toán */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">3. Chính sách thanh toán</h2>
                <p>
                    Cửa hàng hỗ trợ thanh toán bằng tiền mặt khi nhận hàng (COD). Với đơn hàng trên{' '}
                    <strong>1.000.000đ</strong>, khách hàng cần đặt cọc trước <strong>30%</strong> giá trị đơn hàng.
                </p>
            </section>

            {/* Chính sách vận chuyển */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">4. Chính sách vận chuyển</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Miễn phí vận chuyển với đơn hàng trên 500.000đ.</li>
                    <li>Khu vực nội thành: giao hàng trong 24h.</li>
                    <li>Khu vực ngoại tỉnh: thời gian từ 2-5 ngày tùy địa chỉ.</li>
                </ul>
            </section>

            <p className="text-sm text-gray-600 text-center mt-8">
                Mọi thắc mắc vui lòng liên hệ Hotline: <strong>0123 456 789</strong> hoặc Email: support@cuahang.com
            </p>
        </div>
    );
};

export default PolicyPage;
