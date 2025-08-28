'use client';
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import axios from 'axios';
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
} from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, FunnelIcon, MinusIcon, PlusIcon, Squares2X2Icon } from '@heroicons/react/20/solid';
import { SparklesIcon } from 'lucide-react';

const sortOptions = [
    { name: 'Phổ biến nhất', href: '#', current: true },
    { name: 'Mới nhất', href: '#', current: false },
    { name: 'Giá từ cao đến thấp', href: '#', current: false },
    { name: 'Giá từ thấp lên cao', href: '#', current: false },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function Product() {
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [brands, setBrands] = useState([]);
    const [balances, setBalances] = useState([]);
    const [colors, setColors] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [stiffs, setStiffs] = useState([]);
    const [weights, setWeights] = useState([]);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilters, setSelectedFilters] = useState({
        thuonghieu: [],
        mausac: [],
        trongluong: [],
        chatlieu: [],
        diemcanbang: [],
        docung: [],
    });
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('popular');
    const [searchQuery, setSearchQuery] = useState('');

    const loadBrands = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/thuong-hieu');
            setBrands(response.data);
        } catch (error) {
            console.error('Failed to fetch brands', error);
        }
    };

    const loadColors = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/mau-sac');
            setColors(response.data);
        } catch (error) {
            console.error('Failed to fetch colors', error);
        }
    };

    const loadStiffs = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/do-cung');
            setStiffs(response.data);
        } catch (error) {
            console.error('Failed to fetch stiffs', error);
        }
    };

    const loadWeights = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/trong-luong');
            setWeights(response.data);
        } catch (error) {
            console.error('Failed to fetch weights', error);
        }
    };

    const loadMaterials = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/chat-lieu');
            setMaterials(response.data);
        } catch (error) {
            console.error('Failed to fetch materials', error);
        }
    };

    const loadBalances = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/diem-can-bang');
            setBalances(response.data);
        } catch (error) {
            console.error('Failed to fetch balances', error);
        }
    };

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/san-pham-ct/summaryy');
            const products = response.data;

            console.log('products: ', products);

            setProducts(products);
            setFilteredProducts(products); // Initialize filtered products
        } catch (error) {
            console.error('Failed to fetch Products', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    loadBalances(),
                    loadBrands(),
                    loadColors(),
                    loadMaterials(),
                    loadStiffs(),
                    loadWeights(),
                    loadProducts(),
                ]);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        fetchData();
    }, []);

    console.log('orrrrrr: ', products);

    // Filter handling functions
    const handleFilterChange = (filterId, value, isChecked) => {
        setSelectedFilters((prev) => {
            const newFilters = { ...prev };
            if (isChecked) {
                newFilters[filterId] = [...newFilters[filterId], value];
            } else {
                newFilters[filterId] = newFilters[filterId].filter((item) => item !== value);
            }
            return newFilters;
        });
    };

    const handlePriceRangeChange = (type, value) => {
        setPriceRange((prev) => ({
            ...prev,
            [type]: value,
        }));
    };

    const handleSortChange = (sortOption) => {
        setSortBy(sortOption);
    };

    const clearAllFilters = () => {
        setSelectedFilters({
            thuonghieu: [],
            mausac: [],
            trongluong: [],
            chatlieu: [],
            diemcanbang: [],
            docung: [],
        });
        setPriceRange({ min: '', max: '' });
        setSearchQuery('');
    };

    // Filter and sort products
    useEffect(() => {
        let filtered = [...products];

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(
                (product) =>
                    product.tenSanPham?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.thuongHieu?.toLowerCase().includes(searchQuery.toLowerCase()),
            );
        }

        // Apply category filters
        Object.keys(selectedFilters).forEach((filterId) => {
            if (selectedFilters[filterId].length > 0) {
                filtered = filtered.filter((product) => {
                    switch (filterId) {
                        case 'thuonghieu':
                            return selectedFilters[filterId].includes(product.thuongHieu);
                        case 'mausac':
                            return selectedFilters[filterId].includes(product.mauSac);
                        case 'trongluong':
                            return selectedFilters[filterId].includes(product.trongLuong);
                        case 'chatlieu':
                            return selectedFilters[filterId].includes(product.chatLieu);
                        case 'diemcanbang':
                            return selectedFilters[filterId].includes(product.diemCanBang);
                        case 'docung':
                            return selectedFilters[filterId].includes(product.doCung);
                        default:
                            return true;
                    }
                });
            }
        });

        // Apply price filter
        if (priceRange.min || priceRange.max) {
            filtered = filtered.filter((product) => {
                const price = product.giaKhuyenMai || product.donGia;
                const min = priceRange.min ? parseFloat(priceRange.min) : 0;
                const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
                return price >= min && price <= max;
            });
        }

        // Apply sorting
        switch (sortBy) {
            case 'newest':
                filtered = filtered.sort((a, b) => new Date(b.ngayTao) - new Date(a.ngayTao));
                break;
            case 'price-high-low':
                filtered = filtered.sort((a, b) => {
                    const priceA = a.giaKhuyenMai || a.donGia;
                    const priceB = b.giaKhuyenMai || b.donGia;
                    return priceB - priceA;
                });
                break;
            case 'price-low-high':
                filtered = filtered.sort((a, b) => {
                    const priceA = a.giaKhuyenMai || a.donGia;
                    const priceB = b.giaKhuyenMai || b.donGia;
                    return priceA - priceB;
                });
                break;
            case 'popular':
            default:
                // Keep original order or sort by some popularity metric
                break;
        }

        setFilteredProducts(filtered);
    }, [products, selectedFilters, priceRange, searchQuery, sortBy]);

    const filters = [
        {
            id: 'thuonghieu',
            name: 'Thương hiệu',
            options: brands.map((brand) => ({
                value: brand.ten,
                label: brand.ten,
            })),
        },
        {
            id: 'mausac',
            name: 'Màu sắc',
            options: colors.map((color) => ({
                value: color.ten,
                label: color.ten,
            })),
        },
        {
            id: 'trongluong',
            name: 'Trọng lượng',
            options: weights.map((weight) => ({
                value: weight.ten,
                label: weight.ten,
            })),
        },
        {
            id: 'chatlieu',
            name: 'Chất liệu',
            options: materials.map((material) => ({
                value: material.ten,
                label: material.ten,
            })),
        },
        {
            id: 'diemcanbang',
            name: 'Điểm cân bằng',
            options: balances.map((balance) => ({
                value: balance.ten,
                label: balance.ten,
            })),
        },
        {
            id: 'docung',
            name: 'Độ cứng',
            options: stiffs.map((stiff) => ({
                value: stiff.ten,
                label: stiff.ten,
            })),
        },
    ];

    const EnhancedProductListing = ({
        products,
        filteredProducts,
        loading,
        filters,
        sortOptions,
        mobileFiltersOpen,
        setMobileFiltersOpen,
        selectedFilters,
        handleFilterChange,
        priceRange,
        handlePriceRangeChange,
        searchQuery,
        setSearchQuery,
        handleSortChange,
        clearAllFilters,
    }) => {
        const [viewMode, setViewMode] = useState('grid');
        const [openDisclosures, setOpenDisclosures] = useState({});

        const toggleDisclosure = (sectionId) => {
            setOpenDisclosures((prev) => ({
                ...prev,
                [sectionId]: !prev[sectionId],
            }));
        };

        return (
            <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen">
                {/* Enhanced Mobile Filter Dialog */}
                {mobileFiltersOpen && (
                    <div className="fixed inset-0 z-40 lg:hidden">
                        <div
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
                            onClick={() => setMobileFiltersOpen(false)}
                        />
                        <div className="fixed inset-y-0 right-0 z-50 flex">
                            <div className="relative flex h-full w-full max-w-sm transform flex-col overflow-y-auto bg-white/95 backdrop-blur-xl py-4 pb-12 shadow-2xl transition duration-300 border-l border-gray-200">
                                {/* Enhanced Header */}
                                <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
                                        <h2 className="text-xl font-bold text-gray-900">Bộ lọc</h2>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setMobileFiltersOpen(false)}
                                        className="-mr-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 p-2 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        <span className="sr-only">Đóng menu</span>
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Filters */}
                                <div className="mt-4">
                                    {/* Price Range Filter for Mobile */}
                                    <div className="border-b border-gray-100 px-6 py-6">
                                        <h3 className="font-semibold text-gray-900 text-base mb-4">Khoảng giá</h3>
                                        <div className="space-y-3">
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="Từ"
                                                    value={priceRange.min}
                                                    onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Đến"
                                                    value={priceRange.max}
                                                    onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div className="text-xs text-gray-500">VNĐ</div>
                                        </div>
                                    </div>

                                    {filters.map((section) => (
                                        <div key={section.id} className="border-b border-gray-100 px-6 py-6">
                                            <h3 className="-mx-2 -my-3 flow-root">
                                                <button
                                                    onClick={() => toggleDisclosure(`mobile-${section.id}`)}
                                                    className="group flex w-full items-center justify-between bg-transparent px-2 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                                                >
                                                    <span className="font-semibold text-gray-900 text-base">
                                                        {section.name}
                                                    </span>
                                                    <span className="ml-6 flex items-center">
                                                        <div className="p-1 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                                                            {openDisclosures[`mobile-${section.id}`] ? (
                                                                <MinusIcon className="h-4 w-4 text-gray-600" />
                                                            ) : (
                                                                <PlusIcon className="h-4 w-4 text-gray-600" />
                                                            )}
                                                        </div>
                                                    </span>
                                                </button>
                                            </h3>
                                            {openDisclosures[`mobile-${section.id}`] && (
                                                <div className="pt-6">
                                                    <div className="space-y-4">
                                                        {section.options.map((option, optionIdx) => (
                                                            <div key={option.value} className="flex items-center group">
                                                                <input
                                                                    defaultValue={option.value}
                                                                    id={`filter-mobile-${section.id}-${optionIdx}`}
                                                                    name={`${section.id}[]`}
                                                                    type="checkbox"
                                                                    checked={
                                                                        selectedFilters[section.id]?.includes(
                                                                            option.value,
                                                                        ) || false
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleFilterChange(
                                                                            section.id,
                                                                            option.value,
                                                                            e.target.checked,
                                                                        )
                                                                    }
                                                                    className="h-5 w-5 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all"
                                                                />
                                                                <label
                                                                    htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                                                                    className="ml-3 text-sm text-gray-600 group-hover:text-gray-900 cursor-pointer transition-colors"
                                                                >
                                                                    {option.label}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <main className="mx-auto px-4 sm:px-6 lg:px-20 max-w-7xl">
                    {/* Enhanced Header Section */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-gray-200 pb-8 pt-24 gap-6 ">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                                <SparklesIcon className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    Sản phẩm mới
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Khám phá những sản phẩm công nghệ mới nhất
                                    {!loading && ` (${filteredProducts?.length || 0} sản phẩm)`}
                                </p>
                            </div>
                        </div>

                        {/* Enhanced Controls */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Search Bar */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-64 pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Sort Dropdown */}
                            <Menu as="div" className="relative inline-block text-left">
                                <div>
                                    <MenuButton className="group inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                                        Sắp xếp
                                        <ChevronDownIcon
                                            aria-hidden="true"
                                            className="-mr-1 ml-2 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                                        />
                                    </MenuButton>
                                </div>

                                <MenuItems
                                    transition
                                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-black/5 border border-gray-200 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                                >
                                    <div className="py-2">
                                        {sortOptions.map((option) => (
                                            <MenuItem key={option.name}>
                                                <button
                                                    onClick={() => {
                                                        let sortValue = '';
                                                        switch (option.name) {
                                                            case 'Phổ biến nhất':
                                                                sortValue = 'popular';
                                                                break;
                                                            case 'Mới nhất':
                                                                sortValue = 'newest';
                                                                break;
                                                            case 'Giá từ cao đến thấp':
                                                                sortValue = 'price-high-low';
                                                                break;
                                                            case 'Giá từ thấp lên cao':
                                                                sortValue = 'price-low-high';
                                                                break;
                                                            default:
                                                                sortValue = 'popular';
                                                        }
                                                        handleSortChange(sortValue);
                                                    }}
                                                    className={classNames(
                                                        option.current
                                                            ? 'bg-blue-50 text-blue-700 font-semibold'
                                                            : 'text-gray-700 hover:bg-gray-50',
                                                        'block w-full text-left px-4 py-2.5 text-sm transition-colors data-[focus]:bg-gray-50',
                                                    )}
                                                >
                                                    {option.name}
                                                </button>
                                            </MenuItem>
                                        ))}
                                    </div>
                                </MenuItems>
                            </Menu>

                            {/* View Mode Toggle */}
                            <div className="flex bg-gray-100 rounded-xl p-1">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('grid')}
                                    className={classNames(
                                        viewMode === 'grid'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700',
                                        'p-2 rounded-lg transition-all',
                                    )}
                                >
                                    <Squares2X2Icon className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('list')}
                                    className={classNames(
                                        viewMode === 'list'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700',
                                        'p-2 rounded-lg transition-all',
                                    )}
                                ></button>
                            </div>

                            {/* Mobile Filter Button */}
                            <button
                                type="button"
                                onClick={() => setMobileFiltersOpen(true)}
                                className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            >
                                <FunnelIcon className="h-5 w-5" />
                                Bộ lọc
                            </button>
                        </div>
                    </div>

                    <section aria-labelledby="products-heading" className="pb-24 pt-8">
                        <h2 id="products-heading" className="sr-only">
                            Sản phẩm
                        </h2>

                        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-5">
                            {/* Enhanced Desktop Filters */}
                            <form className="hidden lg:block space-y-6">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 w-[222px]">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
                                            Bộ lọc tìm kiếm
                                        </h3>
                                        {Object.values(selectedFilters).some((arr) => arr.length > 0) && (
                                            <button
                                                type="button"
                                                onClick={clearAllFilters}
                                                className="text-xs text-red-600 hover:text-red-700 font-medium"
                                            >
                                                Xóa tất cả
                                            </button>
                                        )}
                                    </div>

                                    {/* Price Range Filter */}
                                    <div className="border-b border-gray-100 pb-6 mb-6">
                                        <h4 className="font-semibold text-gray-900 text-base mb-4">Khoảng giá</h4>
                                        <div className="space-y-3">
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="Từ"
                                                    value={priceRange.min}
                                                    onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Đến"
                                                    value={priceRange.max}
                                                    onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div className="text-xs text-gray-500">VNĐ</div>
                                        </div>
                                    </div>

                                    {filters.map((section) => (
                                        <Disclosure
                                            key={section.id}
                                            as="div"
                                            className="border-b border-gray-100 py-6 last:border-b-0"
                                        >
                                            <h3 className="-my-3 flow-root">
                                                <DisclosureButton className="group flex w-full items-center justify-between bg-transparent py-3 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                                    <span className="font-semibold text-gray-900 text-base">
                                                        {section.name}
                                                    </span>
                                                    <span className="ml-6 flex items-center">
                                                        <div className="p-1 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                                                            <PlusIcon
                                                                aria-hidden="true"
                                                                className="h-4 w-4 group-data-[open]:hidden text-gray-600"
                                                            />
                                                            <MinusIcon
                                                                aria-hidden="true"
                                                                className="h-4 w-4 [.group:not([data-open])_&]:hidden text-gray-600"
                                                            />
                                                        </div>
                                                    </span>
                                                </DisclosureButton>
                                            </h3>
                                            <DisclosurePanel className="pt-6">
                                                <div className="space-y-4">
                                                    {section.options.map((option, optionIdx) => (
                                                        <div key={option.value} className="flex items-center group">
                                                            <input
                                                                defaultValue={option.value}
                                                                id={`filter-${section.id}-${optionIdx}`}
                                                                name={`${section.id}[]`}
                                                                type="checkbox"
                                                                checked={
                                                                    selectedFilters[section.id]?.includes(
                                                                        option.value,
                                                                    ) || false
                                                                }
                                                                onChange={(e) =>
                                                                    handleFilterChange(
                                                                        section.id,
                                                                        option.value,
                                                                        e.target.checked,
                                                                    )
                                                                }
                                                                className="h-5 w-5 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all"
                                                            />
                                                            <label
                                                                htmlFor={`filter-${section.id}-${optionIdx}`}
                                                                className="ml-3 text-sm text-gray-600 group-hover:text-gray-900 cursor-pointer transition-colors"
                                                            >
                                                                {option.label}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </DisclosurePanel>
                                        </Disclosure>
                                    ))}
                                </div>
                            </form>

                            {/* Enhanced Product Grid */}
                            <div className="lg:col-span-4 w-full">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    {loading ? (
                                        <div className="flex items-center justify-center py-20">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                                                <p className="text-gray-600 font-medium">Đang tải sản phẩm...</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={classNames(
                                                viewMode === 'grid'
                                                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                                                    : 'flex flex-col gap-4',
                                                'w-full',
                                            )}
                                        >
                                            {filteredProducts?.length > 0 ? (
                                                filteredProducts.map((product) => (
                                                    <ProductCard
                                                        key={product.id}
                                                        product={product}
                                                        viewMode={viewMode}
                                                    />
                                                ))
                                            ) : (
                                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                                                    <div className="p-4 bg-gray-100 rounded-2xl mb-4">
                                                        <SparklesIcon className="h-12 w-12 text-gray-400" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                        Không tìm thấy sản phẩm
                                                    </h3>
                                                    <p className="text-gray-600 mb-4">
                                                        Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                                                    </p>
                                                    {Object.values(selectedFilters).some((arr) => arr.length > 0) && (
                                                        <button
                                                            onClick={clearAllFilters}
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                        >
                                                            Xóa tất cả bộ lọc
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        );
    };

    return (
        <EnhancedProductListing
            products={products}
            filteredProducts={filteredProducts}
            loading={loading}
            filters={filters}
            sortOptions={sortOptions}
            mobileFiltersOpen={mobileFiltersOpen}
            setMobileFiltersOpen={setMobileFiltersOpen}
            selectedFilters={selectedFilters}
            handleFilterChange={handleFilterChange}
            priceRange={priceRange}
            handlePriceRangeChange={handlePriceRangeChange}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSortChange={handleSortChange}
            clearAllFilters={clearAllFilters}
        />
    );
}
