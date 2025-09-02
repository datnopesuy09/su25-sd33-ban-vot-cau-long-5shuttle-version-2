@echo off
echo ================================
echo SYSTEM VALIDATION SCRIPT
echo ================================
echo.

echo [1/4] Checking Backend Java files...
echo.

REM Check if Java files exist and are properly formatted
if exist "da_be\src\main\java\com\example\da_be\entity\SuCoVanChuyen.java" (
    echo ✓ SuCoVanChuyen Entity found
) else (
    echo ✗ SuCoVanChuyen Entity missing
)

if exist "da_be\src\main\java\com\example\da_be\dto\SuCoVanChuyenDTO.java" (
    echo ✓ SuCoVanChuyenDTO found
) else (
    echo ✗ SuCoVanChuyenDTO missing
)

if exist "da_be\src\main\java\com\example\da_be\repository\SuCoVanChuyenRepository.java" (
    echo ✓ SuCoVanChuyenRepository found
) else (
    echo ✗ SuCoVanChuyenRepository missing
)

if exist "da_be\src\main\java\com\example\da_be\service\SuCoVanChuyenService.java" (
    echo ✓ SuCoVanChuyenService found
) else (
    echo ✗ SuCoVanChuyenService missing
)

if exist "da_be\src\main\java\com\example\da_be\service\impl\SuCoVanChuyenServiceImpl.java" (
    echo ✓ SuCoVanChuyenServiceImpl found
) else (
    echo ✗ SuCoVanChuyenServiceImpl missing
)

echo.
echo [2/4] Checking Frontend React components...
echo.

if exist "da_fe\src\components\admin\DeliveryIncidentModal.jsx" (
    echo ✓ DeliveryIncidentModal component found
) else (
    echo ✗ DeliveryIncidentModal component missing
)

if exist "da_fe\src\components\admin\DeliveryIncidentList.jsx" (
    echo ✓ DeliveryIncidentList component found
) else (
    echo ✗ DeliveryIncidentList component missing
)

echo.
echo [3/4] Checking Database schema...
echo.

if exist "sql\su_co_van_chuyen.sql" (
    echo ✓ Database schema file found
) else (
    echo ✗ Database schema file missing
)

echo.
echo [4/4] Checking Integration...
echo.

REM Check if OrderStatus.jsx contains DeliveryIncident imports
findstr /C:"DeliveryIncident" "da_fe\src\pages\admin\Order\OrderStatus.jsx" >nul 2>&1
if %errorlevel%==0 (
    echo ✓ OrderStatus integration found
) else (
    echo ✗ OrderStatus integration missing
)

echo.
echo ================================
echo VALIDATION COMPLETE
echo ================================
echo.
echo Next steps:
echo 1. Run backend: cd da_be ^&^& .\mvnw.cmd spring-boot:run
echo 2. Run frontend: cd da_fe ^&^& npm run dev  
echo 3. Execute SQL: Run sql\su_co_van_chuyen.sql in your database
echo 4. Test APIs using the test_system.md guide
echo.
pause
