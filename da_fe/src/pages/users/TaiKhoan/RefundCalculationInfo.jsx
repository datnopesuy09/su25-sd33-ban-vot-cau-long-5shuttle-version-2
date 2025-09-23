import React from 'react';
import { Typography, Paper, Divider, Box } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import numeral from 'numeral';

const RefundCalculationInfo = ({ orderInfo, totalRefund, actualRefundAmount }) => {
    if (!orderInfo?.voucher) {
        return null;
    }

    const voucher = orderInfo.voucher;
    const discountAmount = totalRefund - actualRefundAmount;
    
    return (
        <Paper 
            elevation={0} 
            sx={{ 
                p: 2, 
                border: '1px solid #e3f2fd', 
                backgroundColor: '#f8f9fa',
                mb: 2 
            }}
        >
            <Box display="flex" alignItems="center" mb={1}>
                <InfoOutlined color="info" sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2" color="info.main" fontWeight="bold">
                    Chi tiết tính toán hoàn trả
                </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Đơn hàng của bạn đã áp dụng voucher "{voucher.ten}", số tiền hoàn trả sẽ được tính theo tỷ lệ tương ứng.
            </Typography>

            <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <span>Tổng giá trị sản phẩm trả:</span>
                    <span>{numeral(totalRefund).format('0,0')} ₫</span>
                </Typography>
                
                <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <span>Giảm giá từ voucher (tỷ lệ):</span>
                    <span style={{ color: '#f44336' }}>- {numeral(discountAmount).format('0,0')} ₫</span>
                </Typography>
                
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>Số tiền hoàn trả thực tế:</span>
                    <span style={{ color: '#2e7d32' }}>{numeral(actualRefundAmount).format('0,0')} ₫</span>
                </Typography>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
                * Số tiền hoàn trả đã được điều chỉnh theo voucher đã áp dụng trong đơn hàng gốc
            </Typography>
        </Paper>
    );
};

export default RefundCalculationInfo;