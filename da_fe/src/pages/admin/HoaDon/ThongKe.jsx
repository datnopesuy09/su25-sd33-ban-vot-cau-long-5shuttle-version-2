// =============================
// Trang Thống kê tổng quan cho Admin
// =============================

import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Skeleton } from '@mui/material';
import dayjs from 'dayjs';
import axios from 'axios';

// Import các component con
import FilterBar from './component/FilterBar';
import StatisticCardsGroup from './component/StatisticCardsGroup';
import StatusPieChart from './component/StatusPieChart';
import TableBestSelling from './component/Table';
import TableOutOfStock from './component/TableOutOfStock';

// Import icon cho các filter
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import DateRangeIcon from '@mui/icons-material/DateRange';

// Danh sách các filter thời gian
const FILTERS = [
    { label: 'NGÀY', value: 'Ngày' },
    { label: 'TUẦN', value: 'Tuần' },
    { label: 'THÁNG', value: 'Tháng' },
    { label: 'NĂM', value: 'Năm' },
    { label: 'TÙY CHỈNH', value: 'Tùy chỉnh' },
];

// Map icon cho từng filter
const ICONS = {
    'Ngày': <CalendarTodayIcon />,
    'Tuần': <CalendarViewWeekIcon />,
    'Tháng': <CalendarMonthIcon />,
    'Năm': <DateRangeIcon />,
    'Tùy chỉnh': <EditCalendarIcon />,
};

// Màu sắc cho từng card thống kê
const COLOR_CARDS = {
    'Ngày': '#00838f',
    'Tuần': '#f57c00',
    'Tháng': '#90a4ae',
    'Năm': '#0d47a1',
    'Tùy chỉnh': '#3399FF',
};

// Hàm lấy URL API theo filter
const getApiUrl = (filter, fromDate, toDate) => {
  switch (filter) {
    case 'Ngày':
      return 'http://localhost:8080/thong-ke/overall/ngay';
    case 'Tuần':
      return 'http://localhost:8080/thong-ke/overall/tuan';
    case 'Tháng':
      return 'http://localhost:8080/thong-ke/overall/thang';
    case 'Năm':
      return 'http://localhost:8080/thong-ke/overall/nam';
    case 'Tùy chỉnh':
      return `http://localhost:8080/thong-ke/overall/tuy-chinh?fromDate=${fromDate.format('YYYY-MM-DD')}&toDate=${toDate.format('YYYY-MM-DD')}`;
    default:
      return '';
  }
};

