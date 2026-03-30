// Test Moralis getTokenMetadata response structure
import Moralis from 'moralis';

async function testMoralis() {
  try {
    await Moralis.start({ apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImE0ZTc5NTI1LWEyY2ItNDgxYy04ZGRmLTg3M2IzZjgwNWZiNyIsIm9yZ0lkIjoiNTA3NDYzIiwidXNlcklkIjoiNTIyMTQ1IiwidHlwZUlkIjoiYTQ3YTkyMGUtY2IzMC00NmU0LWFmMWUtMDYxZTgxN2M5YmNiIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NzQ3NzQ5NDYsImV4cCI6NDkzMDUzNDk0Nn0.FlDyOth0z7MpzOmnQyHwU2XGFD-Si6mVl2RzbHWmrAg' });
    
    const response = await Moralis.EvmApi.token.getTokenMetadata({
      chain: '0x2105',
      addresses: ['0x4200000000000000000000000000000000006'],
    });
    
    console.log('Response structure:');
    console.log(JSON.stringify(response, null, 2));
    
    // Log first token details
    if (response.result && response.result[0]) {
      console.log('First token:', response.result[0]);
      console.log('Token properties:', Object.keys(response.result[0]));
      if (response.result[0].token) {
        console.log('Nested token properties:', Object.keys(response.result[0].token));
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testMoralis();
