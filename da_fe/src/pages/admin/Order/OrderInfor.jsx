// OrderInfo.js
import React from 'react';

const OrderInfo = ({
    orderData,
    currentOrderStatus,
    checkOut,
    getInvoiceTypeStyle,
    getStatusLabel,
    getStatusStyle,
    getStatus,
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-5xl mx-auto mt-8">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
                <h2 className="text-lg font-medium text-gray-800">Thông tin đơn hàng - Đơn tại quầy</h2>
            </div>

            {/* Order Information */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-8">
                    <div className="flex flex-wrap md:flex-nowrap gap-4 mb-2">
                        <div className="flex items-center flex-shrink-0 min-w-[30px] font-semibold text-gray-600">
                            Mã:
                        </div>
                        <div className="flex-1 min-w-0 text-gray-900 truncate whitespace-nowrap">{orderData.ma}</div>
                    </div>

                    <div className="flex flex-wrap md:flex-nowrap gap-4 mb-2">
                        <div className="flex items-center flex-shrink-0 min-w-[120px] font-semibold text-gray-600">
                            Số người nhận:
                        </div>
                        <div className="flex-1 min-w-0 text-gray-900 truncate whitespace-nowrap">
                            {orderData.sdtNguoiNhan}
                        </div>
                    </div>

                    <div className="flex flex-wrap md:flex-nowrap gap-4 mb-2">
                        <div className="flex items-center flex-shrink-0 min-w-[120px] font-semibold text-gray-600">
                            Tên khách hàng:
                        </div>
                        <div className="flex-1 min-w-0 text-gray-900 truncate whitespace-nowrap">
                            {orderData.taiKhoan.hoTen}
                        </div>
                    </div>

                    <div className="flex flex-wrap md:flex-nowrap gap-4 mb-2">
                        <div className="flex items-center flex-shrink-0 min-w-[30px] font-semibold text-gray-600">
                            Loại:
                        </div>
                        <div className="flex-1 min-w-0">
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getInvoiceTypeStyle(orderData.loaiHoaDon)}`}
                            >
                                {orderData.loaiHoaDon}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap md:flex-nowrap gap-4 mb-2">
                        <div className="flex items-center flex-shrink-0 min-w-[120px] font-semibold text-gray-600">
                            Trạng thái:
                        </div>
                        <div className="flex-1 min-w-0">
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusLabel(currentOrderStatus).color} whitespace-nowrap`}
                            >
                                {getStatusLabel(currentOrderStatus).label}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap md:flex-nowrap gap-4 mb-2">
                        <div className="flex items-center flex-shrink-0 min-w-[120px] font-semibold text-gray-600">
                            Tên người nhận:
                        </div>
                        <div className="flex-1 min-w-0 text-gray-900 truncate whitespace-nowrap">
                            {orderData.tenNguoiNhan}
                        </div>
                    </div>
                </div>

                {/* Payment History Section */}
                <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-800">Lịch sử thanh toán</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b border-gray-200">
                                        Số tiền
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b border-gray-200">
                                        Thời gian
                                    </th>
                                    {/* <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b border-gray-200">
                                            Loại giao dịch
                                        </th> */}
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b border-gray-200">
                                        PTTT
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b border-gray-200">
                                        Trạng thái
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b border-gray-200">
                                        Ghi chú
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b border-gray-200">
                                        Nhân viên xác nhận
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {checkOut.map((ck, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-100">
                                            {ck.tongTien.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-100">
                                            {ck.ngayTao}
                                        </td>
                                        {/* <td className="px-4 py-4 text-sm border-b border-gray-100">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(ck.hoaDon.loaiHoaDon)}`}
                                                >
                                                    {ck.hoaDon.loaiHoaDon}
                                                </span>
                                            </td> */}
                                        <td className="px-4 py-4 text-sm border-b border-gray-100">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(ck.phuongThucThanhToan)}`}
                                            >
                                                {ck.phuongThucThanhToan}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm border-b border-gray-100">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(ck.trangThai)}`}
                                            >
                                                {getStatus(ck.trangThai).label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-100">-</td>
                                        <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-100">
                                            {ck.taiKhoan.hoTen}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderInfo;
