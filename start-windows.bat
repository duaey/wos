@echo off
chcp 65001 >nul
echo ============================================
echo   WOS Takip - Backend (web + API)
echo ============================================
echo.

if not exist ".env" (
  echo [HATA] .env dosyasi yok!
  echo .env.example'i kopyalayip .env yapin ve doldurun.
  echo.
  pause
  exit /b 1
)

echo [1/4] Bagimliliklar kuruluyor...
call npm install
if errorlevel 1 goto err

echo [2/4] Prisma istemcisi olusturuluyor...
call npx prisma generate
if errorlevel 1 goto err

echo [3/4] Veritabani semasi uygulaniyor...
call npx prisma db push
if errorlevel 1 goto err

echo [4/4] Sunucu baslatiliyor... (http://localhost:3000)
echo Kapatmak icin bu pencereyi kapatin.
call npm run dev
goto end

:err
echo.
echo [HATA] Bir adim basarisiz oldu. Yukaridaki mesaji kontrol edin.
:end
pause
