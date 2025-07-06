import React from "react";
import { useState, useEffect } from "react";
import { IoAdd } from "react-icons/io5";
import { TbEyeEdit } from "react-icons/tb";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import swal from 'sweetalert';
// import ReactPaginate from "react-paginate";
import numeral from 'numeral';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import ExcelJS from 'exceljs'


function PhieuGiamGia() {
   const navigate = useNavigate();
   const [listVoucher, setListVoucher] = useState([]);

   function getAllVoucher() {
    axios.get(`http://localhost:8080/api/phieu-giam-gia/hien-thi`)
      .then((response) => {
        setListVoucher(response.data);
      })
      .catch((error) => {
        console.error("Có lỗi xảy ra:", error);
      });
  }

    useEffect(() => {
        getAllVoucher();
    }, [])

    const formatCurrency = (money) => {
        return numeral(money).format('0,0') + ' ₫'
    }

  const handleCreateNew = () => {
    navigate('/admin/giam-gia/phieu-giam-gia/add');
  };

  const handleDetail = (id) => {
    navigate(`/admin/giam-gia/phieu-giam-gia/${id}/detail`);
  }

  const handelDeleteVoucher = (id) => {
    const title = 'Xác nhận xóa phiếu giảm giá?';
    const text = 'Bạn chắc chắn muốn xóa phiếu giảm giá này?';

    // Hiển thị SweetAlert để xác nhận
    swal({
      title: title,
      text: text,
      icon: 'warning',
      buttons: {
        cancel: "Hủy",
        confirm: "Xác nhận",
      },
    }).then((willConfirm) => {
      if (willConfirm) {
        // Thực hiện gọi API với axios
        axios.delete(`http://localhost:8080/api/phieu-giam-gia/delete/${id}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
            .then(() => {
              swal('Thành công!', 'Hủy phiếu giảm giá thành công', 'success');
              // loadVoucherSearch(searchVoucher, currentPage); // Gọi lại hàm loadVoucher để làm mới danh sách
                getAllVoucher(); // Gọi lại hàm để làm mới danh sách
            })
            .catch((error) => {
              console.error("Lỗi cập nhật:", error);
              swal('Thất bại!', 'Hủy phiếu giảm giá thất bại', 'error');
            });
      }
    });
  }

  return (
    <div>
      <div className="font-bold text-sm">
        Phiếu giảm giá
      </div>

      <div className="bg-white p-4 rounded-md shadow-lg">
        <div className="flex">
          {/* search */}
          <input
              type="text"
              placeholder="Tìm phiếu giảm giá theo mã hoặc tên"
              className="border border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-md px-4 py-2 text-gray-700 w-1/2"
              // onChange={(e) => {
              //   const valueNhap = e.target.value;
              //   if (validateSearchInput(valueNhap)) {
              //     setInputValue(valueNhap);
              //   } else {
              //     setInputValue('');
              //     swal('Lỗi!', 'Không được nhập ký tự đặc biệt', 'warning');
              //   }
              // }}
          />
          {/* button */}
          <button
              onClick={handleCreateNew}
              className="border border-amber-400 hover:bg-gray-100 text-amber-400 py-2 px-4 rounded-md ml-auto flex items-center">
            <span className="mr-2 text-2xl"><IoAdd/></span>
            Tạo mới
          </button>
        </div>
        {/* fillter */}
        <div className="flex space-x-4 pt-4 pb-4">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="flex w-1/2 gap-4"> {/* Đặt w-1/2 để bằng input tìm kiếm */}
              <DateTimePicker
                  format={'DD-MM-YYYY HH:mm'}
                  label="Từ ngày"
                  slotProps={{
                    textField: {
                      size: 'small',
                      className: 'w-full' // kéo full width theo cha
                    },
                    actionBar: {
                      actions: ['clear', 'today']
                    }
                  }}
                  // value={searchVoucher.ngayBatDauSearch}
                  // onChange={(newValue) => {
                  //   setSearchVoucher({
                  //     ...searchVoucher,
                  //     ngayBatDauSearch: newValue
                  //   });
                  //   loadVoucherSearch({
                  //     ...searchVoucher,
                  //     ngayBatDauSearch: newValue
                  //   }, 0);
                  // }}
              />
              <DateTimePicker
                  format={'DD-MM-YYYY HH:mm'}
                  label="Đến ngày"
                  slotProps={{
                    textField: {
                      size: 'small',
                      className: 'w-full' // kéo full width theo cha
                    },
                    actionBar: {
                      actions: ['clear', 'today']
                    }
                  }}
                  // value={searchVoucher.ngayKetThucSearch}
                  // onChange={(newValue) => {
                  //   setSearchVoucher({
                  //     ...searchVoucher,
                  //     ngayKetThucSearch: newValue
                  //   });
                  //   loadVoucherSearch({
                  //     ...searchVoucher,
                  //     ngayKetThucSearch: newValue
                  //   }, 0);
                  // }}
              />
            </div>
          </LocalizationProvider>

        <div className="flex items-center space-x-2">
          <label className="text-gray-700 font-semibold">Loại:</label>
          <div className="relative">
            <select
                // value={searchVoucher.kieuGiaTriSearch}
                // onChange={(e) => {
                //   const newKieuGiaTriSearch = e.target.value;
                //   setSearchVoucher({
                //     ...searchVoucher,
                //     kieuGiaTriSearch: newKieuGiaTriSearch
                //   });
                //   loadVoucherSearch({
                //     ...searchVoucher,
                //     kieuGiaTriSearch: newKieuGiaTriSearch
                //   }, 0);
                // }}
                className="
                                    appearance-none 
                                    bg-transparent 
                                    text-amber-400
                                    py-2 
                                    px-3
                                    focus:border-blue-500 
                                    focus:outline-none 
                                    cursor-pointer
                                    "
            >
              <option
                  value=""
                  className="bg-white text-gray-700"
              >
                Loại
              </option>
              <option
                  value={0}
                  className="bg-white text-gray-700"
              >
                Phần trăm
              </option>
              <option
                  value={1}
                  className="bg-white text-gray-700"
              >
                Giá tiền
              </option>
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
              >
                <path
                    d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-gray-700 font-semibold">Trạng thái:</label>
          <div className="relative">
            <select
                // value={searchVoucher.trangThaiSearch}
                // onChange={(e) => {
                //   const newTrangThaiSearch = e.target.value;
                //   setSearchVoucher({
                //     ...searchVoucher,
                //     trangThaiSearch: newTrangThaiSearch
                //   });
                //   loadVoucherSearch({
                //     ...searchVoucher,
                //     trangThaiSearch: newTrangThaiSearch
                //   }, 0);
                // }}
                className="
                                    appearance-none 
                                    bg-transparent 
                                    text-amber-400
                                    py-2 
                                    px-3
                                    focus:border-blue-500 
                                    focus:outline-none 
                                    cursor-pointer
                                    "
            >
              <option
                  value=""
                  className="bg-white text-gray-700"
              >
                Trạng thái
              </option>
              <option
                  value={0}
                  className="bg-white text-gray-700"
              >
                Sắp diễn ra
              </option>
              <option
                  value={1}
                  className="bg-white text-gray-700"
              >
                Đang diễn ra
              </option>
              <option
                  value={2}
                  className="bg-white text-gray-700"
              >
                Đã kết thúc
              </option>
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
              >
                <path
                    d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <button className="border border-amber-400 text-amber-400 px-4 py-2 rounded-md hover:bg-gray-100">
          Xuất Excel
        </button>
      </div>

      {/* table */}
        <table
            className="min-w-full table-auto border-collapse border border-gray-300 shadow-sm rounded-md overflow-hidden text-sm">
          <thead>
          <tr className="bg-gray-100 text-gray-700 font-medium">
            <th className="py-3 px-4 border border-gray-300">STT</th>
            <th className="py-3 px-4 border border-gray-300">Mã</th>
            <th className="py-3 px-4 border border-gray-300">Tên</th>
            <th className="py-3 px-4 border border-gray-300">Loại</th>
            <th className="py-3 px-4 border border-gray-300">Số lượng</th>
            <th className="py-3 px-4 border border-gray-300">Ngày bắt đầu</th>
            <th className="py-3 px-4 border border-gray-300">Ngày kết thúc</th>
            <th className="py-3 px-4 border border-gray-300">Trạng thái</th>
            <th className="py-3 px-4 border border-gray-300">Hành động</th>
          </tr>
          </thead>
          <tbody>
          {listVoucher && listVoucher.length > 0 ? (
              listVoucher.map((item, index) => {
                // const stt = (currentPage * 5) + index + 1;
                return (
                    <tr key={index} className="even:bg-gray-50 hover:bg-gray-100 transition-colors">
                      <td className="py-2 px-4 border border-gray-200">{index + 1}</td>
                      <td className="py-2 px-4 border border-gray-200">{item.ma}</td>
                      <td className="py-2 px-4 border border-gray-200">{item.ten}</td>
                      <td className="py-2 px-4 border border-gray-200">
                        {item.kieuGiaTri === 0 ? item.giaTri + "%" : formatCurrency(item.giaTri)}
                      </td>
                      <td className="py-2 px-4 border border-gray-200">{item.soLuong}</td>
                      <td className="py-2 px-4 border border-gray-200">{dayjs(item.ngayBatDau).format('DD/MM/YYYY HH:mm')}</td>
                      <td className="py-2 px-4 border border-gray-200">{dayjs(item.ngayKetThuc).format('DD/MM/YYYY HH:mm')}</td>
                      <td className="py-2 px-4 border border-gray-200">
              <span
                  className={`py-1 px-3 rounded-full text-xs font-medium whitespace-nowrap inline-block 
                  ${item.trangThai === 2
                      ? 'bg-red-100 text-red-700 border border-red-400'
                      : item.trangThai === 1
                          ? 'bg-green-100 text-green-700 border border-green-400'
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-400'
                  }`}
                  style={{cursor: item.trangThai === 2 ? 'not-allowed' : 'pointer'}}
                  onClick={
                    item.trangThai === 2
                      ? undefined
                      : () => handelDeleteVoucher(item.id)
                  }
              >
                {item.trangThai === 2
                    ? "Đã kết thúc"
                    : item.trangThai === 1
                        ? "Đang diễn ra"
                        : "Sắp diễn ra"}
              </span>
                      </td>
                      <td className="py-2 px-4 border border-gray-200">
                        <button
                            onClick={() => handleDetail(item.id)}
                            className="text-amber-500 hover:text-amber-600 transition-colors text-2xl"
                        >
                          <TbEyeEdit/>
                        </button>
                      </td>
                    </tr>
                )
              })
          ) : (
              <tr>
                <td colSpan="9" className="py-4 text-center text-gray-500 italic">
                  Không tìm thấy dữ liệu
                </td>
              </tr>
          )}
          </tbody>
        </table>

      </div>
    </div>
  );
};


export default PhieuGiamGia
