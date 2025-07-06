// =============================
// Nhóm các card thống kê tổng quan
// =============================

import React from 'react';
import { Grid } from '@mui/material';
import StatisticCard from './Card';

// Props:
// - cards: Mảng dữ liệu các card thống kê tổng quan
//   (mỗi card gồm title, icon, amount, stats, color, customWidth...)
const StatisticCardsGroup = ({ cards }) => {
  return (
    <Grid container spacing={3}>
      {cards.map((card) => {
        // Logic chia cột: 4 thẻ đầu chiếm 6/12, thẻ Tùy chỉnh chiếm 12/12
        const columnSize = card.id === 'Tùy chỉnh' ? 12 : 6;

        return (
          <Grid item xs={12} md={columnSize} key={card.id}>
            {/* Render từng card thống kê */}
            <StatisticCard {...card} />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default StatisticCardsGroup; 