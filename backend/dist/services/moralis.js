"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASE_CHAIN_ID = void 0;
exports.initMoralis = initMoralis;
exports.getMoralis = getMoralis;
const moralis_1 = __importDefault(require("moralis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
if (!MORALIS_API_KEY) {
    throw new Error('MORALIS_API_KEY environment variable is required');
}
let isInitialized = false;
async function initMoralis() {
    if (!isInitialized) {
        await moralis_1.default.start({ apiKey: MORALIS_API_KEY });
        isInitialized = true;
        console.log('✅ Moralis SDK initialized');
    }
}
function getMoralis() {
    if (!isInitialized) {
        throw new Error('Moralis not initialized. Call initMoralis() first.');
    }
    return moralis_1.default;
}
// Base chain ID in hex
exports.BASE_CHAIN_ID = '0x2105';
//# sourceMappingURL=moralis.js.map