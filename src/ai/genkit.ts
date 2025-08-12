import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Check if Google API key is available
const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

if (!googleApiKey) {
  console.error('❌ GOOGLE_API_KEY, GEMINI_API_KEY, or GOOGLE_GENAI_API_KEY environment variable is missing!');
  console.error('Please set one of these in your .env file:');
  console.error('- GOOGLE_API_KEY');
  console.error('- GEMINI_API_KEY'); 
  console.error('- GOOGLE_GENAI_API_KEY');
  console.error('You can get one from: https://makersuite.google.com/app/apikey');
} else {
  console.log('✅ Google AI API Key found, length:', googleApiKey.length);
  console.log('🔑 API Key type:', googleApiKey === process.env.GOOGLE_API_KEY ? 'GOOGLE_API_KEY' : 
                                   googleApiKey === process.env.GEMINI_API_KEY ? 'GEMINI_API_KEY' : 'GOOGLE_GENAI_API_KEY');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: googleApiKey || 'missing-api-key',
    })
  ],
  model: 'googleai/gemini-2.0-flash-exp',
  enableTracingAndMetrics: process.env.NODE_ENV === 'development',
});

// Export a function to check if AI is properly configured
export function isAIConfigured(): boolean {
  return !!googleApiKey;
}
