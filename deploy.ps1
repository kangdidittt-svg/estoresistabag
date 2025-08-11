# PowerShell Deployment script for Vercel
Write-Host "🚀 Starting deployment to Vercel..." -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

# Build the project locally to check for errors
Write-Host "🔨 Building project locally..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Local build successful!" -ForegroundColor Green
    
    # Deploy to Vercel
    Write-Host "🌐 Deploying to Vercel..." -ForegroundColor Blue
    vercel --prod
    
    Write-Host "🎉 Deployment completed!" -ForegroundColor Green
} else {
    Write-Host "❌ Local build failed. Please fix errors before deploying." -ForegroundColor Red
    exit 1
}