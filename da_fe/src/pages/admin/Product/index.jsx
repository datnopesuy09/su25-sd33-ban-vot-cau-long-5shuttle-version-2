import React, { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import { Link } from 'react-router-dom';
import { TbEyeEdit } from 'react-icons/tb';

function Product() {
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageList, setImageList] = useState([]);

    const handleAddImage = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map((file) => URL.createObjectURL(file));
        setImageList((prev) => [...prev, ...newImages]);
    };

    const handleSaveImages = () => {
        setShowImageModal(false);
    };

    return (
        <div>
            <div className="font-bold text-sm">Sản phẩm</div>
            <div className="bg-white p-4 rounded-md shadow-md">
                <div className="flex mb-4 justify-between items-center">
                    <input
                        type="text"
                        placeholder="Nhập tên sản phẩm để tìm..."
                        className="border border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-md px-4 py-2 text-gray-700 w-1/2"
                    />
                    <Link to={'/admin/quan-ly-san-pham/san-pham-ct/add'}>
                        <button className="border border-blue-500 text-blue-500 font-medium py-2 px-4 rounded flex items-center">
                            <AddIcon /> Thêm mới
                        </button>
                    </Link>
                </div>
                <div className="flex items-center mr-4 mb-6">
                    <label className="mr-2 font-semibold">Trạng thái:</label>
                    <label className="mr-2">
                        <input type="radio" name="status" value="all" className="mr-1" />
                        Tất cả
                    </label>
                    <label className="mr-2">
                        <input type="radio" name="status" className="mr-1" />
                        Active
                    </label>
                    <label className="mr-2">
                        <input type="radio" name="status" className="mr-1" />
                        Inactive
                    </label>
                    <button className="ml-6 border border-blue-500 text-blue-500 font-medium py-2 px-4 rounded">
                        Xuất Excel
                    </button>
                </div>

                <table className="min-w-full table-auto border-collapse border border-gray-200">
                    <thead>
                        <tr className="bg-gray-200 text-gray-700">
                            <th className="py-4 px-6 text-left">STT</th>
                            <th className="py-4 px-6 text-left">Tên</th>
                            <th className="py-4 px-6 text-left">Số lượng</th>
                            <th className="py-4 px-6 text-left">Trạng thái</th>
                            <th className="py-4 px-6 text-left">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {showImageModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-[600px]">
                        <h3 className="text-lg font-bold mb-4">Chọn ảnh</h3>
                        <input type="file" multiple accept="image/jpeg,image/png,image/gif" onChange={handleAddImage} />
                        <div className="mt-4 grid grid-cols-4 gap-2">
                            {imageList.map((image, index) => (
                                <div key={index} className="relative">
                                    <img src={image} alt="preview" className="w-full h-24 object-cover rounded" />
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowImageModal(false);
                                    setImageList([]);
                                }}
                                className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded-lg"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={handleSaveImages}
                                type="button"
                                className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
                            >
                                Lưu ảnh
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Product;
