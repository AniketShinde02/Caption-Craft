#!/usr/bin/env node

/**
 * Test script to verify AI configuration and environment variables
 * Run with: node scripts/test-ai-config.js
 */

require('dotenv').config();

console.log('🔍 Testing AI Configuration...\n');

// Check environment variables
const envVars = {
  'GOOGLE_API_KEY': process.env.GOOGLE_API_KEY,
  'GEMINI_API_KEY': process.env.GEMINI_API_KEY,
  'GOOGLE_GENAI_API_KEY': process.env.GOOGLE_GENAI_API_KEY,
  'NODE_ENV': process.env.NODE_ENV,
  'MONGODB_URI': process.env.MONGODB_URI ? '✅ Set' : '❌ Missing',
  'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
  'NEXTAUTH_URL': process.env.NEXTAUTH_URL || 'http://localhost:3001'
};

console.log('📋 Environment Variables:');
Object.entries(envVars).forEach(([key, value]) => {
  if (key.includes('API_KEY')) {
    if (value) {
      console.log(`  ${key}: ✅ Set (length: ${value.length})`);
    } else {
      console.log(`  ${key}: ❌ Missing`);
    }
  } else {
    console.log(`  ${key}: ${value}`);
  }
});

// Check which API key is being used
const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

if (googleApiKey) {
  console.log(`\n✅ API Key Found: ${googleApiKey.substring(0, 10)}...${googleApiKey.substring(googleApiKey.length - 4)}`);
  
  // Test basic API key format
  if (googleApiKey.startsWith('AIza')) {
    console.log('✅ API Key format looks correct (starts with AIza)');
  } else {
    console.log('⚠️ API Key format may be incorrect (should start with AIza)');
  }
} else {
  console.log('\n❌ No API key found! Please set one of:');
  console.log('  - GOOGLE_API_KEY');
  console.log('  - GEMINI_API_KEY');
  console.log('  - GOOGLE_GENAI_API_KEY');
  console.log('\nGet your API key from: https://makersuite.google.com/app/apikey');
}

// Check other critical variables
console.log('\n🔐 Critical Configuration:');
if (process.env.MONGODB_URI) {
  console.log('✅ MongoDB URI: Set');
} else {
  console.log('❌ MongoDB URI: Missing - Required for database operations');
}

if (process.env.NEXTAUTH_SECRET) {
  console.log('✅ NextAuth Secret: Set');
} else {
  console.log('❌ NextAuth Secret: Missing - Required for authentication');
}

console.log('\n📝 Next Steps:');
if (!googleApiKey) {
  console.log('1. Get your Google Gemini API key from: https://makersuite.google.com/app/apikey');
  console.log('2. Add it to your .env file as GOOGLE_API_KEY');
  console.log('3. Restart your development server');
} else {
  console.log('1. Your API key is configured correctly');
  console.log('2. Try running: npm run dev');
  console.log('3. Test caption generation with an image');
}

console.log('\n�� Ready to test!');
