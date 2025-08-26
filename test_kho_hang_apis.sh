#!/bin/bash

echo "🧪 Testing Kho Hang APIs"
echo "========================"

BASE_URL="http://localhost:8080"

# Test 1: Kiểm tra tồn kho
echo "📋 Test 1: Kiểm tra tồn kho"
echo "GET ${BASE_URL}/api/kho-hang/kiem-tra-ton-kho/1?soLuongYeuCau=5"
curl -X GET "${BASE_URL}/api/kho-hang/kiem-tra-ton-kho/1?soLuongYeuCau=5" \
  -H "Content-Type: application/json" | jq .
echo ""

# Test 2: Hoàn kho thủ công (chỉ cho đơn hàng đã hủy)
echo "📋 Test 2: Hoàn kho thủ công"
echo "POST ${BASE_URL}/api/kho-hang/hoan-kho/1"
curl -X POST "${BASE_URL}/api/kho-hang/hoan-kho/1" \
  -H "Content-Type: application/json"
echo ""

# Test 3: Force hoàn kho
echo "📋 Test 3: Force hoàn kho"
echo "POST ${BASE_URL}/api/kho-hang/force-hoan-kho/1"
curl -X POST "${BASE_URL}/api/kho-hang/force-hoan-kho/1" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Test force restore stock"}'
echo ""

# Test 4: Lấy danh sách hóa đơn
echo "📋 Test 4: Danh sách hóa đơn"
echo "GET ${BASE_URL}/api/hoa-don"
curl -X GET "${BASE_URL}/api/hoa-don" \
  -H "Content-Type: application/json" | jq 'length'
echo ""

echo "✅ Testing completed!"
