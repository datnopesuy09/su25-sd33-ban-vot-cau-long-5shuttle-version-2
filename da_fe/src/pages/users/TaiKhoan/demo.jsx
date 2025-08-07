import { Box, Button, Checkbox, TableHead, TableRow } from '@mui/material'
import React, { useEffect, useState } from 'react'
import {
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TextField,
} from '@mui/material'
import { RemoveCircle } from '@mui/icons-material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import { FaMoneyBillWave } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { GrSelect } from 'react-icons/gr'

export default function ModalReturn({ setTab, setOpen }) {
  const [bill, setBill] = useState({})
  const [billDetail, setBillDetail] = useState([])
  const [phi, setPhi] = useState(0)
  const [traKhach, setTraKhach] = useState(0)

  useEffect(() => {
    // Fake bill
    setBill({
      id: 1,
      code: 'HD12345',
      customer: 'Nguyen Van A',
    })

    // Fake chi tiết bill
    setBillDetail([
      {
        id: 1,
        name: 'Áo Thun Nam',
        quantity: 5,
        quantityReturn: 0,
        price: 200000,
        image: 'https://via.placeholder.com/60',
        note: '',
      },
      {
        id: 2,
        name: 'Quần Jean',
        quantity: 2,
        quantityReturn: 0,
        price: 500000,
        image: 'https://via.placeholder.com/60',
        note: '',
      },
    ])
  }, [])

  function changeNote(value, product) {
    const preBillDetail = [...billDetail]
    const index = preBillDetail.findIndex((item) => item.id === product.id)
    if (index !== -1) {
      preBillDetail[index] = {
        ...product,
        note: value,
      }
      setBillDetail(preBillDetail)
    }
  }

  function changeSL(value, product) {
    const preBillDetail = [...billDetail]
    const index = preBillDetail.findIndex((item) => item.id === product.id)

    let quantityReturn = parseInt(value)
    if (isNaN(quantityReturn) || quantityReturn < 0) {
      quantityReturn = 0
    }

    quantityReturn = Math.min(quantityReturn, product.quantity)

    if (index !== -1) {
      preBillDetail[index] = {
        ...product,
        quantityReturn,
      }
      setBillDetail(preBillDetail)
      setTraKhach(
        preBillDetail.reduce((total, e) => total + e.quantityReturn * e.price, 0) *
          (1 - phi / 100),
      )
    }
  }

  function guiYeuCau() {
    const detail = billDetail
      .filter((bd) => bd.quantityReturn > 0)
      .map((bd) => ({
        name: bd.name,
        quantity: bd.quantityReturn,
        price: bd.price,
        idBillDetail: bd.id,
        note: bd.note,
      }))

    const returnBill = {
      idBill: bill.id,
      returnMoney:
        billDetail.reduce((total, e) => total + e.quantityReturn * e.price, 0) *
        (1 - phi / 100),
      moneyPayment: traKhach,
      fee: phi,
      listDetail: detail,
    }

    console.log('Yêu cầu trả hàng:', returnBill)
    toast.success('Giả lập gửi yêu cầu trả hàng thành công!')
    setOpen(false)
    setTab('traHang')
  }

  return (
    <Box sx={{ m: 2 }}>
      <div className="tra-hang">
        <Grid container spacing={2} mt={2}>
          <Grid
            sx={{
              '::-webkit-scrollbar': {
                width: '0px',
              },
            }}
            item
            xs={12}
            style={{ overflow: 'auto', height: '500px', paddingTop: 0 }}>
            <Paper className="paper-return" sx={{ mb: 2, p: 1 }}>
              <h4 style={{ margin: '0' }}>
                <GrSelect fontSize={20} style={{ marginBottom: '-6px' }} />
                &nbsp; Chọn sản phẩm cần trả
              </h4>
              <hr style={{ marginBottom: '0px' }} />
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ padding: 0 }} width={'5%'}>
                      <Checkbox
                        onChange={(e) => {
                          setBillDetail((prevBillDetail) => {
                            const newBillDetail = [...prevBillDetail]
                            if (e.target.checked) {
                              newBillDetail.forEach((item) => {
                                item.quantityReturn = item.quantity
                              })
                            } else {
                              newBillDetail.forEach((item) => {
                                item.quantityReturn = 0
                              })
                            }
                            return newBillDetail
                          })
                        }}
                        checked={billDetail.reduce((check, e) => {
                          if (e.quantity !== e.quantityReturn) {
                            check = false
                          }
                          return check
                        }, true)}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ padding: 0 }} width={'30%'} style={{ fontWeight: 'bold' }}>
                      Sản phẩm
                    </TableCell>
                    <TableCell sx={{ padding: 0 }} width={'15%'} style={{ fontWeight: 'bold' }} align="center">
                      Số lượng
                    </TableCell>
                    <TableCell sx={{ padding: 0 }} width={'15%'} style={{ fontWeight: 'bold' }} align="center">
                      Đơn giá
                    </TableCell>
                    <TableCell sx={{ padding: 0 }} width={'10%'} style={{ fontWeight: 'bold' }} align="center">
                      Tổng
                    </TableCell>
                    <TableCell sx={{ padding: 0 }} width={'25%'} style={{ fontWeight: 'bold' }} align="center">
                      Ghi chú
                    </TableCell>
                  </TableRow>
                </TableHead>
              </Table>
              <Table>
                {billDetail.map((product) => (
                  <TableBody key={product.id}>
                    <TableCell sx={{ padding: 0 }} width={'5%'}>
                      <Checkbox
                        checked={product.quantity === product.quantityReturn}
                        onChange={(e) => {
                          if (e.target.checked) {
                            changeSL(product.quantity, product)
                          } else {
                            changeSL(0, product)
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell width={'30%'}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img
                          alt="anh-san-pham"
                          width={'60px'}
                          height={'60px'}
                          src={product.image}
                          style={{ objectFit: 'cover' }}
                        />
                        <div style={{ paddingLeft: '10px' }}>{product.name}</div>
                      </div>
                    </TableCell>
                    <TableCell width={'15%'} align="center">
                      <IconButton size="small" onClick={() => changeSL(product.quantityReturn - 1, product)}>
                        <RemoveCircle sx={{ color: '#BDC3C7' }} />
                      </IconButton>
                      <TextField
                        sx={{ width: '70px' }}
                        size="small"
                        onChange={(e) => changeSL(e.target.value, product)}
                        value={product.quantityReturn}
                        variant="standard"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment sx={{ paddingRight: '10px' }} position="end">
                              / {product.quantity}
                            </InputAdornment>
                          ),
                        }}
                      />
                      <IconButton size="small" onClick={() => changeSL(product.quantityReturn + 1, product)}>
                        <AddCircleIcon sx={{ color: '#BDC3C7' }} />
                      </IconButton>
                    </TableCell>
                    <TableCell width={'15%'} align="center">
                      <TextField
                        fullWidth
                        size="small"
                        disabled
                        value={product.price.toLocaleString('it-IT', { style: 'currency', currency: 'VND' })}
                        variant="standard"
                      />
                    </TableCell>
                    <TableCell width={'10%'} align="center">
                      <b style={{ color: 'red' }}>
                        {(product.price * product.quantityReturn).toLocaleString('it-IT', {
                          style: 'currency',
                          currency: 'VND',
                        })}
                      </b>
                    </TableCell>
                    <TableCell width={'25%'} align="center">
                      <TextField
                        fullWidth
                        value={product.note}
                        onChange={(e) => changeNote(e.target.value, product)}
                        disabled={product.quantityReturn <= 0}
                        placeholder="Ghi chú"
                        multiline
                        rows={2}
                      />
                    </TableCell>
                  </TableBody>
                ))}
              </Table>
            </Paper>
          </Grid>
          <Grid item xs={12} style={{ paddingTop: 0 }}>
            <Paper
              sx={{
                backgroundColor: '#EBEBEB',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: '10px',
              }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaMoneyBillWave style={{ marginRight: '5px' }} />
                <b style={{ marginRight: '10px' }}>Tổng tiền hoàn trả</b>
                <Chip
                  style={{ color: 'white', fontWeight: 'bold', backgroundColor: 'red' }}
                  label={billDetail
                    .reduce((total, e) => total + e.quantityReturn * e.price, 0)
                    .toLocaleString('it-IT', { style: 'currency', currency: 'VND' })}
                  size="small"
                />
              </div>
              <Button onClick={guiYeuCau} color="success" variant="contained" size="small">
                Xác nhận trả hàng
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </Box>
  )
}
