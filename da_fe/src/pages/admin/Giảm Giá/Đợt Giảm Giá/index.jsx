import React, { useEffect, useState } from 'react';
import { IoAdd } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { TbEyeEdit } from "react-icons/tb";
import axios from "axios";
import swal from 'sweetalert';
import { toast } from "react-toastify";
import ReactPaginate from 'react-paginate';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import ExcelJS from 'exceljs'

function DotGiamGia() {
    const navigate = useNavigate();
    const [listKhuyenMai, setListKhuyenMai] = useState([]);
    const [listKhuyenMaiEx, setListKhuyenMaiEx] = useState([])
    const [pageCount, setPageCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const size = 5;

    const [searchKhuyenMai, setSearchKhuyenMai] = useState({
        tenSearch: "",
        tgBatDauSearch: null,
        tgKetThucSearch: null,
        trangThaiSearch: "",
        sortOrder: ""
    })

    const validateSearchInput = (value) => {
        const specialCharsRegex = /[!@#\$%\^&*\(\),.?":{}|<>[\]]/
        return !specialCharsRegex.test(value);
    }

    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        // Kiểm tra giá trị nhập vào có hợp lệ không
        if (validateSearchInput(inputValue)) {
            setSearchKhuyenMai((prev) => ({
                ...prev,
                tenSearch: inputValue
            }));

            // Gọi hàm tìm kiếm mỗi khi có sự thay đổi
            loadKhuyenMaiSearch({
                ...searchKhuyenMai,
                tenSearch: inputValue
            }, 0); // Gọi lại hàm tìm kiếm với trang đầu tiên
        }
    }, [inputValue]); // Chạy khi inputValue thay đổi

    const loadKhuyenMaiSearch = (searchKhuyenMai, currentPage) => {
        const params = new URLSearchParams({
            tenSearch: searchKhuyenMai.tenSearch || "",
            tgBatDauSearch: searchKhuyenMai.tgBatDauSearch
                ? dayjs(searchKhuyenMai.tgBatDauSearch).format('YYYY-MM-DDTHH:mm:ss')
                : "",
            tgKetThucSearch: searchKhuyenMai.tgKetThucSearch
                ? dayjs(searchKhuyenMai.tgKetThucSearch).format('YYYY-MM-DDTHH:mm:ss')
                : "",
            trangThaiSearch: searchKhuyenMai.trangThaiSearch || "",
            currentPage: currentPage,
            size: size
        });

        console.log("Search Params:", Object.fromEntries(params)); // Để kiểm tra các tham số

        axios.get(`http://localhost:8080/api/dot-giam-gia/search?${params.toString()}`)
            .then((response) => {
                let sortedListKhuyenMai = response.data.content;

                // Sắp xếp phía client dựa trên sortOrder
                if (searchKhuyenMai.sortOrder === "ascending") {
                    sortedListKhuyenMai.sort((a, b) => a.giaTri - b.giaTri); // Giá trị tăng dần
                } else if (searchKhuyenMai.sortOrder === "descending") {
                    sortedListKhuyenMai.sort((a, b) => b.giaTri - a.giaTri); // Giá trị giảm dần
                }

                setListKhuyenMai(sortedListKhuyenMai); // Cập nhật danh sách đã sắp xếp
                setPageCount(response.data.totalPages); // Cập nhật tổng số trang
                setCurrentPage(response.data.currentPage)
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    };


    useEffect(() => {
        loadKhuyenMaiSearch(searchKhuyenMai, 0);
    }, [searchKhuyenMai])

    const handleCreateNew = () => {
        navigate('/admin/giam-gia/dot-giam-gia/add');
    };

    const handleDetail = (id) => {
        navigate(`/admin/giam-gia/dot-giam-gia/${id}/detail`);
    }

    const handelDeleteSale = async (id) => {
        const title = 'Xác nhận xóa phiếu giảm giá?';

        if (listKhuyenMai.trangThai === 2) {
            toast.success('Đợt giảm giá đã kết thúc');
        }

        swal({
            title: title,
            text: 'Bạn chắc chắn muốn xóa phiếu giảm giá này?',
            icon: 'question',
            buttons: {
                cancel: "Hủy",
                confirm: "Xác nhận",
            },
        }).then((willConfirm) => {
            if (willConfirm) {
                // Thực hiện gọi API với axios
                axios.put(`http://localhost:8080/api/dot-giam-gia/delete/${id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                    .then(() => {
                        swal("Thành công!", "Hủy đợt giảm giá thành công", "success")
                        loadKhuyenMaiSearch(searchKhuyenMai, 0) 
                    })
                    .catch((error) => {
                        console.error("Lỗi cập nhật:", error);
                        swal("Thất bại!", "Hủy đợt giảm giá thất bại!", "error");
                    });
            }
        });
    }

    const handlePageClick = (event) => {
        const selectedPage = event.selected;
        loadKhuyenMaiSearch(searchKhuyenMai, selectedPage); // Gọi hàm tìm kiếm với trang mới
        console.log(`User  requested page number ${selectedPage + 1}`);
    };

    const getAllKhuyenMaiExcel = () => {
        axios.get(`http://localhost:8080/api/dot-giam-gia/list-dot-giam-gia`)
        .then((response) => {
            setListKhuyenMaiEx(response.data);
        })
        .catch((error) => {
            console.error("Có lỗi xảy ra:", error);
        });
    };

    useEffect(() => {
        getAllKhuyenMaiExcel();
    }, [])

    const exportToExcel = () => {
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('PromotionData')
    
        const columns = [
          { header: 'STT', key: 'stt', width: 5 },
          { header: 'Tên', key: 'ten', width: 15 },
          { header: 'Giá trị', key: 'giaTri', width: 15 },
          { header: 'Trạng thái', key: 'trangThai', width: 20 },
          { header: 'Thời gian bắt đầu', key: 'tgBatdau', width: 17.5 },
          { header: 'Thời gian kết thúc', key: 'tgKetThuc', width: 17.5 },
        ]
    
        worksheet.columns = columns
    
        listKhuyenMaiEx.forEach((sale, index) => {
          worksheet.addRow({
            stt: index + 1,
            ten: sale.ten,
            giaTri: `${sale.giaTri}%`,
            trangThai:
              sale.trangThai === 2 ? 'Đã kết thúc' : sale.trangThai === 1 ? 'Đang diễn ra' : 'Sắp diễn ra',
            tgBatdau: dayjs(sale.tgBatdau).format('DD/MM/YYYY HH:mm'),
            tgKetThuc: dayjs(sale.tgKetThuc).format('DD/MM/YYYY HH:mm'),
          })
        })
    
        const titleStyle = {
          font: { bold: true, color: { argb: 'FFFFFF' } },
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF008080' },
          },
        }
    
        worksheet.getRow(1).eachCell((cell) => {
          cell.style = titleStyle
        })
    
        worksheet.columns.forEach((column) => {
          const { width } = column
          column.width = width
        })
    
        const blob = workbook.xlsx.writeBuffer().then(
          (buffer) =>
            new Blob([buffer], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
        )
    
        blob.then((blobData) => {
          const url = window.URL.createObjectURL(blobData)
          const link = document.createElement('a')
          link.href = url
          link.download = 'promotion_data.xlsx'
          link.click()
        })
      }

    return (
        <div>
            <div className="font-bold text-sm">
                Đợt giảm giá
            </div>
            <div className="bg-white p-4 rounded-md shadow-lg">
                <div className="flex">
                    {/* search */}
                    <input
                        type="text"
                        placeholder="Tìm phiếu theo tên đợt giảm giá"
                        className="border border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-md px-4 py-2 text-gray-700 w-1/2"
                        onChange={(e) => {
                            const valueNhap = e.target.value;
                            if (validateSearchInput(valueNhap)) {
                                setInputValue(valueNhap);
                            } else {
                                setInputValue('');
                                swal('Lỗi!', 'Không được nhập ký tự đặc biệt', 'warning');
                            }
                        }}
                    />
                    {/* Button Group */}
                    <div className="ml-auto flex space-x-4">
                        {/* Export Button */}
                        <button onClick={exportToExcel} className="border border-amber-400 text-amber-400 px-4 py-2 rounded-md hover:bg-gray-100">
                            Xuất Excel
                        </button>

                        {/* Add New Button */}
                        <button
                            onClick={handleCreateNew}
                            className="border border-amber-400 hover:bg-gray-100 text-amber-400 py-2 px-4 rounded-md flex items-center">
                            <span className="mr-2 text-2xl"><IoAdd /></span>
                            Thêm mới
                        </button>
                    </div>
                </div>
                {/* fillter */}
                <div className="flex space-x-4 pt-4 pb-4">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <div className="flex w-1/2 gap-4">
                            <DateTimePicker
                                format={'DD-MM-YYYY HH:mm'}
                                label="Từ ngày"
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        className: 'w-full'
                                    },
                                    actionBar: {
                                        actions: ['clear', 'today']
                                    }
                                }}
                                value={searchKhuyenMai.tgBatDauSearch}
                                onChange={(newValue) => {
                                    setSearchKhuyenMai({
                                        ...searchKhuyenMai,
                                        tgBatDauSearch: newValue
                                    });
                                    loadKhuyenMaiSearch({
                                        ...searchKhuyenMai,
                                        tgBatDauSearch: newValue
                                    }, 0);
                                }}
                            />
                            <DateTimePicker
                                format={'DD-MM-YYYY HH:mm'}
                                label="Đến ngày"
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        className: 'w-full'
                                    },
                                    actionBar: {
                                        actions: ['clear', 'today']
                                    }
                                }}
                                value={searchKhuyenMai.tgKetThucSearch}
                                onChange={(newValue) => {
                                    setSearchKhuyenMai({
                                        ...searchKhuyenMai,
                                        tgKetThucSearch: newValue
                                    });
                                    loadKhuyenMaiSearch({
                                        ...searchKhuyenMai,
                                        tgKetThucSearch: newValue
                                    }, 0);
                                }}
                            />
                        </div>
                    </LocalizationProvider>

                    <div className="flex items-center space-x-2">
                        <label className="text-gray-700 font-semibold">Trạng thái:</label>
                        <div className="relative">
                            <select
                                value={searchKhuyenMai.trangThaiSearch}
                                onChange={(e) => {
                                    const newTrangThaiSearch = e.target.value;
                                    setSearchKhuyenMai({
                                        ...searchKhuyenMai,
                                        trangThaiSearch: newTrangThaiSearch
                                    });
                                    loadKhuyenMaiSearch({
                                        ...searchKhuyenMai,
                                        trangThaiSearch: newTrangThaiSearch
                                    }, 0); // Gọi lại hàm tìm kiếm với trang đầu tiên
                                }}
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

                    <div className="flex items-center space-x-2">
                        <label className="text-gray-700 font-semibold">Giá trị:</label>
                        <div className="relative">
                            <select
                                value={searchKhuyenMai.sortOrder}
                                onChange={(e) => {
                                    const newSortOrder = e.target.value;
                                    setSearchKhuyenMai({
                                        ...searchKhuyenMai,
                                        sortOrder: newSortOrder
                                    });
                                    loadKhuyenMaiSearch({
                                        ...searchKhuyenMai,
                                        sortOrder: newSortOrder
                                    }, 0); // Gọi lại hàm tìm kiếm với trang đầu tiên
                                }}
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
                                    Giá trị
                                </option>
                                <option
                                    value="ascending"
                                    className="bg-white text-gray-700"
                                >
                                    Tăng dần
                                </option>
                                <option
                                    value="descending"
                                    className="bg-white text-gray-700"
                                >
                                    Giảm dần
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
                </div>
            </div>
            <div className="bg-white p-4 rounded-md shadow-lg mt-4">
                {/* table */}
                <table className="min-w-full table-auto border-collapse border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700">
                            <th className="py-2 px-4 text-left border-b">STT</th>
                            <th className="py-2 px-4 text-left border-b">Tên đợt giảm giá</th>
                            <th className="py-2 px-4 text-left border-b">Giá trị</th>
                            <th className="py-2 px-4 text-left border-b">Trạng thái</th>
                            <th className="py-2 px-4 text-left border-b">Ngày bắt đầu</th>
                            <th className="py-2 px-4 text-left border-b">Ngày kết thúc</th>
                            <th className="py-2 px-4 text-left border-b">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            listKhuyenMai && listKhuyenMai.length > 0 && listKhuyenMai.map((sale, index) => {
                                const stt = (currentPage * 5) + index + 1;
                                return (
                                    <tr key={sale.id} className="hover:bg-gray-100">
                                        <td className="py-2 px-4 border-b">{stt}</td>
                                        <td className="py-2 px-4 border-b">{sale.ten}</td>
                                        <td className="py-2 px-4 border-b">{sale.giaTri}%</td>
                                        <td className="py-2 px-4 border-b">
                                            <span
                                                className={`py-1 px-3 rounded-full text-xs whitespace-nowrap ${sale.trangThai === 2
                                                    ? 'bg-red-200 text-red-700 border border-red-800'
                                                    : sale.trangThai === 1
                                                        ? 'bg-green-200 text-green-700 border border-green-800'
                                                        : 'bg-gray-200 text-gray-700 border border-gray-800'
                                                    }`}
                                                onClick={
                                                    sale.trangThai === 2
                                                        ? undefined
                                                        : () => handelDeleteSale(sale.id)
                                                }
                                                style={{
                                                    cursor: sale.trangThai === 2 ? 'not-allowed' : 'pointer',
                                                }}
                                            >
                                                {sale.trangThai === 2
                                                    ? "Đã kết thúc"
                                                    : sale.trangThai === 1
                                                        ? "Đang diễn ra"
                                                        : "Sắp diễn ra"}
                                            </span>
                                        </td>
                                        <td className="py-2 px-4 border-b">{dayjs(sale.tgBatDau).format('DD/MM/YYYY HH:mm')}</td>
                                        <td className="py-2 px-4 border-b">{dayjs(sale.tgKetThuc).format('DD/MM/YYYY HH:mm')}</td>
                                        <td className="py-2 px-4 border-b">
                                            <button
                                                onClick={() => handleDetail(sale.id)}
                                                className="text-2xl text-amber-400">
                                                <TbEyeEdit />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                        {listKhuyenMai && listKhuyenMai.length === 0 && (
                            <tr>
                                <td colSpan="7" className="py-4 text-center">
                                    Not found data
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {/* Pagination */}
                <div className="flex justify-end mt-4">
                    <ReactPaginate
                        previousLabel={"<"}
                        nextLabel={">"}
                        onPageChange={handlePageClick}
                        pageRangeDisplayed={3}
                        marginPagesDisplayed={2}
                        pageCount={pageCount}
                        breakLabel="..."
                        containerClassName="pagination flex justify-center items-center space-x-2 mt-6 text-xs"
                        pageClassName="page-item"
                        pageLinkClassName="page-link px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-indigo-500 hover:text-white transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50"
                        previousClassName="page-item"
                        previousLinkClassName="page-link px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-indigo-500 hover:text-white transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50"
                        nextClassName="page-item"
                        nextLinkClassName="page-link px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-indigo-500 hover:text-white transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50"
                        breakClassName="page-item"
                        breakLinkClassName="page-link px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-indigo-500 hover:text-white transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50"
                        activeClassName="active bg-indigo-600 text-white border-indigo-600"
                        disabledClassName="disabled bg-gray-100 text-gray-400 cursor-not-allowed"
                    />
                </div>
            </div>
        </div>
    );
};

export default DotGiamGia