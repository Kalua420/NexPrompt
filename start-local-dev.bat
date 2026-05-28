@echo off
echo ========================================
echo NexPrompt Local Development with Nginx
echo ========================================
echo.

echo Checking if Nginx is installed...
if not exist "C:\nginx\nginx.exe" (
    echo ERROR: Nginx not found at C:\nginx\
    echo.
    echo Please install Nginx:
    echo 1. Download from http://nginx.org/en/download.html
    echo 2. Extract to C:\nginx
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo Starting Nginx...
cd C:\nginx
start nginx.exe
echo Nginx started!
echo.

echo ========================================
echo Services Started:
echo ========================================
echo - Nginx (port 80)
echo.
echo Now start these in separate terminals:
echo.
echo Terminal 1: cd client ^&^& npm run dev
echo Terminal 2: cd client ^&^& npm run dev:admin
echo Terminal 3: cd server ^&^& npm run dev
echo.
echo ========================================
echo Access URLs:
echo ========================================
echo User app:  http://nexprompt.local
echo Admin app: http://admin.nexprompt.local
echo.
echo To stop Nginx: cd C:\nginx ^&^& nginx -s stop
echo.
pause
