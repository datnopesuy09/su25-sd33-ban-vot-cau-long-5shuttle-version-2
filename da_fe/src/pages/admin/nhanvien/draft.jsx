import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SearchIcon from '@mui/icons-material/Search'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'

// 🔶 Giả lập hàm định dạng tiền VNĐ
const formatCurrency = (value) => {
  if (typeof value !== 'number') {
    value = Number(value)
    if (isNaN(value)) return '0₫'
  }

  return value.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  })
}

// 🔶 Trạng thái đơn hàng
const getStatus = (status) => {
  switch (status) {
    case 0:
      return 'Chờ xác nhận'
    case 1:
      return 'Đã xác nhận'
    case 2:
      return 'Đang giao'
    case 3:
      return 'Hoàn thành'
    case 7:
      return 'Đã huỷ'
    default:
      return 'Không xác định'
  }
}

// 🔶 Style chip trạng thái
const getStatusStyle = (status) => {
  switch (status) {
    case 0:
      return 'waiting'
    case 1:
      return 'confirmed'
    case 2:
      return 'shipping'
    case 3:
      return 'completed'
    case 7:
      return 'cancelled'
    default:
      return ''
  }
}

  // <Typography fontSize={13} mt={1}>
  //               Người nhận: <strong>{item.tenNguoiNhan}</strong> | SĐT: {item.sdtNguoiNhan}
  //             </Typography>
  //             <Typography fontSize={13}>
  //               Địa chỉ: {item.diaChiNguoiNhan}
  //             </Typography>
                    // <Typography fontSize={13}>Phương thức thanh toán: {item.phuongThucThanhToan}</Typography>


// 🔶 Trạng thái profile (dành cho tab)
const getStatusProfile = (status) => {
  switch (status) {
    case 0:
      return 'Chờ xác nhận'
    case 1:
      return 'Đã xác nhận'
    case 2:
      return 'Đang giao'
    case 3:
      return 'Hoàn thành'
    case 7:
      return 'Đã huỷ'
    default:
      return 'Không xác định'
  }
}

// 🔶 Hook debounce đơn giản
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function MyOrderDetail() {
  const [getBillTable, setGetBillTable] = useState([])
  const [valueTabHD, setValueTabHD] = useState('all')
  const [inputValue, setInputValue] = useState('')
  const debouncedValue = useDebounce(inputValue, 1000)

  const listSttHD = [0, 1, 2, 3, 7]

  const [filter, setFilter] = useState({
    status: '',
    code: null,
  })

  const handleChangeTab = (event, newValue) => {
    setValueTabHD(newValue)
    const updatedFilter = { ...filter, status: newValue === 'all' ? '' : newValue }
    setFilter(updatedFilter)
  }

  const validateSearchInput = (value) => {
    const specialCharsRegex = /[!@#\$%\^&*\(\),.?":{}|<>[\]]/
    return !specialCharsRegex.test(value)
  }

  // 🔶 Dữ liệu đơn hàng giả lập
  const mockBills = [
    {
      id: 1,
      code: 'HD001',
      status: 0,
      createdAt: '2025-07-21',
      desiredReceiptDate: '2025-07-26',
      completeDate: null,
      moneyShip: 20000,
      moneyAfter: 1000000,
    },
    {
      id: 2,
      code: 'HD002',
      status: 1,
      createdAt: '2025-07-18',
      desiredReceiptDate: '2025-07-23',
      completeDate: null,
      moneyShip: 30000,
      moneyAfter: 1250000,
    },
    {
      id: 3,
      code: 'HDVIP999',
      status: 3,
      createdAt: '2025-06-30',
      desiredReceiptDate: '2025-07-05',
      completeDate: '2025-07-04',
      moneyShip: 0,
      moneyAfter: 2000000,
    },
    {
      id: 4,
      code: 'HUY123',
      status: 7,
      createdAt: '2025-07-01',
      desiredReceiptDate: '2025-07-06',
      completeDate: null,
      moneyShip: 15000,
      moneyAfter: 500000,
    },
  ]

  // 🔁 Lọc dữ liệu theo filter
  const fetchAllBillTable = (filter) => {
    let result = [...mockBills]
    if (filter.status !== '') {
      result = result.filter((bill) => bill.status === Number(filter.status))
    }
    if (filter.code) {
      result = result.filter((bill) =>
        bill.code.toLowerCase().includes(filter.code.toLowerCase())
      )
    }
    setGetBillTable(result)
  }

  useEffect(() => {
    fetchAllBillTable(filter)
  }, [filter])

  useEffect(() => {
    setFilter({ ...filter, code: inputValue })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue])

  return (
    <div className="order">
      <Box
        sx={{
          mt: 2,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: '#EEE5DE',
          borderRadius: '8px',
        }}>
        <Tabs value={valueTabHD} onChange={handleChangeTab} className="tabSttHD">
          <Tab label="Tất cả" value="all" />
          {listSttHD.map((row) => (
            <Tab label={getStatusProfile(row)} value={row} key={row} />
          ))}
        </Tabs>
      </Box>

      <TextField
        sx={{
          width: '100%',
          mt: 2,
          mb: 2,
          backgroundColor: 'white',
          borderRadius: '10px',
        }}
        placeholder="Tìm kiếm theo mã hóa đơn"
        size="small"
        onChange={(e) => {
          const value = e.target.value
          if (validateSearchInput(value)) {
            setInputValue(value)
          } else {
            setInputValue('')
            toast.warning('Tìm kiếm không được có kí tự đặc biệt')
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="cam" />
            </InputAdornment>
          ),
        }}
      />

      <div style={{ maxHeight: '500px', overflow: 'auto' }}>
        {getBillTable.map((item) => (
          <Grid container spacing={2} key={item.id} sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <Paper elevation={3}>
                <Box sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1">{item.code}</Typography>
                    <Chip
                      label={getStatus(item.status)}
                      className={getStatusStyle(item.status)}
                      size="small"
                    />
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" justifyContent="space-between">
                    <Box>
                      <Typography>
                        Ngày đặt hàng: {dayjs(item.createdAt).format('DD/MM/YYYY')}
                      </Typography>
                      {item.completeDate ? (
                        <Typography>
                          Ngày nhận hàng: {dayjs(item.completeDate).format('DD/MM/YYYY')}
                        </Typography>
                      ) : (
                        <Typography>
                          Ngày dự kiến nhận: {dayjs(item.desiredReceiptDate).format('DD/MM/YYYY')}
                        </Typography>
                      )}
                      <Button
                        component={Link}
                        to={`/profile/get-by-idBill/${item.id}`}
                        variant="outlined"
                        sx={{ mt: 2 }}
                        color="cam">
                        Thông tin chi tiết
                      </Button>
                    </Box>
                    <Box>
                      <Typography>Tiền ship: {formatCurrency(item.moneyShip)}</Typography>
                      <Typography>Tổng tiền: {formatCurrency(item.moneyAfter)}</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        ))}
      </div>
    </div>
  )
}
