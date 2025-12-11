# InfraDealer Admin Panel - Quick Start

Write-Host "🚀 Starting InfraDealer Admin Panel Setup..." -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "admin-panel")) {
    Write-Host "❌ Error: Please run this script from the infradealer-demo directory" -ForegroundColor Red
    exit 1
}

Write-Host "`n📦 Step 1: Installing dependencies..." -ForegroundColor Yellow
Set-Location admin-panel
if (-not (Test-Path "node_modules")) {
    npm install
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host "`n⚙️ Step 2: Checking .env file..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Cyan
    @"
# API Base URL - Change this when deploying to production
VITE_API_URL=http://localhost:5000/api
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env file created" -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

Write-Host "`n👤 Step 3: Creating admin user..." -ForegroundColor Yellow
Set-Location ..\api
node createAdmin.js

Write-Host "`n✅ Setup Complete!" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start backend: cd api && npm run dev" -ForegroundColor White
Write-Host "  2. Start admin panel: cd admin-panel && npm run dev" -ForegroundColor White
Write-Host "  3. Open: http://localhost:3001/login" -ForegroundColor White
Write-Host "  4. Login with phone: 9999999999" -ForegroundColor White
Write-Host "`n🎉 Happy administrating!" -ForegroundColor Green
