const fetch = require('node-fetch');

async function testDelete() {
  try {
    console.log('Testing DELETE /api/stores/1...');

    const response = await fetch('http://localhost:3000/api/stores/1', {
      method: 'DELETE',
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDelete();