const ThongKe = () => {
    // =============================
    // State quản lý dữ liệu và loading
    // =============================
    const [selectedFilter, setSelectedFilter] = useState('Ngày'); // Filter đang chọn
    const [fromDate, setFromDate] = useState(dayjs()); // Ngày bắt đầu
    const [toDate, setToDate] = useState(dayjs());     // Ngày kết thúc
    const [allCardsData, setAllCardsData] = useState([]); // Dữ liệu cho các card tổng quan
    const [pieChartData, setPieChartData] = useState([]);  // Dữ liệu cho biểu đồ trạng thái
    const [isLoading, setIsLoading] = useState(false);     // Loading cho card tổng quan
    const [isTableLoading, setIsTableLoading] = useState(false); // Loading cho bảng sản phẩm
    const [isChartLoading, setIsChartLoading] = useState(false); // Loading cho biểu đồ

    // =============================
    // Lấy dữ liệu tổng quan cho các card
    // =============================
    useEffect(() => {
        const fetchAllCards = async () => {
            setIsLoading(true);
            const cards = await Promise.all(
                FILTERS.map(async (filter) => {
                    try {
                        const url = getApiUrl(filter.value, fromDate, toDate);
                        const res = await axios.get(url);
                        const data = res.data;
                        let title = `Tổng quan ${filter.value.toLowerCase()}`;
                        if (filter.value === 'Tùy chỉnh') {
                            title = `Tùy chỉnh (${fromDate.format('DD-MM-YYYY')} - ${toDate.format('DD-MM-YYYY')})`;
                        }
                        return {
                            id: filter.value,
                            title: title,
                            icon: ICONS[filter.value],
                            amount: data.tongTien || 0,
                            stats: {
                                products: data.tongSanPham || 0,
                                success: data.tongDonThanhCong || 0,
                                cancel: data.tongDonHuy || 0,
                                return: data.tongDonTra || 0,
                            },
                            color: COLOR_CARDS[filter.value],
                            customWidth: filter.value === 'Tùy chỉnh' ? 1180 : 575,
                        };
                    } catch (error) {
                        // Nếu lỗi thì trả về card rỗng
                        return {
                            id: filter.value,
                            title: `Tổng quan ${filter.value.toLowerCase()}`,
                            icon: ICONS[filter.value],
                            amount: 0,
                            stats: { products: 0, success: 0, cancel: 0, return: 0 },
                            color: COLOR_CARDS[filter.value],
                            customWidth: filter.value === 'Tùy chỉnh' ? 1180 : 575,
                        };
                    }
                })
            );
            setAllCardsData(cards);
            setIsLoading(false);
        };
        fetchAllCards();
    }, [fromDate, toDate]);

    // =============================
    // Lấy dữ liệu cho biểu đồ trạng thái
    // =============================
    useEffect(() => {
        const fetchPieChartData = async () => {
            setIsChartLoading(true);
            try {
                const url = getApiUrl(selectedFilter, fromDate, toDate);
                const res = await axios.get(url);
                const data = res.data;
                setPieChartData([
                    { name: 'Thành công', value: data.tongDonThanhCong || 0 },
                    { name: 'Đơn hủy', value: data.tongDonHuy || 0 },
                    { name: 'Đơn trả', value: data.tongDonTra || 0 },
                ]);
            } catch (error) {
                setPieChartData([
                    { name: 'Thành công', value: 0 },
                    { name: 'Đơn hủy', value: 0 },
                    { name: 'Đơn trả', value: 0 },
                ]);
            } finally {
                setIsChartLoading(false);
            }
        };
        fetchPieChartData();
    }, [selectedFilter, fromDate, toDate]);

    // =============================
    // Xử lý khi đổi filter (ngày/tuần/tháng...)
    // =============================
    const handleFilterChange = (newFilter) => {
        setSelectedFilter(newFilter);
        setIsTableLoading(true); // Bắt đầu loading cho bảng
        setTimeout(() => {
            setIsTableLoading(false); // Tắt loading sau 0.5s (giả lập thời gian API)
        }, 500);
    };
    
    // =============================
    // Xử lý export Excel (hiện tại chỉ log ra console)
    // =============================
    const handleExport = () => {
        console.log("Đã nhấn nút Export Excel");
    };

    // =============================
    // Render giao diện
    // =============================
    return (
        <Box sx={{ p: 3 }}>
            {/* Tiêu đề trang */}
            <Typography variant="h4" gutterBottom sx={{ color: 'black'}}>
                Thống kê
            </Typography>

            {/* Card thống kê tổng quan */}
            <Box mb={3}>
                {isLoading ? (
                    <Grid container spacing={3}>
                        {[1, 2, 3, 4, 5].map((item) => (
                            <Grid item xs={12} md={6} key={item}>
                                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <StatisticCardsGroup cards={allCardsData} />
                )}
            </Box>

            {/* Thanh filter chọn thời gian, xuất excel */}
            <FilterBar
                filters={FILTERS}
                selectedFilter={selectedFilter}
                onFilterChange={handleFilterChange}
                fromDate={fromDate}
                toDate={toDate}
                onFromDateChange={setFromDate}
                onToDateChange={setToDate}
                onExport={handleExport}
            />

            {/* Bảng sản phẩm bán chạy và biểu đồ trạng thái */}
            <Grid container spacing={3} alignItems="stretch">
                {/* Bảng sản phẩm bán chạy */}
                <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box 
                        sx={{ 
                            backgroundColor: '#ffffff',
                            borderRadius: 3,
                            p: 3,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            height: '100%',
                            minHeight: '500px',
                            width: '100%',
                            flexShrink: 0,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <TableBestSelling 
                            filterLabel={selectedFilter} 
                            fromDate={fromDate}
                            toDate={toDate}
                            loading={isTableLoading}
                        />
                    </Box>
                </Grid>
                {/* Biểu đồ trạng thái đơn hàng */}
                <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box 
                        sx={{ 
                            backgroundColor: '#ffffff',
                            borderRadius: 3,
                            p: 3,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            height: '100%',
                            minHeight: '500px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <StatusPieChart
                            data={pieChartData}
                            label={selectedFilter.toLowerCase()}
                            colors={[
                                COLOR_CARDS[selectedFilter] || '#00838f',
                                '#f44336',
                                '#9c27b0',
                            ]}
                            loading={isChartLoading}
                        />
                    </Box>
                </Grid>
            </Grid>

            {/* Bảng sản phẩm sắp hết hàng */}
            <Box mt={4}>
                <TableOutOfStock />
            </Box>
        </Box>
    );
};

export default ThongKe;
