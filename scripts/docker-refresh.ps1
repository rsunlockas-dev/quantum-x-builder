# Docker Refresh – Restart local services

Write-Host "🐳 Restarting Docker services..."
docker compose down
docker compose up -d --build
Write-Host "✅ Docker refreshed."
