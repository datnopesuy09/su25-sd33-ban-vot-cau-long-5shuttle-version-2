# Fix UserType Database Issue

## Vấn đề

Database column `UserType` là `INT` nhưng code expect `VARCHAR`.

## Giải pháp đã thực hiện

### Thay đổi Backend để sử dụng Integer

- ✅ `User.java`: `String userType` → `Integer userType`
- ✅ `UserService.java`: Dùng `2` thay vì `"USER"`
- ✅ `AdminUserController.java`: Set default `userType = 2`
- ✅ `UserRepository.java`: Parameter type `String` → `Integer`

### Thay đổi Frontend để gửi Integer

- ✅ `CustomerModal.jsx`: `userType: 'USER'` → `userType: 2`

### UserType Mapping

```
0 = ADMIN
1 = STAFF
2 = USER (khách hàng)
```

## Files đã sửa:

1. `da_be/src/main/java/com/example/da_be/entity/User.java`
2. `da_be/src/main/java/com/example/da_be/service/UserService.java`
3. `da_be/src/main/java/com/example/da_be/controller/AdminUserController.java`
4. `da_be/src/main/java/com/example/da_be/repository/UserRepository.java`
5. `da_fe/src/pages/admin/Sale/CustomerModal.jsx`

## Alternative: SQL Migration (nếu muốn dùng VARCHAR)

Chạy file: `sql/fix_usertype_column.sql` để đổi column type từ INT → VARCHAR(255)

## Test lại

1. Build backend: `mvnw.cmd clean compile`
2. Run backend: `mvnw.cmd spring-boot:run`
3. Test thêm khách hàng mới trên frontend

**Lỗi 409 (Conflict) sẽ được fix sau khi backend restart với code mới!** 🚀
