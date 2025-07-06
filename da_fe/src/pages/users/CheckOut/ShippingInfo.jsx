// ShippingInfo.js
import React from 'react';

const ShippingInfo = ({ formData, handleInputChange, errors, provinces, districts, wards }) => {
    return (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-[#2f19ae] rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">1</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Thông tin giao hàng</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Các trường nhập liệu */}
                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên *</label>
                    <input
                        type="text"
                        name="addressName"
                        value={formData.addressName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2f19ae] focus:ring-4 focus:ring-[#2f19ae]/20 transition-all duration-300 outline-none"
                        placeholder="Nhập họ và tên"
                    />
                    {errors.addressName && <p className="text-red-500 text-sm mt-1 flex items-center">⚠️ Họ và tên là bắt buộc</p>}
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ chi tiết *</label>
                    <input
                        type="text"
                        name="addressDetail"
                        value={formData.addressDetail}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2f19ae] focus:ring-4 focus:ring-[#2f19ae]/20 transition-all duration-300 outline-none"
                        placeholder="Số nhà, tên đường..."
                    />
                    {errors.addressDetail && <p className="text-red-500 text-sm mt-1 flex items-center">⚠️ Địa chỉ là bắt buộc</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tỉnh/Thành phố *</label>
                    <select
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2f19ae] focus:ring-4 focus:ring-[#2f19ae]/20 transition-all duration-300 outline-none"
                    >
                        <option value="">Chọn tỉnh/thành phố</option>
                        {provinces.map((province) => (
                            <option key={province.code} value={province.code}>{province.name}</option>
                        ))}
                    </select>
                    {errors.province && <p className="text-red-500 text-sm mt-1 flex items-center">⚠️ Tỉnh/thành phố là bắt buộc</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quận/Huyện *</label>
                    <select
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2f19ae] focus:ring-4 focus:ring-[#2f19ae]/20 transition-all duration-300 outline-none"
                    >
                        <option value="">Chọn quận/huyện</option>
                        {districts.map((district) => (
                            <option key={district.code} value={district.code}>{district.name}</option>
                        ))}
                    </select>
                    {errors.district && <p className="text-red-500 text-sm mt-1 flex items-center">⚠️ Quận/huyện là bắt buộc</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Xã/Phường *</label>
                    <select
                        name="ward"
                        value={formData.ward}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2f19ae] focus:ring-4 focus:ring-[#2f19ae]/20 transition-all duration-300 outline-none"
                    >
                        <option value="">Chọn xã/phường</option>
                        {wards.map((ward) => (
                            <option key={ward.code} value={ward.code}>{ward.name}</option>
                        ))}
                    </select>
                    {errors.ward && <p className="text-red-500 text-sm mt-1 flex items-center">⚠️ Xã/phường là bắt buộc</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại *</label>
                    <input
                        type="text"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2f19ae] focus:ring-4 focus:ring-[#2f19ae]/20 transition-all duration-300 outline-none"
                        placeholder="Nhập số điện thoại"
                    />
                    {errors.mobile && <p className="text-red-500 text-sm mt-1 flex items-center">⚠️ Số điện thoại là bắt buộc</p>}
                </div>
            </div>
        </div>
    );
};

export default ShippingInfo;
