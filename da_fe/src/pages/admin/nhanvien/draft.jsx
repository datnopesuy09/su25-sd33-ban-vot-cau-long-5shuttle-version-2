import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Box,
  Avatar,
  Paper,
} from "@mui/material";

function EditStaff() {
  const [previewImage, setPreviewImage] = useState(null)
  const navigate = useNavigate()
  const { id } = useParams()
  const [data, setData] = useState({
    hoTen: '',
    cccd: '',
    gioiTinh: '',
    email: '',
    sdt: '',
    ngaySinh: '',
  })

  useEffect(() => {
    axios.get(`http://localhost:8080/shuttle/nhan-vien/${id}`)
      .then((response) => {
        const nv = response.data
        setData({
          hoTen: nv.hoTen || '',
          cccd: nv.cccd || '',
          gioiTinh: nv.gioiTinh ?? 0,
          email: nv.email || "",
          sdt: nv.sdt || "",
          ngaySinh: nv.ngaySinh || "",
        })
        if (nv.avatar) {
          setPreviewImage(nv.avatar);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi lấy dữ liệu nhân viên:", err);
      });
  }, [id])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
        setData((prev) => ({
          ...prev,
          avatar: reader.result,
        }));
      };
      reader.readAsDataURL(file)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'gioiTinh') {
      setData((prev) => ({
        ...prev,
        [name]: parseInt(value, 10),
      }));
    } else {
      setData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  const handleSubmit = () => {
    axios.put(`http://localhost:8080/shuttle/nhan-vien/update/${id}`, data)
      .then(() => {
        alert("Cập nhật thành công")
        navigate('/admin/tai-khoan/nhan-vien')
      })
      .catch((err) => {
        console.error("Lỗi khi cập nhật nhân viên:", err)
        alert("Cập nhật thất bại");
      })
  }

  return (
    <div>
      <Paper elevation={3} style={{ padding: "16px" }}>
        <div className="flex">
          <div className="w-1/4 pr-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-5">
              Thông tin nhân viên
            </h2>
            <hr />
            <div className="flex justify-center items-center mt-4">
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                id="avatar-upload"
                onChange={handleImageChange}
              />

              <label htmlFor="avatar-upload">
                <Avatar
                  src={previewImage}
                  sx={{ width: 100, height: 100, cursor: "pointer", mb: 2 }}
                />
              </label>
            </div>
            <div className="col-span-2 mt-4">
              <TextField
                label="Họ tên"
                variant="filled"
                fullWidth
                size="small"
                name="hoTen"
                value={data.hoTen}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-3/4">
            {/* <h2 className="text-xl font-semibold text-gray-800 mb-5 text-left">
              Thông tin chi tiết
            </h2> */}
            <hr className="mt-5" />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <TextField
                  label="CCCD"
                  size="small"
                  fullWidth
                  variant="filled"
                  name="cccd"
                  value={data.cccd}
                  onChange={handleChange}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: 50,
                }}
              >
                <FormControl>
                  <FormLabel style={{ textAlign: "left" }}>Giới tính</FormLabel>
                  <RadioGroup row name="gioiTinh" value={data.gioiTinh}
                    onChange={handleChange}>
                    <FormControlLabel
                      value={0}
                      control={<Radio size="small" />}
                      label="Nam"
                    />
                    <FormControlLabel
                      value={1}
                      control={<Radio size="small" />}
                      label="Nữ"
                    />
                  </RadioGroup>
                </FormControl>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <TextField
                  label="Email"
                  variant="filled"
                  size="small"
                  fullWidth
                  name="email"
                  value={data.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <TextField
                  label="Số điện thoại"
                  variant="filled"
                  size="small"
                  fullWidth
                  name="sdt"
                  value={data.sdt}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-5">
              <div>
                <TextField
                  label="Ngày sinh"
                  type="date"
                  variant="filled"
                  fullWidth
                  size="small"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  name="ngaySinh"
                  value={data.ngaySinh}
                  onChange={handleChange}
                />
              </div>
              {/* <div>
                <TextField
                  label="Địa chỉ"
                  variant="filled"
                  fullWidth
                  size="small"
                  name="diaChi"
                  value={data.diaChi}
                  onChange={handleChange}
                />
              </div> */}
            </div>
          </div>
        </div>
        <Box mt={4} display="flex" justifyContent="flex-end">
          <Button variant="contained" onClick={handleSubmit}>Cập nhật</Button>
        </Box>
      </Paper>
    </div>
  );
}

export default EditStaff;