import React from 'react';

function RecentNews() {
    return (
        <div className="p-4 bg-gray-100 rounded-lg shadow-md">
            {/* Tiêu đề */}
            <h1 className="text-2xl mt-[90px] text-center font-space tracking-wide">Recent News</h1>

            <div className="flex items-center justify-between">
                {/* Bên trái: Ảnh */}
                <div className="w-[37%] h-auto">
                    <img
                        className="object-cover rounded-lg"
                        src="https://www.yonex.com/media/rotator/tmp/images/news241002_600.png"
                        alt="Recent News"
                    />
                    {/* Hình ảnh */}
                </div>

                {/* Bên phải: Ngày tháng năm, Tiêu đề, Mô tả, Button */}
                <div className="w-1/2 ml-4">
                    {' '}
                    {/* Thay đổi flex-1 thành w-1/2 để chiếm 50% chiều ngang */}
                    <div className="text-gray-600 text-sm mb-2">BADMINTON - OCTOBER 1, 2024</div>{' '}
                    {/* Dòng ngày tháng năm */}
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        World Juniors: France Outplay Three-Time Champs Korea
                    </h2>{' '}
                    {/* Dòng tiêu đề */}
                    <p className="text-gray-700 mb-4 text-justify">
                        France showed their status as rising powers as they overcame three-time Suhandinata Cup
                        champions Korea in the battle for positions 9-16 at the BWF World Junior Mixed Team
                        Championships 2024.
                    </p>{' '}
                    {/* Phần mô tả */}
                    <button
                        type="button"
                        className="text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
                    >
                        Read More
                    </button>
                    {/* Button đọc thêm */}
                </div>
            </div>
        </div>
    );
}

export default RecentNews;
