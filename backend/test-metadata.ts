// Test Moralis getTokenMetadata response structure
import Moralis from 'moralis';

async function testMoralis() {
  try {
    await Moralis.start({ apiKey: 'key' });
    
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
