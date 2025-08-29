import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const bulkOrderAPI = {
    // Tạo yêu cầu bulk order mới
    createBulkOrderInquiry: async (inquiryData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/bulk-orders/inquiries`, {
                customerInfo: inquiryData.customerInfo,
                orderData: inquiryData.orderData,
                contactMethod: inquiryData.contactMethod,
                createdAt: new Date().toISOString(),
                status: 'pending',
            });
            return response.data;
        } catch (error) {
            console.error('Error creating bulk order inquiry:', error);
            throw error;
        }
    },

    // Lấy danh sách tất cả yêu cầu bulk order
    getAllInquiries: async (filters = {}) => {
        try {
            const params = new URLSearchParams();

            if (filters.status && filters.status !== 'all') {
                params.append('status', filters.status);
            }
            if (filters.method && filters.method !== 'all') {
                params.append('contactMethod', filters.method);
            }
            if (filters.dateRange && filters.dateRange !== 'all') {
                params.append('dateRange', filters.dateRange);
            }
            if (filters.search) {
                params.append('search', filters.search);
            }
            if (filters.assignedStaff) {
                params.append('assignedStaff', filters.assignedStaff);
            }

            const response = await axios.get(`${API_BASE_URL}/bulk-orders/inquiries?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching bulk order inquiries:', error);
            throw error;
        }
    },

    // Lấy chi tiết một yêu cầu bulk order
    getInquiryById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/bulk-orders/inquiries/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching bulk order inquiry:', error);
            throw error;
        }
    },

    // Cập nhật trạng thái yêu cầu
    updateInquiryStatus: async (id, status, assignedStaff = null) => {
        try {
            const response = await axios.patch(`${API_BASE_URL}/bulk-orders/inquiries/${id}/status`, {
                status,
                assignedStaff,
                updatedAt: new Date().toISOString(),
            });
            return response.data;
        } catch (error) {
            console.error('Error updating inquiry status:', error);
            throw error;
        }
    },

    // Thêm ghi chú vào yêu cầu
    addInquiryNote: async (id, note, staffName) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/bulk-orders/inquiries/${id}/notes`, {
                text: note,
                staffName,
                timestamp: new Date().toISOString(),
            });
            return response.data;
        } catch (error) {
            console.error('Error adding inquiry note:', error);
            throw error;
        }
    },

    // Lấy thống kê bulk orders
    getStatistics: async (dateRange = 'month') => {
        try {
            const response = await axios.get(`${API_BASE_URL}/bulk-orders/statistics?range=${dateRange}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching statistics:', error);
            throw error;
        }
    },

    // Xuất báo cáo Excel
    exportToExcel: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            Object.keys(filters).forEach((key) => {
                if (filters[key] && filters[key] !== 'all') {
                    params.append(key, filters[key]);
                }
            });

            const response = await axios.get(`${API_BASE_URL}/bulk-orders/export?${params}`, {
                responseType: 'blob',
            });

            // Tạo file download
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `bulk-orders-${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            throw error;
        }
    },

    // Gửi email tự động cho khách hàng
    sendFollowUpEmail: async (inquiryId, emailTemplate, customMessage = '') => {
        try {
            const response = await axios.post(`${API_BASE_URL}/bulk-orders/inquiries/${inquiryId}/send-email`, {
                template: emailTemplate,
                customMessage,
                sentAt: new Date().toISOString(),
            });
            return response.data;
        } catch (error) {
            console.error('Error sending follow-up email:', error);
            throw error;
        }
    },

    // Tạo báo giá cho khách hàng
    createQuotation: async (inquiryId, quotationData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/bulk-orders/inquiries/${inquiryId}/quotation`, {
                ...quotationData,
                createdAt: new Date().toISOString(),
            });
            return response.data;
        } catch (error) {
            console.error('Error creating quotation:', error);
            throw error;
        }
    },

    // Chuyển đổi inquiry thành đơn hàng thực tế
    convertToOrder: async (inquiryId, orderDetails) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/bulk-orders/inquiries/${inquiryId}/convert`, {
                ...orderDetails,
                convertedAt: new Date().toISOString(),
            });
            return response.data;
        } catch (error) {
            console.error('Error converting to order:', error);
            throw error;
        }
    },

    // Lấy lịch sử hoạt động của một inquiry
    getInquiryHistory: async (inquiryId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/bulk-orders/inquiries/${inquiryId}/history`);
            return response.data;
        } catch (error) {
            console.error('Error fetching inquiry history:', error);
            throw error;
        }
    },

    // Cập nhật thông tin khách hàng
    updateCustomerInfo: async (inquiryId, customerData) => {
        try {
            const response = await axios.patch(`${API_BASE_URL}/bulk-orders/inquiries/${inquiryId}/customer`, {
                ...customerData,
                updatedAt: new Date().toISOString(),
            });
            return response.data;
        } catch (error) {
            console.error('Error updating customer info:', error);
            throw error;
        }
    },

    // Lấy danh sách nhân viên có thể assign
    getAvailableStaff: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/staff/bulk-order-handlers`);
            return response.data;
        } catch (error) {
            console.error('Error fetching available staff:', error);
            throw error;
        }
    },

    // Track interaction (để analytics)
    trackInteraction: async (interactionData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/bulk-orders/interactions`, {
                ...interactionData,
                timestamp: new Date().toISOString(),
            });
            return response.data;
        } catch (error) {
            console.error('Error tracking interaction:', error);
            // Không throw error để không ảnh hưởng UX
            return null;
        }
    },
};

// Helper functions để sử dụng trong components
export const bulkOrderHelpers = {
    // Format currency
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    },

    // Format date
    formatDate: (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    },

    // Get status color
    getStatusColor: (status) => {
        const colors = {
            pending: 'yellow',
            contacted: 'blue',
            completed: 'green',
            cancelled: 'red',
        };
        return colors[status] || 'gray';
    },

    // Get contact method display name
    getContactMethodName: (method) => {
        const names = {
            phone: 'Điện thoại',
            zalo: 'Zalo',
            email: 'Email',
            visit: 'Đến cửa hàng',
        };
        return names[method] || method;
    },

    // Calculate potential discount based on order value
    calculatePotentialDiscount: (totalValue, totalQuantity) => {
        if (totalValue >= 10000000) return 15;
        if (totalValue >= 5000000) return 10;
        if (totalQuantity >= 15) return 8;
        if (totalQuantity >= 10) return 5;
        return 0;
    },

    // Validate inquiry data
    validateInquiryData: (data) => {
        const errors = [];

        if (!data.customerInfo?.name) errors.push('Tên khách hàng là bắt buộc');
        if (!data.customerInfo?.phone) errors.push('Số điện thoại là bắt buộc');
        if (!data.orderData?.totalValue || data.orderData.totalValue <= 0) {
            errors.push('Giá trị đơn hàng phải lớn hơn 0');
        }
        if (!data.contactMethod) errors.push('Phương thức liên hệ là bắt buộc');

        return {
            isValid: errors.length === 0,
            errors,
        };
    },
};

export default bulkOrderAPI;
