import React from 'react';

function HomeSectionCard({ product }) {
    return (
        <div className="cursor-pointer flex flex-col items-center bg-white rounded-lg shadow-xl overflow-hidden w-[15rem] mx-3 border border-gray-100">
            <div className="h-[13rem] w-[10rem]">
                <img className="object-cover object-top h-full w-full" src={product.image} alt="" />
            </div>

            <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
            </div>
        </div>
    );
}

export default HomeSectionCard;
