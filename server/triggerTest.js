fetch('http://localhost:8787/api/forms/membership', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'Test User',
    collegeEmail: 'test@example.com',
    whatsapp: '1234567890'
  })
})
.then(r => r.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
