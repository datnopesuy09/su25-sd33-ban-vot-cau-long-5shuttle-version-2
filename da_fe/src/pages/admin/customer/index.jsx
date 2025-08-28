import { useEffect, useState } from 'react';
import axios from 'axios';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';

function CustomerList() {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [gender, setGender] = useState('');
    const [status, setStatus] = useState('');
    const [customerType, setCustomerType] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 5;
    const navigate = useNavigate();

    // Fetch customers from API
    const fetchCustomers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/khach-hang');
            if (response.data.code === 1000) {
                setCustomers(response.data.result);
                setFilteredCustomers(response.data.result);
                setTotalPages(Math.ceil(response.data.result.length / itemsPerPage));
            } else {
                swal('Lỗi', 'Không thể tải danh sách khách hàng.', 'error');
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            swal('Lỗi', 'Đã có lỗi xảy ra khi tải dữ liệu.', 'error');
        }
    };

    // Handle status change (mock implementation, replace with actual API call)
    const handleChangeStatus = (id, currentStatus) => {
        swal({
            title: 'Xác nhận',
            text: `Bạn có chắc muốn ${currentStatus === 1 ? 'hủy kích hoạt' : 'kích hoạt'} khách hàng này?`,
            icon: 'warning',
            buttons: ['Hủy', 'Xác nhận'],
            dangerMode: true,
        }).then((willChange) => {
            if (willChange) {
                // Mock status update (replace with actual API call)
                setCustomers((prev) =>
                    prev.map((c) => (c.id === id ? { ...c, trangThai: currentStatus === 1 ? 0 : 1 } : c)),
                );
                swal('Thành công!', 'Trạng thái đã được cập nhật.', 'success');
            }
        });
    };

    // Filter customers based on search and dropdown inputs
    useEffect(() => {
        let filtered = [...customers];

        // Apply name filter
        if (searchName) {
            filtered = filtered.filter((c) => c.hoTen?.toLowerCase().includes(searchName.toLowerCase()));
        }

        // Apply email filter
        if (searchEmail) {
            filtered = filtered.filter((c) => c.email?.toLowerCase().includes(searchEmail.toLowerCase()));
        }

        // Apply phone filter
        if (searchPhone) {
            filtered = filtered.filter((c) => c.sdt?.includes(searchPhone));
        }

        // Apply gender filter
        if (gender !== '') {
            filtered = filtered.filter((c) => c.gioiTinh === parseInt(gender));
        }

        // Apply status filter
        if (status !== '') {
            filtered = filtered.filter((c) => c.trangThai === parseInt(status));
        }

        // Apply customer type filter
        if (customerType) {
            filtered = filtered.filter((c) => c.userType === customerType);
        }

        setFilteredCustomers(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        setPage(0); // Reset to first page when filters change
    }, [searchName, searchEmail, searchPhone, gender, status, customerType, customers]);

    // Get paginated customers
    const paginatedCustomers = filteredCustomers.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

    useEffect(() => {
        fetchCustomers();
    }, []);

    return (
        <div className="p-6">
            <h1 className="mb-4">Khách hàng</h1>

            {/* Bộ lọc tìm kiếm */}
            <div className="bg-white p-4 rounded shadow mb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <input
                        type="text"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        placeholder="Tìm theo họ tên..."
                        className="border p-2 rounded w-full"
                    />
                    <input
                        type="text"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        placeholder="Tìm theo email..."
                        className="border p-2 rounded w-full"
                    />
                    <input
                        type="text"
                        value={searchPhone}
                        onChange={(e) => setSearchPhone(e.target.value)}
                        placeholder="Tìm theo số điện thoại..."
                        className="border p-2 rounded w-full"
                    />
                    <button
                        onClick={() => navigate('/admin/tai-khoan/khach-hang/add')}
                        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                    >
                        + Tạo khách hàng
                    </button>
                </div>

                <div className="flex gap-4 mb-2">
                    <div>
                        <label className="mr-2">Giới tính:</label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="border p-2 rounded"
                        >
                            <option value="">Tất cả</option>
                            <option value="0">Nam</option>
                            <option value="1">Nữ</option>
                        </select>
                    </div>

                    <div>
                        <label className="mr-2">Trạng thái:</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="border p-2 rounded"
                        >
                            <option value="">Tất cả</option>
                            <option value="1">Hoạt động</option>
                            <option value="0">Không hoạt động</option>
                        </select>
                    </div>

                    <div>
                        <label className="mr-2">Loại KH:</label>
                        <select
                            value={customerType}
                            onChange={(e) => setCustomerType(e.target.value)}
                            className="border p-2 rounded"
                        >
                            <option value="">Tất cả</option>
                            <option value="CA_NHAN">Cá nhân</option>
                            <option value="DOANH_NGHIEP">Doanh nghiệp</option>
                            <option value="VIP">VIP</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-auto rounded shadow">
                <table className="min-w-full bg-white text-sm text-left">
                    <thead className="bg-gray-100 font-semibold text-gray-700">
                        <tr>
                            <th className="px-3 py-2">STT</th>
                            <th className="px-3 py-2">Họ tên</th>
                            <th className="px-3 py-2">Email</th>
                            <th className="px-3 py-2">SĐT</th>
                            <th className="px-3 py-2">Ngày sinh</th>
                            <th className="px-3 py-2">Giới tính</th>
                            <th className="px-3 py-2">Loại KH</th>
                            <th className="px-3 py-2">Trạng thái</th>
                            <th className="px-3 py-2 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCustomers.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="text-center py-4 text-gray-500">
                                    Không có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            paginatedCustomers.map((c, idx) => (
                                <tr key={c.id} className="border-t hover:bg-gray-50">
                                    <td className="px-3 py-2">{idx + 1 + page * itemsPerPage}</td>
                                    <td className="px-3 py-2">{c.hoTen || '—'}</td>
                                    <td className="px-3 py-2">{c.email || '—'}</td>
                                    <td className="px-3 py-2">{c.sdt || '—'}</td>
                                    <td className="px-3 py-2">{c.ngaySinh || '—'}</td>
                                    <td className="px-3 py-2">
                                        {c.gioiTinh === 0 ? 'Nam' : c.gioiTinh === 1 ? 'Nữ' : '—'}
                                    </td>
                                    <td className="px-3 py-2">
                                        {c.userType === 'CA_NHAN'
                                            ? 'Cá nhân'
                                            : c.userType === 'DOANH_NGHIEP'
                                              ? 'Doanh nghiệp'
                                              : c.userType === 'VIP'
                                                ? 'VIP'
                                                : '—'}
                                    </td>
                                    <td className="px-3 py-2">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${
                                                c.trangThai === 1
                                                    ? 'bg-green-200 text-green-700'
                                                    : c.trangThai === 0
                                                      ? 'bg-red-200 text-red-700'
                                                      : 'bg-gray-200 text-gray-700'
                                            }`}
                                        >
                                            {c.trangThai === 1
                                                ? 'Hoạt động'
                                                : c.trangThai === 0
                                                  ? 'Không hoạt động'
                                                  : '—'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 flex justify-center gap-2">
                                        <button
                                            onClick={() => navigate(`/admin/tai-khoan/khach-hang/edit/${c.id}`)}
                                            className="text-blue-600 hover:bg-gray-100 rounded p-1"
                                        >
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleChangeStatus(c.id, c.trangThai)}
                                            className="text-red-600 hover:bg-gray-100 rounded p-1"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-4 gap-2">
                <button
                    onClick={() => setPage((p) => Math.max(p - 1, 0))}
                    disabled={page === 0}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    &lt;
                </button>
                <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    &gt;
                </button>
            </div>
        </div>
    );
}

export default CustomerList;
