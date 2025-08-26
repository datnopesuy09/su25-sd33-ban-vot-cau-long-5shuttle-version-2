# PowerShell script to test Kho Hang APIs
Write-Host "🧪 Testing Kho Hang APIs" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

$BaseUrl = "http://localhost:8080"

# Test 1: Kiểm tra tồn kho
Write-Host "`n📋 Test 1: Kiểm tra tồn kho" -ForegroundColor Yellow
$uri1 = "$BaseUrl/api/kho-hang/kiem-tra-ton-kho/1?soLuongYeuCau=5"
Write-Host "GET $uri1" -ForegroundColor Gray
try {
    $response1 = Invoke-RestMethod -Uri $uri1 -Method Get -ContentType "application/json"
    $response1 | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Hoàn kho thủ công
Write-Host "`n📋 Test 2: Hoàn kho thủ công" -ForegroundColor Yellow
$uri2 = "$BaseUrl/api/kho-hang/hoan-kho/1"
Write-Host "POST $uri2" -ForegroundColor Gray
try {
    $response2 = Invoke-RestMethod -Uri $uri2 -Method Post -ContentType "application/json"
    Write-Host $response2 -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Force hoàn kho
Write-Host "`n📋 Test 3: Force hoàn kho" -ForegroundColor Yellow
$uri3 = "$BaseUrl/api/kho-hang/force-hoan-kho/1"
$body3 = @{
    reason = "Test force restore stock từ PowerShell"
} | ConvertTo-Json
Write-Host "POST $uri3" -ForegroundColor Gray
try {
    $response3 = Invoke-RestMethod -Uri $uri3 -Method Post -ContentType "application/json" -Body $body3
    Write-Host $response3 -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Lấy danh sách hóa đơn
Write-Host "`n📋 Test 4: Danh sách hóa đơn" -ForegroundColor Yellow
$uri4 = "$BaseUrl/api/hoa-don"
Write-Host "GET $uri4" -ForegroundColor Gray
try {
    $response4 = Invoke-RestMethod -Uri $uri4 -Method Get -ContentType "application/json"
    Write-Host "Tổng số hóa đơn: $($response4.Count)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Testing completed!" -ForegroundColor Green
Write-Host "`n📝 Hướng dẫn:" -ForegroundColor Cyan
Write-Host "1. Đảm bảo server đang chạy trên port 8080" -ForegroundColor White
Write-Host "2. Kiểm tra database có dữ liệu hóa đơn" -ForegroundColor White
Write-Host "3. Test với các ID hóa đơn thực tế" -ForegroundColor White
