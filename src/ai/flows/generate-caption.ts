
'use server';

/**
 * @fileOverview Generates multiple captions for a social media post based on a user-provided description and mood.
 *
 * - generateCaptions - A function that generates captions.
 * - GenerateCaptionsInput - The input type for the generateCaptions function.
 * - GenerateCaptionsOutput - The return type for the generateCaptionsOutput function.
 */

import {ai, isAIConfigured} from '@/ai/genkit';
import {z} from 'genkit';
import dbConnect from '@/lib/db';
import { Types } from 'mongoose';
import { clientPromise } from '@/lib/db';
import { checkRateLimit, generateRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit';

const GenerateCaptionsInputSchema = z.object({
  mood: z.string().describe('The selected mood for the caption.'),
  description: z
    .string()
    .optional()
    .describe(
      'A description of the photo or video for which to generate captions.'
    ),
  imageUrl: z.string().describe('The URL of the uploaded image (required for analysis).'),
  userId: z.string().optional().describe("The ID of the user generating the captions."),
  ipAddress: z.string().optional().describe("The IP address of the user (for rate limiting)."),
});

export type GenerateCaptionsInput = z.infer<typeof GenerateCaptionsInputSchema>;

const GenerateCaptionsOutputSchema = z.object({
  captions: z.array(z.string()).describe('An array of three unique, engaging captions.'),
});

export type GenerateCaptionsOutput = z.infer<typeof GenerateCaptionsOutputSchema>;

export async function generateCaptions(input: GenerateCaptionsInput): Promise<GenerateCaptionsOutput> {
  // Check if AI is properly configured
  if (!isAIConfigured()) {
    throw new Error('AI service is not properly configured. Please check your environment variables.');
  }
  
  return generateCaptionsFlow(input);
}

const generateCaptionsPrompt = ai.definePrompt({
  name: 'generateCaptionsPrompt',
  input: {schema: GenerateCaptionsInputSchema},
  output: {schema: GenerateCaptionsOutputSchema},
  prompt: `You are an expert social media content creator and image analyst specializing in viral captions for Gen Z audiences.

  STEP 1: ANALYZE THE IMAGE
  You have been provided with an image. Analyze its visual content carefully.
  
  IMPORTANT: You MUST analyze the actual image content you see. Do not generate generic captions.
  
  Describe what you actually see:
  - What is the main subject? (person, animal, object, landscape, etc.)
  - What are they doing or what's happening?
  - What's the setting/location/background?
  - What colors dominate the image?
  - What's the lighting like? (bright, dark, golden hour, etc.)
  - What's the composition and style?
  - What emotions or mood does the image convey?
  - Are there any text, brands, or notable details?
  - What's the overall aesthetic and vibe?

  STEP 2: MATCH THE MOOD
  Target mood: {{{mood}}}
  
  {{#if description}}
  Additional context provided: {{{description}}}
  {{/if}}

  STEP 3: CREATE CAPTIONS
  Generate exactly 3 unique, viral-worthy captions that:
  
  ✅ MUST directly reference what you see in the image (colors, objects, people, setting, etc.)
  ✅ MUST match the specified mood/tone perfectly
  ✅ MUST be engaging and shareable for TikTok, Instagram, and Snapchat
  ✅ MUST include relevant emojis (2-4 per caption)
  ✅ MUST include trending hashtags (3-5 per caption)
  ✅ MUST be concise (under 150 characters each)
  ✅ MUST feel authentic and relatable to Gen Z
  
  Each caption should have a different approach:
  - Caption 1: Direct and descriptive about what's in the image
  - Caption 2: Emotional/relatable angle based on the image content
  - Caption 3: Trendy/playful with popular phrases/slang
  
  CRITICAL REQUIREMENTS:
  - Your captions MUST prove you analyzed the image by mentioning specific visual elements
  - Reference actual colors, objects, people, actions, or settings you see
  - DO NOT use generic captions that could apply to any image
  - Each caption should feel like it was written by someone who actually saw this specific image
  
  EXAMPLES of what to reference:
  - "That golden sunset hitting different 🌅" (if you see a sunset)
  - "Coffee shop vibes with that cozy lighting ☕" (if you see a coffee shop)
  - "This blue dress is everything 💙" (if you see someone in a blue dress)
  - "Beach waves and good vibes 🌊" (if you see a beach scene)
  
  Return exactly 3 captions in an array format.
  `,
});

const generateCaptionsFlow = ai.defineFlow(
  {
    name: 'generateCaptionsFlow',
    inputSchema: GenerateCaptionsInputSchema,
    outputSchema: GenerateCaptionsOutputSchema,
  },
  async input => {
    // Sanitized logging - don't expose full URLs or sensitive data
    console.log('🔍 Caption Generation Input:', {
      mood: input.mood,
      imageUrl: input.imageUrl ? 'Image uploaded successfully' : 'NO IMAGE URL',
      description: input.description || 'No description provided',
      userId: input.userId ? 'Authenticated user' : 'Anonymous user',
      ipAddress: 'IP logged for rate limiting'
    });

    // Validate that we have an image URL
    if (!input.imageUrl) {
      throw new Error('Image URL is required for caption generation');
    }

    // 🚦 RATE LIMITING CHECK
    const isAuthenticated = !!input.userId;
    const rateLimitConfig = isAuthenticated ? RATE_LIMITS.AUTHENTICATED : RATE_LIMITS.ANONYMOUS;
    const rateLimitKey = generateRateLimitKey(input.userId, input.ipAddress);
    
    console.log(`🚦 Checking rate limit for ${isAuthenticated ? 'authenticated' : 'anonymous'} user...`);
    
    const rateLimitResult = await checkRateLimit(
      rateLimitKey,
      rateLimitConfig.MAX_GENERATIONS,
      rateLimitConfig.WINDOW_HOURS
    );

    if (!rateLimitResult.allowed) {
      const hoursRemaining = Math.ceil((rateLimitResult.resetTime - Date.now()) / (60 * 60 * 1000));
      const userType = isAuthenticated ? 'registered users' : 'anonymous users';
      const maxAllowed = rateLimitConfig.MAX_GENERATIONS;
      
      console.log(`🚫 Rate limit exceeded for user type: ${isAuthenticated ? 'authenticated' : 'anonymous'}`);
      
        const daysRemaining = Math.ceil(hoursRemaining / 24);
        console.log(`🔍 Debug: hoursRemaining=${hoursRemaining}, daysRemaining=${daysRemaining}`);
        // Always show "next month" for monthly quotas to avoid confusion
        const resetMessage = "next month";
        
        if (isAuthenticated) {
          throw new Error(
            `You've reached your monthly limit of ${maxAllowed} images (${maxAllowed * 3} captions). ` +
            `Your quota will reset ${resetMessage}. Each image generates 3 unique captions!`
          );
        } else {
          throw new Error(
            `You've used all ${maxAllowed} free images this month! That's ${maxAllowed * 3} captions total. ` +
            `Sign up for a free account to get ${RATE_LIMITS.AUTHENTICATED.MAX_GENERATIONS} monthly images (${RATE_LIMITS.AUTHENTICATED.MAX_GENERATIONS * 3} captions). ` +
            `Your free quota resets ${resetMessage}.`
          );
        }
    }

    console.log(`✅ Rate limit check passed. Remaining: ${rateLimitResult.remaining}/${rateLimitConfig.MAX_GENERATIONS}`);

    // 🤖 CRITICAL FIX: Use Genkit's proper image analysis method
    console.log('🤖 Sending image to AI for analysis using Genkit...');
    console.log('🔑 API Key check:', !!process.env.GOOGLE_API_KEY ? 'Present' : 'Missing');
    console.log('🔑 API Key length:', process.env.GOOGLE_API_KEY?.length || 0);
    
    let output: any; // Declare output in outer scope
    
    try {
      // Use Genkit's generate method with proper image handling for Gemini
      const result = await ai.generate([
      {
        text: `You are an expert social media content creator and image analyst specializing in viral captions for Gen Z audiences.

        🎲 RANDOMIZATION SEED: ${Date.now()}_${Math.random().toString(36).substr(2, 9)}
        ⏰ GENERATION TIME: ${new Date().toISOString()}
        
        STEP 1: ANALYZE THE IMAGE
        You have been provided with an image. Analyze its visual content carefully.
        
        IMPORTANT: You MUST analyze the actual image content you see. Do not generate generic captions.
        
        Describe what you actually see:
        - What is the main subject? (person, animal, object, landscape, etc.)
        - What are they doing or what's happening?
        - What's the setting/location/background?
        - What colors dominate the image?
        - What's the lighting like? (bright, dark, golden hour, etc.)
        - What's the composition and style?
        - What emotions or mood does the image convey?
        - Are there any text, brands, or notable details?
        - What's the overall aesthetic and vibe?

        STEP 2: MATCH THE MOOD
        Target mood: ${input.mood}
        
        ${input.description ? `Additional context provided: ${input.description}` : ''}

        🎭 MOOD-SPECIFIC ENHANCEMENTS:
        ${(() => {
          const moodEnhancements: { [key: string]: string } = {
            '😊 Happy / Cheerful': 'Use upbeat language, positive vibes, celebration words, exclamation marks, bright emojis',
            '😍 Romantic / Flirty': 'Use romantic language, heart emojis, sweet phrases, intimate descriptions, love-related hashtags',
            '😎 Cool / Confident': 'Use confident language, power words, bold statements, strong emojis, attitude',
            '😜 Fun / Playful': 'Use playful language, humor, puns, fun emojis, casual tone, relatable jokes',
            '🤔 Thoughtful / Deep': 'Use reflective language, philosophical phrases, meaningful hashtags, introspective tone',
            '😌 Calm / Peaceful': 'Use peaceful language, zen vibes, calming emojis, soothing descriptions, mindfulness hashtags',
            '😢 Sad / Emotional': 'Use emotional language, vulnerability, relatable feelings, supportive hashtags, comfort words',
            '😏 Sassy / Savage': 'Use sassy language, attitude, bold statements, fire emojis, confident hashtags',
            '😲 Surprised / Excited': 'Use excited language, exclamation marks, surprise words, energetic emojis, hype hashtags',
            '🌅 Aesthetic / Artsy': 'Use artistic language, visual descriptions, aesthetic hashtags, creative phrases, beauty focus',
            '👔 Formal / Professional': 'Use professional language, business tone, formal hashtags, polished descriptions',
            '📈 Business / Corporate': 'Use business language, success focus, professional hashtags, achievement words',
            '📝 Informative / Educational': 'Use educational language, fact-based descriptions, learning hashtags, informative tone',
            '🎩 Elegant / Sophisticated': 'Use elegant language, luxury words, sophisticated hashtags, refined descriptions',
            '🏖 Casual / Chill': 'Use casual language, relaxed tone, chill vibes, comfortable hashtags, laid-back style',
            '🔥 Motivational / Inspirational': 'Use motivational language, inspiring phrases, power words, motivation hashtags',
            '🎉 Celebratory / Festive': 'Use celebratory language, party vibes, festive emojis, celebration hashtags',
            '⚡ Bold / Daring': 'Use bold language, daring phrases, power words, strong hashtags, confident tone',
            '🌍 Travel / Adventure': 'Use adventure language, travel words, exploration hashtags, wanderlust vibes',
            '🍔 Foodie / Culinary': 'Use food language, culinary descriptions, food hashtags, delicious words, appetite appeal',
            '🐾 Pet / Cute': 'Use cute language, adorable descriptions, pet hashtags, sweet phrases, lovable tone',
            '🎵 Musical / Rhythmic': 'Use musical language, rhythm words, music hashtags, beat references, lyrical style'
          };
          
          const selectedMood = Object.keys(moodEnhancements).find(mood => 
            mood.includes(input.mood) || input.mood.includes(mood.split(' ')[0])
          );
          
          return selectedMood ? `\n        ${moodEnhancements[selectedMood]}` : '';
        })()}

        STEP 3: CREATE CAPTIONS WITH MAXIMUM DIVERSITY
        Generate exactly 3 COMPLETELY DIFFERENT captions that feel like they were written by 3 different people:
        
        ✅ MUST directly reference what you see in the image (colors, objects, people, setting, etc.)
        ✅ MUST match the specified mood/tone perfectly
        ✅ MUST be engaging and shareable for TikTok, Instagram, and Snapchat
        ✅ MUST include relevant emojis (2-4 per caption)
        ✅ MUST include trending hashtags (3-5 per caption)
        ✅ MUST be concise (under 150 characters each)
        ✅ MUST feel authentic and relatable to Gen Z
        
        🎯 CAPTION DIVERSITY REQUIREMENTS:
        
        CAPTION 1 - "Direct & Descriptive" Style:
        - Focus on WHAT you see (objects, colors, actions)
        - Use specific details from the image
        - Straightforward, clear description
        - Example style: "That golden sunset hitting different 🌅"
        
        CAPTION 2 - "Emotional & Relatable" Style:
        - Focus on HOW it makes you feel
        - Use emotional language and personal connection
        - Make it about the viewer's experience
        - Example style: "When the light hits just right and everything feels magical ✨"
        
        CAPTION 3 - "Trendy & Creative" Style:
        - Use current slang, memes, or viral phrases
        - Be playful and unexpected
        - Reference popular culture or trends
        - Example style: "This is giving main character energy 💅✨"
        
        🚫 ANTI-DUPLICATION RULES:
        - NO similar sentence structures between captions
        - NO repeated phrases or word patterns
        - NO similar emoji combinations
        - NO similar hashtag themes
        - Each caption must have a completely different "voice"
        
        🎨 CREATIVE VARIATIONS TO USE:
        - Different sentence lengths (short vs. medium vs. long)
        - Different punctuation styles (minimal vs. expressive)
        - Different emoji placement (beginning vs. middle vs. end)
        - Different hashtag strategies (trending vs. niche vs. aesthetic)
        - Different tone shifts (confident vs. vulnerable vs. playful)
        
        CRITICAL REQUIREMENTS:
        - Your captions MUST prove you analyzed the image by mentioning specific visual elements
        - Reference actual colors, objects, people, actions, or settings you see
        - DO NOT use generic captions that could apply to any image
        - Each caption should feel like it was written by someone who actually saw this specific image
        - MAXIMIZE variety in writing style, tone, and approach
        
        Return exactly 3 captions in an array format.`
      },
      {
        media: { url: input.imageUrl }
      }
      ]);
      
      output = result.output; // Assign to outer scope variable
      
      console.log('🔍 Full AI Result:', result);
      console.log('🔍 Output object:', output);
      console.log('✨ AI Generated Captions:', output?.text ? 'Captions generated' : 'No captions generated');
    } catch (error: any) {
      console.error('❌ AI Generation Error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw new Error(`AI generation failed: ${error.message}`);
    }

    // Parse the AI response to extract captions
    console.log('📝 Raw AI Output:', output);
    console.log('📝 AI Output Type:', typeof output);
    console.log('📝 Is Array?', Array.isArray(output));
    
    let captions: string[] = [];
    
    try {
      // Check if output is already an array of captions
      if (Array.isArray(output)) {
        captions = output;
        console.log('🎯 Direct array output detected, using as captions');
      } else if (output?.text) {
        // Try to parse the text response
        try {
          // First, try to parse as JSON
          const parsed = JSON.parse(output.text);
          if (Array.isArray(parsed)) {
            captions = parsed;
            console.log('🎯 JSON parsed successfully, found array of captions');
          } else if (parsed.captions && Array.isArray(parsed.captions)) {
            captions = parsed.captions;
            console.log('🎯 Found captions in parsed JSON object');
          } else {
            // Fallback to line-by-line parsing
            const lines = output.text.split('\n').filter((line: string) => line.trim());
            captions = lines.slice(0, 3);
            console.log('🎯 Using line-by-line parsing as fallback');
          }
        } catch (jsonError) {
          console.log('📝 JSON parsing failed, using line-by-line parsing');
          // If JSON parsing fails, split by lines
          const lines = output.text.split('\n').filter((line: string) => line.trim());
          captions = lines.slice(0, 3);
        }
      } else if (output?.content) {
        // Handle Genkit's content format
        if (Array.isArray(output.content)) {
          captions = output.content.map((item: any) => item.text || item).slice(0, 3);
        } else if (output.content.text) {
          const lines = output.content.text.split('\n').filter((line: string) => line.trim());
          captions = lines.slice(0, 3);
        }
      } else {
        console.warn('⚠️ Unexpected output format, attempting to extract captions');
        // Last resort: try to extract any text content
        const outputString = JSON.stringify(output);
        const lines = outputString.split('\n').filter((line: string) => line.trim());
        captions = lines.slice(0, 3);
      }
    } catch (parseError) {
      console.error('❌ Error parsing AI output:', parseError);
      // Provide fallback captions
      captions = [
        "Unable to generate captions at this time. Please try again.",
        "Caption generation failed. Please upload a different image.",
        "Technical issue occurred. Please refresh and try again."
      ];
    }

    // Ensure we have exactly 3 captions
    if (captions.length < 3) {
      // Generate additional captions if needed
      const additionalPrompt = `Generate ${3 - captions.length} more captions to complete the set. Make sure they are unique and follow the same style as the previous ones.`;
      const additionalResponse = await ai.generate([
        { text: additionalPrompt },
        { media: { url: input.imageUrl } }
      ]);
      
      if (additionalResponse.output?.text) {
        const additionalLines = additionalResponse.output.text.split('\n').filter((line: string) => line.trim());
        captions = [...captions, ...additionalLines].slice(0, 3);
      }
    }

    // 🎯 ENHANCED DIVERSITY CHECK AND REGENERATION
    // Check if captions are too similar and regenerate if needed
    const checkDiversity = (captions: string[]): boolean => {
      if (captions.length < 2) return true;
      
      // Check for similar sentence structures
      const hasSimilarStructure = captions.some((caption, i) => 
        captions.slice(i + 1).some(otherCaption => {
          const words1 = caption.toLowerCase().split(/\s+/);
          const words2 = otherCaption.toLowerCase().split(/\s+/);
          const commonWords = words1.filter(word => words2.includes(word));
          return commonWords.length > 3; // If more than 3 common words, consider similar
        })
      );
      
      // Check for similar emoji patterns
      const emojiPatterns = captions.map(caption => 
        caption.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu)?.join('') || ''
      );
      const hasSimilarEmojis = emojiPatterns.some((pattern, i) => 
        emojiPatterns.slice(i + 1).some(otherPattern => 
          pattern === otherPattern || pattern.includes(otherPattern) || otherPattern.includes(pattern)
        )
      );
      
      return !hasSimilarStructure && !hasSimilarEmojis;
    };

    // If captions lack diversity, regenerate with enhanced prompt
    if (!checkDiversity(captions)) {
      console.log('🔄 Captions lack diversity, regenerating with enhanced prompt...');
      
      const diversityPrompt = `The previous captions were too similar. Generate 3 COMPLETELY DIFFERENT captions for this image:

        IMAGE ANALYSIS: ${input.mood} mood, ${input.description ? `Context: ${input.description}` : 'No additional context'}
        
        DIVERSITY REQUIREMENTS:
        - Caption 1: Use a QUESTION format (e.g., "Who else loves this vibe? ✨")
        - Caption 2: Use a STATEMENT format (e.g., "This is everything I needed today 💫")
        - Caption 3: Use a COMMAND format (e.g., "Stop scrolling and appreciate this moment 🛑")
        
        - Different emoji sets for each caption
        - Different hashtag themes (trending, aesthetic, personal)
        - Different sentence lengths and structures
        - Reference specific visual elements from the image
        
        Make each caption feel like it was written by a completely different person!`;
      
      try {
        const diversityResponse = await ai.generate([
          { text: diversityPrompt },
          { media: { url: input.imageUrl } }
        ]);
        
        if (diversityResponse.output?.text) {
          const newCaptions = diversityResponse.output.text.split('\n').filter((line: string) => line.trim());
          if (newCaptions.length >= 3) {
            captions = newCaptions.slice(0, 3);
            console.log('✅ Regenerated diverse captions successfully');
          }
        }
      } catch (error) {
        console.log('⚠️ Diversity regeneration failed, using original captions');
      }
    }

    // Ensure we have exactly 3 captions, pad if necessary
    while (captions.length < 3) {
      captions.push(`Caption ${captions.length + 1} - Please try again with a different image.`);
    }

    // Limit to exactly 3 captions
    captions = captions.slice(0, 3);

    // Validate that we have actual caption content
    const validCaptions = captions.filter(caption => 
      caption && 
      caption.trim().length > 0 && 
      !caption.includes('Please try again') &&
      !caption.includes('Unable to generate') &&
      !caption.includes('Caption generation failed') &&
      !caption.includes('Technical issue occurred')
    );

    if (validCaptions.length === 0) {
      console.warn('⚠️ No valid captions generated, providing fallback captions');
      captions = [
        "Your image looks amazing! ✨",
        "This is giving main character energy 💫",
        "Love the vibes in this shot! 🌟"
      ];
    }

    console.log(`✅ Generated ${captions.length} captions successfully`);

    if (captions.length > 0) {
        try {
            await dbConnect();
            const client = await clientPromise;
            const db = client.db();
            const postsCollection = db.collection('posts');
            
            console.log('💾 Saving caption set to database...');
            
            // Create a single document with all captions
            const postToInsert = {
              captions: captions, // Store all captions in array
              image: input.imageUrl,
              mood: input.mood,
              description: input.description || null,
              createdAt: new Date(),
              ...(input.userId && { user: new Types.ObjectId(input.userId) }),
            };
            
            const result = await postsCollection.insertOne(postToInsert);

            if (!result.insertedId) {
                 throw new Error('Failed to insert caption set to database.');
            }

            console.log(`✅ Caption set saved successfully with ID: ${result.insertedId}`);
            console.log(`📊 Saved ${captions.length} captions in single document`);
        } catch (error) {
            console.error('CRITICAL: Failed to save caption set to database', error);
            // Re-throw the error to be caught by the client-side fetch.
            // This ensures the user is notified of the failure.
            throw new Error('Failed to save captions to the database.');
        }
    }
    
    return { captions };
  }
);
