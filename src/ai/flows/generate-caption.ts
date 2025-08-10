
'use server';

/**
 * @fileOverview Generates multiple captions for a social media post based on a user-provided description and mood.
 *
 * - generateCaptions - A function that generates captions.
 * - GenerateCaptionsInput - The input type for the generateCaptions function.
 * - GenerateCaptionsOutput - The return type for the generateCaptionsOutput function.
 */

import {ai} from '@/ai/genkit';
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
  captions: z
    .array(z.string())
    .describe('An array of 3 generated captions for the social media post.'),
});
export type GenerateCaptionsOutput = z.infer<typeof GenerateCaptionsOutputSchema>;

export async function generateCaptions(input: GenerateCaptionsInput): Promise<GenerateCaptionsOutput> {
  return generateCaptionsFlow(input);
}

const generateCaptionsPrompt = ai.definePrompt({
  name: 'generateCaptionsPrompt',
  input: {schema: GenerateCaptionsInputSchema},
  output: {schema: GenerateCaptionsOutputSchema},
  prompt: `You are an expert social media content creator and image analyst specializing in viral captions for Gen Z audiences.

  STEP 1: ANALYZE THE IMAGE
  Look at this image URL and analyze its visual content: {{{imageUrl}}}
  
  IMPORTANT: You MUST actually view and analyze the image at this URL. Do not generate generic captions.
  
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
    // Log the input to ensure image URL is being passed correctly
    console.log('🔍 Caption Generation Input:', {
      mood: input.mood,
      imageUrl: input.imageUrl ? `${input.imageUrl.substring(0, 50)}...` : 'NO IMAGE URL',
      description: input.description || 'No description provided',
      userId: input.userId || 'Anonymous',
      ipAddress: input.ipAddress || 'Unknown'
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
      
      console.log(`🚫 Rate limit exceeded for ${rateLimitKey}`);
      
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

    // First, generate the captions with the AI
    console.log('🤖 Sending request to AI with image for analysis...');
    const {output} = await generateCaptionsPrompt(input);
    
    console.log('✨ AI Generated Captions:', output?.captions || 'No captions generated');

    if (output && output.captions) {
        try {
            await dbConnect();
            const client = await clientPromise;
            const db = client.db();
            const postsCollection = db.collection('posts');
            
            console.log('Attempting to save single post with multiple captions to database...');
            
            // Create a single document with all captions
            const postToInsert = {
              captions: output.captions, // Store all captions in array
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
            console.log(`📊 Saved ${output.captions.length} captions in single document`);
        } catch (error) {
            console.error('CRITICAL: Failed to save caption set to database', error);
            // Re-throw the error to be caught by the client-side fetch.
            // This ensures the user is notified of the failure.
            throw new Error('Failed to save captions to the database.');
        }
    }
    
    return output!;
  }
);
