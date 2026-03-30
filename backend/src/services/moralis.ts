import Moralis from 'moralis';
import dotenv from 'dotenv';

dotenv.config();

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;

if (!MORALIS_API_KEY) {
  throw new Error('MORALIS_API_KEY environment variable is required');
}

let isInitialized = false;

export async function initMoralis(): Promise<void> {
  if (!isInitialized) {
    await Moralis.start({ apiKey: MORALIS_API_KEY });
    isInitialized = true;
    console.log('✅ Moralis SDK initialized');
  }
}

export function getMoralis(): typeof Moralis {
  if (!isInitialized) {
    throw new Error('Moralis not initialized. Call initMoralis() first.');
  }
  return Moralis;
}

// Base chain ID in hex
export const BASE_CHAIN_ID = '0x2105';
