import { useEffect, useState } from 'react';
import axios from 'axios';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [gender, setGender] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, [page, searchName, searchEmail, searchPhone, gender, status]);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/customers/search', {
        params: {
          hoTen: searchName,
          email: searchEmail,
          sdt: searchPhone,
          gioiTinh: gender,
          trangThai: status,
          page,
          size: 5,
        },
      });
      setCustomers(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu:', err);
    }
  };

  const handleChangeStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const confirm = await swal({
      title: 'Xác nhận',
      text: `Bạn có chắc muốn ${newStatus === 0 ? 'ngừng hoạt động' : 'kích hoạt lại'} khách hàng này?`,
      icon: 'warning',
      buttons: ['Hủy', 'Xác nhận'],
      dangerMode: true,
    });
    if (confirm) {
      try {
        await axios.put(`http://localhost:8080/api/customers/delete/${id}`, {
          trangThai: newStatus,
        });
        fetchCustomers();
        swal('Thành công', 'Cập nhật trạng thái thành công.', 'success');
      } catch {
        swal('Lỗi', 'Không thể cập nhật trạng thái.', 'error');
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-4">Khách hàng</h1>

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
        </div>
      </div>

      <div className="overflow-auto rounded shadow">
        <table className="min-w-full bg-white text-sm text-left">
          <thead className="bg-gray-100 font-semibold text-gray-700">
            <tr>
              <th className="px-3 py-2">STT</th>
              {/* <th className="px-3 py-2">Ảnh</th> */}
              <th className="px-3 py-2">Họ tên</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">SĐT</th>
              <th className="px-3 py-2">Ngày sinh</th>
              <th className="px-3 py-2">Giới tính</th>
              <th className="px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-4 text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              customers.map((c, idx) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">{idx + 1 + page * 5}</td>
                  {/* <td className="px-3 py-2">
                    <img src={c.anh || '/default-avatar.png'} alt="avatar" className="w-8 h-8 rounded-full" />
                  </td> */}
                  <td className="px-3 py-2">{c.hoTen}</td>
                  <td className="px-3 py-2">{c.email}</td>
                  <td className="px-3 py-2">{c.sdt}</td>
                  <td className="px-3 py-2">{c.ngaySinh || '—'}</td>
                  <td className="px-3 py-2">{c.gioiTinh === 0 ? 'Nam' : 'Nữ'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${c.trangThai === 1
                        ? 'bg-green-200 text-green-700'
                        : 'bg-red-200 text-red-700'
                        }`}
                    >
                      {c.trangThai === 1 ? 'Hoạt động' : 'Không hoạt động'}
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
          className="px-3 py-1 border rounded"
        >
          &lt;
        </button>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
          disabled={page >= totalPages - 1}
          className="px-3 py-1 border rounded"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

export default CustomerList;
