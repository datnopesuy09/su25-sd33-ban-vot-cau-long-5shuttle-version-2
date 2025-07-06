import React from 'react';

function RacketInfo() {
    return (
        <div className="p-4 bg-white rounded-lg mb-[100px]">
            {/* Tiêu đề */}
            <h1 className="text-2xl my-6 text-center font-space tracking-wide">Racket Information</h1>

            <div className="flex items-center justify-between">
                {/* Bên trái: Ngày tháng năm, Tiêu đề, Mô tả, Button */}
                <div className="w-1/2 mr-4">
                    {' '}
                    {/* Đặt width 50% cho phần thông tin */}
                    <div className="text-gray-600 text-sm mb-2">BADMINTON - OCTOBER 1, 2024</div>{' '}
                    {/* Dòng ngày tháng năm */}
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        The Latest in Badminton Racket Technology
                    </h2>{' '}
                    {/* Dòng tiêu đề */}
                    <p className="text-gray-700 mb-4 text-justify">
                        Discover the newest advancements in badminton racket technology that are transforming the game.
                        From lightweight materials to innovative designs, find out how these rackets can enhance your
                        performance.
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

                {/* Bên phải: Ảnh */}
                <div className="w-[45%] h-auto">
                    <img
                        className="object-cover rounded-lg"
                        src="https://www.yonex.com/media/wysiwyg/Home/badminton_racquet_img_2x_NF1000-pro.png"
                        alt="Racket Info"
                        style={{ width: '100%', height: 'auto' }} // Đặt kích thước ảnh lớn hơn
                    />
                </div>
            </div>
        </div>
    );
}

export default RacketInfo;
