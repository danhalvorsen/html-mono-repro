$body = @{
  rectangles = @(
    @{
      x = 10
      y = 20
      width = 100
      height = 40
    }
  )
} | ConvertTo-Json -Depth 5 -Compress

$response = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/api/commands/save" `
  -ContentType "application/json" `
  -Body $body

$response | ConvertTo-Json -Depth 10
