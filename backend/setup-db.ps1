# Database Setup Script for AbacusLearn
Write-Host "Setting up AbacusLearn database..." -ForegroundColor Green

# Create .env file if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    @"
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=4000
NODE_ENV=development
UPLOAD_DIR="./uploads"
PUBLIC_URL_PREFIX="http://localhost:4000/uploads"
FRONTEND_URL="http://localhost:3000"
"@ | Out-File -FilePath .env -Encoding utf8
    Write-Host ".env file created!" -ForegroundColor Green
} else {
    Write-Host ".env file already exists" -ForegroundColor Yellow
}

# Run migrations
Write-Host "`nRunning database migrations..." -ForegroundColor Yellow
npm run migrate

# Run seed
Write-Host "`nSeeding database..." -ForegroundColor Yellow
npm run seed

Write-Host "`nDatabase setup complete!" -ForegroundColor Green
Write-Host "You can now run 'npm run dev' to start the development servers." -ForegroundColor Cyan

