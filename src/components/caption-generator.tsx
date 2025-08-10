
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Sparkles, UploadCloud, AlertTriangle, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";


import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateCaptions } from "@/ai/flows/generate-caption";
import { CaptionCard } from "./caption-card";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  mood: z.string().optional(), // Handle validation manually
  description: z.string().optional(),
  image: z.any().optional(), // Handle validation manually
});

const moods = [
    "😊 Happy / Cheerful", "😍 Romantic / Flirty", "😎 Cool / Confident",
    "😜 Fun / Playful", "🤔 Thoughtful / Deep", "😌 Calm / Peaceful",
    "😢 Sad / Emotional", "😏 Sassy / Savage", "😲 Surprised / Excited",
    "🌅 Aesthetic / Artsy", "👔 Formal / Professional", "📈 Business / Corporate",
    "📝 Informative / Educational", "🎩 Elegant / Sophisticated", "🏖 Casual / Chill",
    "🔥 Motivational / Inspirational", "🎉 Celebratory / Festive", "⚡ Bold / Daring",
    "🌍 Travel / Adventure", "🍔 Foodie / Culinary", "🐾 Pet / Cute",
    "🎵 Musical / Rhythmic"
];

export function CaptionGenerator() {
  const [captions, setCaptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [quotaInfo, setQuotaInfo] = useState<{remaining: number, total: number, isAuthenticated: boolean} | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { data: session } = useSession();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mood: "",
      description: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Clear image-related error when user uploads an image
      if (error === "Please upload an image to generate captions.") {
        setError('');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Validate that an image is uploaded
    if (!uploadedFile) {
      setError("Please upload an image to generate captions.");
      return;
    }

    // Validate that mood is selected
    if (!values.mood) {
      setError("Please select a mood for your caption.");
      return;
    }

    setIsLoading(true);
    setCaptions([]);
    setError('');

    try {
      // Upload the image first
      const formData = new FormData();
      formData.append('file', uploadedFile);
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadResponse.json();
      
      if (!uploadResponse.ok || !uploadData.success) {
        throw new Error(uploadData.message || 'Image upload failed.');
      }

      // Generate captions using the uploaded image, mood, and description
      console.log('📸 Sending to AI for analysis:', {
        mood: values.mood,
        description: values.description,
        imageUrl: uploadData.url,
        userId: session?.user?.id
      });
      
      const captionResponse = await fetch('/api/generate-captions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood: values.mood,
          description: values.description,
          imageUrl: uploadData.url,
        }),
      });

      const captionData = await captionResponse.json();

      if (!captionResponse.ok) {
        // Handle rate limiting errors specifically
        if (captionResponse.status === 429) {
          throw new Error(captionData.message || 'Rate limit exceeded. Please try again later.');
        }
        throw new Error(captionData.message || 'Failed to generate captions.');
      }

      if (captionData.success && captionData.data?.captions) {
        setCaptions(captionData.data.captions);
        // Refresh quota info after successful generation
        setRefreshTrigger(prev => prev + 1);
      } else {
        throw new Error("Couldn't generate captions. Please try again.");
      }

    } catch (error: any) {
      // Only log non-rate-limit errors to avoid console spam
      if (!error.message?.includes('free images this month') && !error.message?.includes('monthly limit')) {
        console.error("Caption Generation Error:", error);
      }
      
      // If it's a rate limit error, trigger quota refresh
      if (error.message?.includes('free images this month') || error.message?.includes('monthly limit')) {
        setRefreshTrigger(prev => prev + 1);
      }
      
      const errorMessage = error.message || "Failed to generate or save captions. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }


  // Fetch quota info on component mount, session changes, and refresh triggers
  useEffect(() => {
    const fetchQuotaInfo = async () => {
      try {
        const response = await fetch('/api/rate-limit-info');
        if (response.ok) {
          const data = await response.json();
          setQuotaInfo({
            remaining: data.remaining,
            total: data.maxGenerations,
            isAuthenticated: data.isAuthenticated
          });
          console.log('🔄 Quota info updated:', data.remaining, '/', data.maxGenerations);
        }
      } catch (error) {
        console.error('Failed to fetch quota info:', error);
      }
    };
    fetchQuotaInfo();
  }, [session, refreshTrigger]);

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start p-4 border border-border bg-muted/20 rounded-lg">
            
            <div className="flex items-center justify-center w-full">
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-border border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted/40 transition-colors">
                  {imagePreview ? (
                    <div className="relative w-full h-full rounded-lg overflow-hidden bg-muted/20">
                       <Image
                          src={imagePreview}
                          alt="Uploaded preview"
                          fill
                          style={{ objectFit: "contain" }}
                        />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                      {error === "Please upload an image to generate captions." && (
                        <p className="text-xs text-red-500 mt-2">* Image required</p>
                      )}
                    </div>
                  )}
                  <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/gif" onChange={handleImageChange} />
              </label>
            </div> 

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select a mood (required)</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      // Clear mood-related error when user selects a mood
                      if (error === "Please select a mood for your caption.") {
                        setError('');
                      }
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Choose the vibe for your caption..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {moods.map((mood) => (
                          <SelectItem key={mood} value={mood}>
                            {mood}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Describe your content (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., A golden retriever puppy playing in a field of flowers..."
                          className="min-h-[120px] bg-background border-border rounded-lg p-3 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
            </div>
          </div>
          
           <div className="flex flex-col items-center gap-4">
              {/* Error Message */}
              {error && (
                <div className="w-full max-w-sm p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              
              <Button type="submit" disabled={isLoading} size="lg" className="w-full max-w-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-100 shadow-lg shadow-primary/20 hover:shadow-primary/40">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Captions
                  </>
                )}
              </Button>
              
              {/* Quota Information */}
              {quotaInfo && (
                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">
                    {quotaInfo.isAuthenticated ? (
                      <span>Monthly quota: {quotaInfo.remaining}/{quotaInfo.total} images remaining</span>
                    ) : (
                      <span>Free trial: {quotaInfo.remaining}/{quotaInfo.total} images remaining this month</span>
                    )}
                  </div>
                  
                  {!quotaInfo.isAuthenticated && (
                    <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
                      <p>💡 <strong>Each image generates 3 unique captions!</strong></p>
                      <p className="mt-1">Sign up for 25 images/month (75 captions total)</p>
                      <p className="text-yellow-600 dark:text-yellow-400 mt-1">⚠️ Limited quotas due to free AI API usage</p>
                    </div>
                  )}
                  
                  {quotaInfo.isAuthenticated && (
                    <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
                      <p>💡 <strong>Each image = 3 captions</strong> • Monthly limit helps manage AI costs</p>
                    </div>
                  )}
                </div>
              )}
              
              {!session && (
                <div className="text-muted-foreground flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 text-red-500" />
                  <p className="text-xs text-center">Sign up to save your generated captions and images.</p>
               </div>
              )}
           </div>
        </form>
      </Form>

      {(isLoading || captions.length > 0) && (
        <div className="space-y-6 pt-8">
          <h2 className="text-2xl font-bold text-center text-foreground">Your Captions ✨</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-muted/40 p-4 rounded-lg space-y-3 animate-pulse min-h-[150px] border border-border">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                ))
              : captions.map((caption, index) => (
                  <CaptionCard key={index} caption={caption} />
                ))}
          </div>
        </div>
      )}
    </div>
  );
}
