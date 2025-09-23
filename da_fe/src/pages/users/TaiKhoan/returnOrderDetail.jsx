import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import {
    Package,
    RotateCcw,
    Calendar,
    DollarSign,
    Tag,
    CheckCircle,
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    FileText,
    Clock,
    AlertCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';

const formatCurrency = (value) => {
    const n = Number(value ?? 0);
    return n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// Resolve image URL for a return item with robust fallbacks
const resolveReturnImage = (chiTiet) => {
    const PH = 'https://via.placeholder.com/80?text=No+Image';
    if (!chiTiet) return PH;
    const sp = chiTiet.thongTinSanPhamTra || {};

    // Direct fields on detail or nested return info
    const direct =
        chiTiet.hinhAnhUrl ||
        chiTiet.hinhAnh ||
        sp.hinhAnhUrl ||
        sp.hinhAnh;
    if (direct) return direct;

    // Variant (sanPhamCT) or product (sanPham) images
    const spct = sp.sanPhamCT || {};
    const product = spct.sanPham || {};
    const nested = spct.hinhAnhUrl || spct.hinhAnh || product.hinhAnhUrl || product.hinhAnh;
    if (nested) return nested;

    // Uploaded filename array from product
    if (product.hinhAnhs && Array.isArray(product.hinhAnhs) && product.hinhAnhs.length > 0) {
        return `http://localhost:8080/uploads/${product.hinhAnhs[0]}`;
    }

    return PH;
};

// Helper: ưu tiên số tiền hoàn (đã trừ voucher); cho phép truyền vào fallbackRatio khi backend chưa có tyLeGiamGia
const getItemRefundInfo = (chiTiet, fallbackRatio = null) => {
    const sanPham = chiTiet?.thongTinSanPhamTra || {};
    const unitOriginal = Number(sanPham.giaBan || chiTiet?.donGiaGoc || 0);
    const qtyApproved = Number(chiTiet?.soLuongPheDuyet || 0);

    // tyLeGiamGia: tỉ lệ áp dụng cho item (0..1)
    const ratio = typeof chiTiet?.tyLeGiamGia === 'number' ? chiTiet.tyLeGiamGia : (typeof fallbackRatio === 'number' ? fallbackRatio : null);
    const unitAdjusted = ratio != null ? unitOriginal * (1 - ratio) : unitOriginal;

    // soTienHoanTra: tổng tiền đã tính từ backend (ưu tiên)
    const totalRefund =
        typeof chiTiet?.soTienHoanTra === 'number'
            ? Number(chiTiet.soTienHoanTra)
            : unitAdjusted * qtyApproved;

    return {
        unitOriginal,
        unitAdjusted,
        qtyApproved,
        totalRefund,
    };
};

const getStatusStyle = (status) => {
    switch (status) {
        case 'APPROVED':
            return 'bg-green-50 text-green-700 border-green-200';
        case 'PENDING':
            return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        case 'REJECTED':
            return 'bg-red-50 text-red-700 border-red-200';
        default:
            return 'bg-gray-50 text-gray-700 border-gray-200';
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'APPROVED':
            return 'Đã duyệt';
        case 'PENDING':
            return 'Chờ duyệt';
        case 'REJECTED':
            return 'Đã từ chối';
        default:
            return 'Không xác định';
    }
};

function ReturnOrderDetail() {
    const { id } = useParams();
    const [phieuTraHang, setPhieuTraHang] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orderSubtotal, setOrderSubtotal] = useState(null);
    const [orderVoucher, setOrderVoucher] = useState(null);

    // Tính tỷ lệ giảm giá dựa trên voucher và tổng tiền hàng của đơn gốc (reuse logic từ trang tạo trả hàng)
    const getDiscountRatio = (voucher, subtotal) => {
        if (!voucher || !subtotal || subtotal <= 0) return 0;

        let discountAmount = 0;
        const type = voucher.kieuGiaTri;

        // Percent
        if (type === 0 || (type === 1 && voucher?.schema === 'percent')) {
            discountAmount = subtotal * (Number(voucher.giaTri || 0) / 100);
            if (voucher.giaTriMax) {
                discountAmount = Math.min(discountAmount, Number(voucher.giaTriMax));
            }
        } else {
            // Fixed amount
            discountAmount = Number(voucher.giaTri || 0);
        }

        // Không vượt quá subtotal
        discountAmount = Math.min(discountAmount, subtotal);
        return Math.min(discountAmount / subtotal, 1);
    };

    // Tỷ lệ dự đoán khi backend chưa cung cấp tyLeGiamGia/soTienHoanTra (trước khi duyệt)
    const predictedRatio = useMemo(() => {
        if (!orderVoucher || !orderSubtotal) return null;
        return getDiscountRatio(orderVoucher, Number(orderSubtotal));
    }, [orderVoucher, orderSubtotal]);

    useEffect(() => {
        const fetchPhieuTraHangDetail = async () => {
            try {
                const token = localStorage.getItem('userToken');
                if (!token) {
                    toast.error('Vui lòng đăng nhập');
                    return;
                }

                const headers = { Authorization: `Bearer ${token}` };
                // Lấy danh sách tất cả phiếu trả hàng và tìm phiếu có id tương ứng
                const res = await axios.get('http://localhost:8080/phieu-tra-hang', { headers });

                if (res.data.code === 1000) {
                    const phieuTraHangList = res.data.result;
                    const phieuTraHang = phieuTraHangList.find((phieu) => phieu.id === parseInt(id));

                    if (phieuTraHang) {
                        setPhieuTraHang(phieuTraHang);
                    } else {
                        toast.error('Không tìm thấy phiếu trả hàng');
                    }
                } else {
                    toast.error('Không tìm thấy phiếu trả hàng');
                }
            } catch (error) {
                console.error('Lỗi khi lấy chi tiết phiếu trả hàng:', error);
                toast.error('Không thể tải chi tiết phiếu trả hàng');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPhieuTraHangDetail();
        }
    }, [id]);

    // Sau khi có phiếu trả hàng, nếu thiếu thông tin giảm giá từ backend, thử lấy thông tin đơn gốc để ước tính tỷ lệ
    useEffect(() => {
        const fetchOrderInfo = async () => {
            try {
                if (!phieuTraHang?.hoaDonId) return;
                const token = localStorage.getItem('userToken');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                // Lấy danh sách chi tiết hóa đơn để tính subtotal
                const ctRes = await axios.get(
                    `http://localhost:8080/api/hoa-don-ct/hoa-don/${phieuTraHang.hoaDonId}`,
                    { headers },
                );
                const orderItems = Array.isArray(ctRes.data) ? ctRes.data : [];
                const subtotal = orderItems.reduce(
                    (sum, it) => sum + Number(it.giaBan || 0) * Number(it.soLuong || 0),
                    0,
                );

                // Lấy hóa đơn để lấy thông tin voucher
                const hdRes = await axios.get(
                    `http://localhost:8080/api/hoa-don/${phieuTraHang.hoaDonId}`,
                    { headers },
                );
                const voucher = hdRes?.data?.voucher || null;

                setOrderSubtotal(subtotal);
                setOrderVoucher(voucher);
            } catch (e) {
                // Không chặn UI nếu không lấy được dữ liệu đơn gốc
                console.warn('Không thể lấy thông tin đơn gốc để ước tính voucher ratio:', e);
            }
        };

        // Chỉ cần khi còn thiếu tyLeGiamGia/soTienHoanTra trong các dòng
        if (phieuTraHang?.chiTietTraHang?.length) {
            const missingAdjusted = phieuTraHang.chiTietTraHang.some(
                (ct) => ct?.tyLeGiamGia == null && ct?.soTienHoanTra == null,
            );
            if (missingAdjusted) {
                fetchOrderInfo();
            }
        }
    }, [phieuTraHang]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center gap-2 text-blue-600">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg font-medium">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (!phieuTraHang) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Không tìm thấy phiếu trả hàng</h3>
                    <p className="text-gray-600 mb-6">Phiếu trả hàng này không tồn tại hoặc đã bị xóa</p>
                    <Link
                        to="/profile/order"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

    // Tổng tiền hoàn: đã duyệt thì lấy theo soTienHoanTra/SL duyệt; chờ duyệt thì ước tính theo SL yêu cầu và predictedRatio
    const isApproved = phieuTraHang.trangThai === 'APPROVED';
    const totalAmount = (() => {
        if (isApproved) {
            return (
                phieuTraHang.chiTietTraHang?.reduce((sum, chiTiet) => {
                    const { totalRefund } = getItemRefundInfo(chiTiet, predictedRatio);
                    return sum + (Number.isFinite(totalRefund) ? totalRefund : 0);
                }, 0) || 0
            );
        }
        // PENDING: ước tính
        return (
            phieuTraHang.chiTietTraHang?.reduce((sum, chiTiet) => {
                const sanPham = chiTiet?.thongTinSanPhamTra || {};
                const unitOriginal = Number(sanPham.giaBan || chiTiet?.donGiaGoc || 0);
                const ratio =
                    typeof chiTiet?.tyLeGiamGia === 'number'
                        ? chiTiet.tyLeGiamGia
                        : typeof predictedRatio === 'number'
                          ? predictedRatio
                          : null;
                const unitAdjusted = ratio != null ? unitOriginal * (1 - ratio) : unitOriginal;
                const qty = Number(chiTiet?.soLuongTra || 0);
                const est = unitAdjusted * qty;
                return sum + (Number.isFinite(est) ? est : 0);
            }, 0) || 0
        );
    })();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        to="/profile/order"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Quay lại danh sách</span>
                    </Link>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-100 rounded-xl p-3">
                                    <RotateCcw className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">Chi tiết phiếu trả hàng</h1>
                                    <p className="text-gray-600">Mã phiếu: {phieuTraHang.maPhieuTraHang}</p>
                                </div>
                            </div>

                            <div
                                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border ${getStatusStyle(phieuTraHang.trangThai)}`}
                            >
                                <CheckCircle className="w-4 h-4" />
                                {getStatusLabel(phieuTraHang.trangThai)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Thông tin phiếu trả hàng */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Thông tin cơ bản */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Thông tin phiếu trả hàng
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Mã phiếu trả hàng</label>
                                    <p className="text-gray-800 font-mono">{phieuTraHang.maPhieuTraHang}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Mã đơn hàng gốc</label>
                                    <p className="text-gray-800 font-mono">{phieuTraHang.hoaDonMa}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Hình thức trả</label>
                                    <p className="text-gray-800">{phieuTraHang.hinhThucTra}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Nhân viên xử lý</label>
                                    <p className="text-gray-800">{phieuTraHang.staffEmail || 'Chưa phân công'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Ngày tạo</label>
                                    <p className="text-gray-800 flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {dayjs(phieuTraHang.ngayTao).format('DD/MM/YYYY HH:mm')}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Ngày xử lý</label>
                                    <p className="text-gray-800 flex items-center gap-1">
                                        <Clock className="w-4 h-4" />

                                        {phieuTraHang.ngayXuLy
                                            ? dayjs(phieuTraHang.ngayXuLy).format('DD/MM/YYYY HH:mm')
                                            : 'Chưa xử lý'}
                                    </p>
                                </div>
                            </div>

                            {phieuTraHang.ghiChuKhachHang && (
                                <div className="mt-4">
                                    <label className="text-sm font-medium text-gray-600">Ghi chú của khách hàng</label>
                                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg mt-1">
                                        {phieuTraHang.ghiChuKhachHang}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Chi tiết sản phẩm trả */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                Chi tiết sản phẩm trả
                            </h2>
                            <div className="space-y-4">
                                {phieuTraHang.chiTietTraHang?.map((chiTiet, idx) => {
                                    const sanPham = chiTiet.thongTinSanPhamTra;
                                    const soLuongTra = chiTiet.soLuongTra;
                                    const soLuongPheDuyet = chiTiet.soLuongPheDuyet || 0;

                                    const { unitOriginal, unitAdjusted, totalRefund } = getItemRefundInfo(
                                        chiTiet,
                                        predictedRatio,
                                    );
                                    const qtyForTotal = isApproved ? soLuongPheDuyet : soLuongTra;
                                    const lineOriginalTotal = unitOriginal * qtyForTotal;
                                    const lineAdjustedTotal = isApproved
                                        ? totalRefund
                                        : (typeof unitAdjusted === 'number' ? unitAdjusted : unitOriginal) * qtyForTotal;

                                    return (
                                        <div
                                            key={idx}
                                            className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Product Image */}
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={resolveReturnImage(chiTiet)}
                                                        alt={sanPham?.tenSanPham || 'Sản phẩm'}
                                                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 bg-gray-100"
                                                        onError={(e) => {
                                                            e.currentTarget.src = 'https://via.placeholder.com/80?text=No+Image';
                                                        }}
                                                    />
                                                </div>

                                                {/* Product Info */}
                                                <div className="flex-grow min-w-0">
                                                    <h3 className="font-semibold text-gray-800 text-lg mb-2">
                                                        {sanPham?.tenSanPham || 'Sản phẩm'}
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                                                        <div className="flex items-center gap-1">
                                                            <Tag className="w-4 h-4" />
                                                            <span>
                                                                <strong>Thương hiệu:</strong>{' '}
                                                                {sanPham?.tenThuongHieu || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Tag className="w-4 h-4" />
                                                            <span>
                                                                <strong>Màu sắc:</strong> {sanPham?.tenMauSac || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Tag className="w-4 h-4" />
                                                            <span>
                                                                <strong>Chất liệu:</strong>{' '}
                                                                {sanPham?.tenChatLieu || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Tag className="w-4 h-4" />
                                                            <span>
                                                                <strong>Trọng lượng:</strong>{' '}
                                                                {sanPham?.tenTrongLuong || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Tag className="w-4 h-4" />
                                                            <span>
                                                                <strong>Điểm cân bằng:</strong>{' '}
                                                                {sanPham?.tenDiemCanBang || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Tag className="w-4 h-4" />
                                                            <span>
                                                                <strong>Độ cứng:</strong> {sanPham?.tenDoCung || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        <div className="bg-blue-50 p-3 rounded-lg">
                                                            <div className="font-medium text-blue-800">Số lượng yêu cầu</div>
                                                            <div className="text-blue-600 font-semibold text-lg">{soLuongTra}</div>
                                                        </div>
                                                        <div className={`p-3 rounded-lg ${soLuongPheDuyet > 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                                                            <div className={`font-medium ${soLuongPheDuyet > 0 ? 'text-green-800' : 'text-yellow-800'}`}>Số lượng duyệt</div>
                                                            <div className={`font-semibold text-lg ${soLuongPheDuyet > 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                                                                {soLuongPheDuyet > 0 ? soLuongPheDuyet : 'Chờ duyệt'}
                                                            </div>
                                                        </div>
                                                        <div className="bg-gray-50 p-3 rounded-lg">
                                                            <div className="font-medium text-gray-800">Tồn kho</div>
                                                            <div className="text-gray-600 font-semibold text-lg">{sanPham?.soLuongTrongKho || 0}</div>
                                                        </div>
                                                    </div>

                                                    {chiTiet.lyDoTraHang && (
                                                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                                                            <div className="font-medium text-red-800 mb-1">
                                                                Lý do trả hàng:
                                                            </div>
                                                            <div className="text-red-700">{chiTiet.lyDoTraHang}</div>
                                                        </div>
                                                    )}

                                                    {chiTiet.ghiChuNhanVien ? (
                                                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                                                            <div className="font-medium text-yellow-800 mb-1">
                                                                Ghi chú nhân viên:
                                                            </div>
                                                            <div className="text-yellow-700">
                                                                {chiTiet.ghiChuNhanVien}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                            <div className="font-medium text-gray-600 mb-1">
                                                                Ghi chú nhân viên:
                                                            </div>

                                                            <div className="text-gray-500 italic">Chưa có ghi chú</div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Price */}
                                                <div className="text-right min-w-[220px]">
                                                    <div className="text-sm text-gray-500 mb-1">Đơn giá</div>
                                                    <div className="text-base font-semibold text-gray-700 mb-1 line-through opacity-70">
                                                        {formatCurrency(unitOriginal)}
                                                    </div>
                                                    <div className="text-sm text-gray-500 mb-1">Giá hoàn (đã trừ voucher)</div>
                                                    <div className="text-lg font-semibold text-red-600 mb-3">
                                                        {formatCurrency(unitAdjusted)}
                                                    </div>
                                                    <div className="text-sm text-gray-500 mb-1">
                                                        Tổng tiền hoàn{!isApproved ? ' (ước tính)' : ''}
                                                    </div>
                                                    <div className="text-xl font-bold text-gray-800">
                                                        {qtyForTotal > 0
                                                            ? (
                                                                  <>
                                                                      <span className="line-through text-gray-400 mr-2 text-base font-medium">
                                                                          {formatCurrency(lineOriginalTotal)}
                                                                      </span>
                                                                      <span className="text-red-600">
                                                                          {formatCurrency(lineAdjustedTotal)}
                                                                      </span>
                                                                  </>
                                                              )
                                                            : 'Chờ duyệt'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Thông tin khách hàng */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Thông tin khách hàng
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">{phieuTraHang.hoTenKhachHang}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">{phieuTraHang.emailKhachHang}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">{phieuTraHang.sdtKhachHang}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                    <span className="text-gray-600">{phieuTraHang.diaChiKhachHang}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tổng kết */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Tổng kết
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Tổng sản phẩm:</span>
                                    <span className="font-semibold text-gray-800">
                                        {phieuTraHang.chiTietTraHang?.length || 0} sản phẩm
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Tổng số lượng{!isApproved ? ' (yêu cầu)' : ''}:</span>
                                    <span className="font-semibold text-gray-800">
                                        {(
                                            phieuTraHang.chiTietTraHang?.reduce((sum, chiTiet) =>
                                                isApproved
                                                    ? sum + (chiTiet.soLuongPheDuyet || 0)
                                                    : sum + (chiTiet.soLuongTra || 0),
                                            0) || 0
                                        )}
                                    </span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold text-gray-800">Tổng tiền hoàn:</span>
                                        <span className="text-xl font-bold text-red-600">
                                            {isApproved
                                                ? (totalAmount > 0 ? formatCurrency(totalAmount) : '0 ₫')
                                                : (totalAmount > 0 ? formatCurrency(totalAmount) : 'Chờ duyệt')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReturnOrderDetail;
