import React from 'react';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import HomeSectionCard from '../HomeSectionCard/HomeSectionCard';

function HomeSectionCarosel() {
    const product = [
        {
            image: 'https://cdn.shopvnb.com/uploads/gallery/vot-cau-long-yonex-astrox-bkex-noi-dia-trung_1719176463.webp',
            name: 'Yonex',
        },
        {
            image: 'https://cdn.shopvnb.com/uploads/gallery/vot-cau-long-lining-tectonic-9-noi-dia-trung_1727380094.jpg',
            name: 'Lining',
        },
        {
            image: 'https://cdn.shopvnb.com/uploads/gallery/vot-cau-long-victor-auraspeed-100x-tuc-ac-limited_1712605721.webp',
            name: 'Victor',
        },
        {
            image: 'https://cdn.shopvnb.com/uploads/gallery/vot-cau-long-mizuno-11-quick-den-ma-jp_1724892620.webp',
            name: 'Mizuno',
        },
    ];

    const responsive = {
        0: { items: 1 },
        720: { items: 3 },
        1024: { items: 5.5 },
    };

    const items = product.map((item, index) => <HomeSectionCard key={index} product={item} />);

    return (
        <div className="relative px-4 lg:px-8">
            <h2 className="text-2xl mt-[100px] mb-[60px] text-center font-space tracking-wide">
                OUTSTANDING RACKET BRAND
            </h2>
            <div className="relative">
                <AliceCarousel
                    items={items}
                    disableButtonsControls
                    responsive={responsive}
                    infinite
                    autoPlay // Kích hoạt autoplay
                    autoPlayInterval={2000} // Thời gian giữa các lần chuyển đổi
                    animationDuration={1000} // Tốc độ chuyển đổi
                    autoPlayStrategy="none"
                    playButtonEnabled={true} // Bổ sung nút để chắc chắn autoplay được bật
                    autoPlayDirection="ltr" // Hướng chạy từ trái sang phải
                />
            </div>
        </div>
    );
}

export default HomeSectionCarosel;
