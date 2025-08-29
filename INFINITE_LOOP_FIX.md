# 🔧 Fix Infinite Loop Bug - Bulk Order Detection System

## 🚨 Vấn đề gặp phải

**Lỗi**: "Maximum update depth exceeded. This can happen when a component calls setState inside useEffect"

**Nguyên nhân**: Vòng lặp vô tận (infinite loop) xảy ra khi:

1. `useEffect` dependency array chứa objects/arrays được tạo mới mỗi lần render
2. `setState` trong `useEffect` trigger re-render
3. Re-render tạo ra objects/arrays mới → `useEffect` chạy lại → vòng lặp vô tận

## 🛠️ Các thay đổi đã thực hiện

### 1. **useBulkOrderDetection.js** - Hook chính

#### ❌ Trước khi sửa:

```javascript
useEffect(() => {
  const metrics = calculateOrderMetrics();
  const bulkCheck = checkBulkConditions(metrics);
  // ... setState calls
}, [cartItems, totalValue]); // cartItems là array mới mỗi lần render!
```

#### ✅ Sau khi sửa:

```javascript
// Sử dụng useMemo để cache kết quả calculation
const orderMetrics = useMemo(() => {
  // calculation logic
}, [cartItems, totalValue]);

const bulkCheck = useMemo(() => {
  // bulk condition check logic
}, [orderMetrics]);

useEffect(() => {
  // Chỉ update state khi cần thiết
}, [bulkCheck.isBulk, bulkCheck.reasons, orderMetrics, potentialDiscount]);
```

**Cải tiến:**

- ✅ Sử dụng `useMemo` để cache expensive calculations
- ✅ Dependencies cụ thể thay vì objects/arrays tổng quát
- ✅ Tách logic calculation ra khỏi useEffect

### 2. **BulkOrderDetector.jsx** - Component Modal

#### ❌ Trước khi sửa:

```javascript
useEffect(() => {
  if (shouldShowBulkWarning() && cartItems.length > 0) {
    setShowBulkModal(true);
  }
}, [totalQuantity, totalValue, cartItems]); // cartItems trigger re-render
```

#### ✅ Sau khi sửa:

```javascript
const bulkConditions = useMemo(() => {
    // calculation with cartItems
}, [cartItems, totalQuantity, totalValue, bulkThresholds]);

const shouldShowWarning = useMemo(() => {
    return bulkConditions.highQuantity || /* other conditions */;
}, [bulkConditions]);

useEffect(() => {
    if (shouldShowWarning && cartItems.length > 0 && !showBulkModal) {
        setShowBulkModal(true);
    }
}, [shouldShowWarning, cartItems.length, showBulkModal]);
```

**Cải tiến:**

- ✅ Cache condition calculations với `useMemo`
- ✅ Thêm guard condition `!showBulkModal` để tránh re-trigger
- ✅ Dependencies cụ thể và primitive values

### 3. **Cart.jsx** - Trang giỏ hàng

#### ❌ Trước khi sửa:

```javascript
// Tính toán mỗi lần render
const selectedCartItems = carts.filter((item) =>
  selectedItems.includes(item.id)
);
```

#### ✅ Sau khi sửa:

```javascript
// Cache với useMemo
const selectedCartItems = useMemo(() => {
  return carts.filter((item) => selectedItems.includes(item.id));
}, [carts, selectedItems]);
```

**Cải tiến:**

- ✅ Cache filtered array để tránh tạo array mới mỗi render
- ✅ Import `useMemo` từ React

## 🎯 Best Practices áp dụng

### 1. **Dependency Management**

```javascript
// ❌ Tránh objects/arrays trong dependency
useEffect(() => {}, [someObject, someArray]);

// ✅ Sử dụng primitive values hoặc cached values
useEffect(() => {}, [someObject.id, someArray.length]);
```

### 2. **Expensive Calculations**

```javascript
// ❌ Tính toán mỗi render
const expensiveValue = expensiveCalculation(data);

// ✅ Cache với useMemo
const expensiveValue = useMemo(() => expensiveCalculation(data), [data]);
```

### 3. **Conditional State Updates**

```javascript
// ❌ Update state không điều kiện
useEffect(() => {
  setState(newValue);
}, [dependency]);

// ✅ Update có điều kiện
useEffect(() => {
  if (condition && !currentState) {
    setState(newValue);
  }
}, [condition, currentState]);
```

## 🔍 Cách detect infinite loop

### Trong Development:

- React sẽ throw error "Maximum update depth exceeded"
- Console log liên tục
- Browser tab treo/chậm

### Debug tools:

```javascript
// Thêm logging để track re-renders
useEffect(() => {
  console.log("Effect running with deps:", dependency);
}, [dependency]);

// Sử dụng React DevTools Profiler
// Kiểm tra component re-render frequency
```

## 🎉 Kết quả sau khi fix

- ✅ Không còn infinite loop
- ✅ Performance tốt hơn (ít re-render)
- ✅ Bulk order detection hoạt động ổn định
- ✅ UI/UX mượt mà

## 📝 Checklist để tránh infinite loop trong tương lai

- [ ] Kiểm tra dependencies trong `useEffect`
- [ ] Sử dụng `useMemo` cho expensive calculations
- [ ] Sử dụng `useCallback` cho functions
- [ ] Tránh tạo objects/arrays mới trong render
- [ ] Thêm guard conditions cho state updates
- [ ] Test thoroughly với React Strict Mode

---

**🔗 Related Files:**

- `src/hooks/useBulkOrderDetection.js`
- `src/components/BulkOrderDetector.jsx`
- `src/pages/users/Cart/Cart.jsx`
- `src/pages/users/CheckOut/CheckOut.jsx`

**📚 References:**

- [React Hooks Documentation](https://reactjs.org/docs/hooks-reference.html)
- [useMemo Performance](https://reactjs.org/docs/hooks-reference.html#usememo)
- [useEffect Dependencies](https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects)
