
'use client';
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Image from 'next/image';
import { Edit, Home, Clock, Settings, Bell, LogOut, Loader2, User, Eye, AlertCircle, CheckCircle, Star, X, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { IPost } from '@/models/Post';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ProfileDeletion from '@/components/ProfileDeletion';

export default function ProfilePage() {
    const { data: session, status } = useSession({
      required: true,
      onUnauthenticated() {
        // Rely on loading state; middleware also protects this route.
      },
    });

    // Ensure consistent session state to prevent hook order issues
    const sessionStatus = status || 'loading';
    const sessionData = session || null;

    // Debug logging - moved after variables are declared
    console.log('🔍 Profile Page Debug:', { status: sessionStatus, session: !!sessionData, userId: sessionData?.user?.id });

    // Safety check: ensure we always have a valid status
    if (!sessionStatus) {
        console.warn('⚠️ ProfilePage: sessionStatus is undefined, defaulting to loading');
    }

    const [posts, setPosts] = useState<IPost[]>([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    const [expandedCaptionId, setExpandedCaptionId] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [username, setUsername] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [bio, setBio] = useState<string>('');
    const [imageUrl, setImageUrl] = useState<string>('');
    const [savingProfile, setSavingProfile] = useState<boolean>(false);
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileImage, setProfileImage] = useState<string>('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showDataRecovery, setShowDataRecovery] = useState(false);
    const [recoveryReason, setRecoveryReason] = useState('');
    const [recoveryDetails, setRecoveryDetails] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [stats, setStats] = useState({
        captionsGenerated: 0,
        mostUsedMood: 'None',
        averageLength: 0,
        totalImages: 0
    });
    
    // Performance optimization: prevent multiple rapid clicks
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    
    // Refs must be declared directly, not wrapped in useState
    const profileImageInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // CRITICAL: All hooks must be called before any conditional returns
    // This ensures hooks are called in the same order every render
    useEffect(() => {
        const fetchData = async () => {
            if (sessionData?.user?.id) {
                console.log('🔄 Fetching profile data for user:', sessionData.user.id);
                setIsLoadingPosts(true);
                try {
                    const [postsRes, userRes] = await Promise.all([
                        fetch('/api/posts'),
                        fetch('/api/user'),
                    ]);
                    
                    console.log('📊 API Responses:', { 
                        postsStatus: postsRes.status, 
                        userStatus: userRes.status 
                    });
                    
                    if (postsRes.ok) {
                        const p = await postsRes.json();
                        console.log('📝 Posts data:', p);
                        setPosts(p.data);
                        
                        // Update stats based on posts data
                        if (p.data && Array.isArray(p.data)) {
                            const moodCounts: Record<string, number> = {};
                            let totalLength = 0;
                            let imageCount = 0;
                            
                            p.data.forEach((post: any) => {
                                // Count moods
                                const mood = post.mood || 'None';
                                moodCounts[mood] = (moodCounts[mood] || 0) + 1;
                                
                                // Count total length
                                if (post.captions && post.captions.length > 0) {
                                    totalLength += post.captions[0].length;
                                }
                                
                                // Count images
                                if (post.image) {
                                    imageCount++;
                                }
                            });
                            
                            // Find most used mood
                            const mostUsedMood = Object.keys(moodCounts).length > 0 ? 
                                Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b) : 'None';
                            
                            setStats(prevStats => ({
                                ...prevStats,
                                captionsGenerated: p.data.length,
                                totalImages: imageCount,
                                averageLength: p.data.length > 0 ? Math.round(totalLength / p.data.length) : 0,
                                mostUsedMood: mostUsedMood
                            }));
                        }
                    } else {
                        console.error('❌ Failed to fetch posts:', postsRes.status);
                    }
                    
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        console.log('👤 User data:', userData);
                        setUsername(userData.username || '');
                        setTitle(userData.title || '');
                        setBio(userData.bio || '');
                        setImageUrl(userData.imageUrl || '');
                        setProfileImage(userData.imageUrl || '');
                    } else {
                        console.error('❌ Failed to fetch user data:', userRes.status);
                    }
                } catch (error) {
                    console.error('❌ Error fetching data:', error);
                } finally {
                    setIsLoadingPosts(false);
                }
            }
        };

        fetchData();
    }, [sessionData?.user?.id || null]);

    // ===== CONDITIONAL RENDERING BEGINS HERE =====
    // All hooks have been called above, now safe to return early
    if ((sessionStatus as string) === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    // Check if user is admin and redirect them appropriately
    if (sessionData?.user?.role?.name === 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Admin Access Restricted</h2>
                    <p className="text-muted-foreground mb-4">
                        Admin users cannot access the profile page directly. Please logout first to access your profile as a regular user.
                    </p>
                    <div className="space-y-2">
                        <Button 
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="w-full"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout to Access Profile
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => window.history.back()}
                            className="w-full"
                        >
                            Go Back
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state if session failed
    if ((sessionStatus as string) === 'unauthenticated') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
                    <p className="text-destructive mb-4">Authentication required</p>
                    <Link href="/" className="text-primary hover:underline">
                        Go back to home
                    </Link>
                </div>
            </div>
        );
    }
    
    const userEmail = sessionData?.user?.email || 'sophia.carter@example.com';
    const fallbackName = userEmail ? userEmail.split('@')[0] : 'User';
    const displayName = username || fallbackName;
    // @ts-ignore
    const userJoined = sessionData?.user?.createdAt ? format(new Date(sessionData.user.createdAt), 'yyyy') : '2022';

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        setProfileError('');
        setProfileSuccess('');
        
        try {
            const response = await fetch('/api/user', { 
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ username, title, bio, image: imageUrl }) 
            });
            
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                setProfileError(data.message || 'Failed to update profile.');
            } else {
                setProfileSuccess('Profile updated successfully!');
            }
        } catch (err) {
            setProfileError('Network error. Please try again.');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleCancel = async () => {
        setProfileError('');
        setProfileSuccess('');
        
        // Re-fetch user data to reset form
        try {
            const res = await fetch('/api/user');
            if (res.ok) {
                const u = await res.json();
                setUsername(u.data.username || '');
                setTitle(u.data.title || '');
                setBio(u.data.bio || '');
                setImageUrl(u.data.image || '');
                setProfileImage(u.data.image || '');
            }
        } catch (err) {
            console.error('Failed to reset form', err);
        }
    };

    // Profile image upload handler
    const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Invalid file type",
                description: "Please select an image file.",
                variant: "destructive",
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Please select an image smaller than 5MB.",
                variant: "destructive",
            });
            return;
        }

        setUploadingImage(true);

        try {
            // Upload to ImageKit (reusing existing upload logic)
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const uploadData = await uploadRes.json();

            if (!uploadRes.ok) {
                throw new Error(uploadData.message || 'Upload failed');
            }

            const imageUrl = uploadData.url;

            // Update profile image in database
            const updateRes = await fetch('/api/user/profile-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageUrl }),
            });

            const updateData = await updateRes.json();

            if (!updateRes.ok) {
                throw new Error(updateData.message || 'Failed to update profile image');
            }

            // Update local state
            setProfileImage(imageUrl);
            setImageUrl(imageUrl);

            toast({
                title: "Profile image updated!",
                description: "Your profile image has been successfully updated.",
            });

        } catch (error) {
            console.error('Profile image upload error:', error);
            toast({
                title: "Upload failed",
                description: "Failed to update profile image. Please try again.",
                variant: "destructive",
            });
        } finally {
            setUploadingImage(false);
            // Reset file input
            if (profileImageInputRef.current) {
                profileImageInputRef.current.value = '';
            }
        }
    };

    // Remove profile image
    const removeProfileImage = async () => {
        try {
            const res = await fetch('/api/user/profile-image', {
                method: 'DELETE',
            });

            if (!res.ok) {
                throw new Error('Failed to remove profile image');
            }

            setProfileImage('');
            setImageUrl('');

            toast({
                title: "Profile image removed",
                description: "Your profile image has been removed.",
            });

        } catch (error) {
            console.error('Remove profile image error:', error);
            toast({
                title: "Remove failed",
                description: "Failed to remove profile image. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Handle data recovery request
    const handleDataRecoveryRequest = async () => {
        try {
            const response = await fetch('/api/user/data-recovery-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reason: recoveryReason,
                    details: recoveryDetails,
                    contactEmail: contactEmail || sessionData?.user?.email,
                }),
            });

            if (response.ok) {
                toast({
                    title: "Recovery request submitted!",
                    description: "We've received your data recovery request. Our team will review it and contact you within 24-48 hours.",
                });
                
                // Reset form and close dialog
                setRecoveryReason('');
                setRecoveryDetails('');
                setContactEmail('');
                setShowDataRecovery(false);
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Failed to submit recovery request');
            }
        } catch (error: any) {
            toast({
                title: "Request failed",
                description: error.message || 'Failed to submit recovery request. Please try again.',
                variant: "destructive",
            });
        }
    };

    if (sessionStatus === 'loading') {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1 order-2 lg:order-1">
                        <Card className="bg-card">
                            <CardContent className="p-4 md:p-6">
                                {/* Profile Section */}
                                <div className="text-center mb-6">
                                    <div className="relative inline-block mb-4">
                                        <Avatar className="w-24 h-24 md:w-32 md:h-32 mx-auto border-4 border-background shadow-xl ring-2 ring-primary/10">
                                            {profileImage ? (
                                                <AvatarImage 
                                                    src={profileImage} 
                                                    alt={`${displayName}'s avatar`}
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-xl md:text-2xl font-semibold text-primary">
                                                    {displayName.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                        
                                        {/* Profile Image Upload Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/50 rounded-full cursor-pointer"
                                             onClick={() => profileImageInputRef.current?.click()}>
                                            {uploadingImage ? (
                                                <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-white animate-spin" />
                                            ) : (
                                                <Edit className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                            )}
                                        </div>
                                        {/* Hidden file input for profile image upload */}
                                        <input 
                                            ref={profileImageInputRef} 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden"
                                            onChange={handleProfileImageUpload}
                                        />
                                    </div>
                                    <div className="space-y-2 px-2">
                                        <h2 className="text-lg md:text-xl font-bold text-foreground break-words leading-tight" title={displayName}>
                                            {displayName}
                                        </h2>
                                        <p className="text-xs md:text-sm text-muted-foreground font-medium break-words" title={title}>
                                            {title}
                                        </p>
                                        <p className="text-xs text-muted-foreground bg-muted/30 px-2 md:px-3 py-1 rounded-full inline-block">Joined in {userJoined}</p>
                                    </div>
                                    
                                    {/* Profile Image Actions */}
                                    <div className="flex gap-2 justify-center mt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => profileImageInputRef.current?.click()}
                                            disabled={uploadingImage}
                                            className="text-xs"
                                        >
                                            {uploadingImage ? (
                                                <>
                                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <Edit className="w-3 h-3 mr-1" />
                                                    {profileImage ? 'Change' : 'Add Photo'}
                                                </>
                                            )}
                                        </Button>
                                        {profileImage && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={removeProfileImage}
                                                className="text-xs text-destructive hover:text-destructive"
                                            >
                                                <X className="w-3 h-3 mr-1" />
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Navigation */}
                                <nav className="space-y-1">
                                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary">
                                        <User className="w-4 h-4" />
                                        Account
                                    </button>
                                    <button 
                                        onClick={() => document.getElementById('recent-captions')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    >
                                        <Clock className="w-4 h-4" />
                                        Caption History
                                    </button>
                                    <button 
                                        onClick={() => setShowDataRecovery(true)}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Data Recovery
                                    </button>
                                    <Link href="/settings" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50">
                                        <Settings className="w-4 h-4" />
                                        Preferences
                                    </Link>
                                    <Link href="#" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50">
                                        <Bell className="w-4 h-4" />
                                        Notifications
                                    </Link>
                                    <button 
                                        onClick={() => signOut({ callbackUrl: '/' })} 
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:text-red-600 hover:bg-muted/50"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </nav>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 order-1 lg:order-2 space-y-6 lg:space-y-8">
                        {/* Profile Settings */}
                        <Card className="bg-card">
                            <CardContent className="p-4 md:p-6">
                                <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Profile Settings</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Full Name</label>
                                        <Input
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Enter your own details"
                                            className="text-sm md:text-base"
                                        />
                                    </div>

                                    {/* Title/Profession */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Title / Profession</label>
                                        <Input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Enter your own details"
                                            className="text-sm md:text-base"
                                        />
                                    </div>

                                    {/* Email Address */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">Email Address</label>
                                        <Input
                                            value={userEmail}
                                            disabled
                                            className="bg-muted/50 text-sm md:text-base"
                                            placeholder="Enter your own details"
                                        />
                                    </div>

                                    {/* Bio */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">Bio</label>
                                        <Textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            placeholder="Enter your own details"
                                            rows={3}
                                            className="text-sm md:text-base"
                                        />
                                    </div>
                                </div>

                                {/* Error/Success Messages */}
                                {profileError && (
                                    <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                                        <p className="text-sm text-destructive">{profileError}</p>
                                    </div>
                                )}

                                {profileSuccess && (
                                    <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        <p className="text-sm text-green-500">{profileSuccess}</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 md:pt-6">
                                    <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSaveProfile} disabled={savingProfile} className="w-full sm:w-auto">
                                        {savingProfile ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Usage Statistics */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Usage Statistics</h2>
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                                {/* Captions Generated */}
                                <Card className="bg-card">
                                    <CardContent className="p-4 md:p-6 text-center">
                                        <h3 className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Captions Generated</h3>
                                        <p className="text-xl md:text-2xl font-bold">{stats.captionsGenerated.toLocaleString()}</p>
                                    </CardContent>
                                </Card>

                                {/* Most Used Mood */}
                                <Card className="bg-card">
                                    <CardContent className="p-4 md:p-6 text-center">
                                        <h3 className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Most Used Mood</h3>
                                        <div className="flex items-center justify-center gap-2">
                                            <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                                            <p className="text-sm md:text-lg font-semibold text-green-600 truncate">
                                                {stats.mostUsedMood}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Total Images */}
                                <Card className="bg-card">
                                    <CardContent className="p-4 md:p-6 text-center">
                                        <h3 className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Total Images</h3>
                                        <p className="text-xl md:text-2xl font-bold">{stats.totalImages.toLocaleString()}</p>
                                    </CardContent>
                                </Card>

                                {/* Average Length */}
                                <Card className="bg-card">
                                    <CardContent className="p-4 md:p-6 text-center">
                                        <h3 className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Avg. Length</h3>
                                        <p className="text-xl md:text-2xl font-bold">{stats.averageLength} chars</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Caption History */}
                        <div id="recent-captions">
                            <h2 className="text-xl font-semibold mb-6">Caption History</h2>
                            
                            {isLoadingPosts ? (
                                <div className="flex justify-center items-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : posts.length === 0 ? (
                                <Card className="bg-card">
                                    <CardContent className="p-12 text-center">
                                        <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No Captions Yet</h3>
                                        <p className="text-muted-foreground">Start creating amazing captions for your images!</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {posts.map((post) => (
                                        <Card key={post._id} className="bg-card hover:shadow-md transition-shadow duration-200">
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-4">
                                                    {/* Image - Fixed display */}
                                                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-muted-foreground/20">
                                                        {post.image ? (
                                                            <Image
                                                                src={post.image}
                                                                alt="Caption image"
                                                                fill
                                                                className="object-cover"
                                                                sizes="96px"
                                                                priority={false}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                                                <span className="text-muted-foreground text-xs">No Image</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <Badge variant="secondary" className="text-xs px-2 py-1">
                                                                    {post.mood || 'Unknown'}
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                                                                    {format(new Date(post.createdAt), 'MMM dd, yyyy')}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        if (expandedCaptionId === post._id) {
                                                                            setExpandedCaptionId(null);
                                                                        } else {
                                                                            setExpandedCaptionId(post._id);
                                                                            // Scroll to the expanded content
                                                                            setTimeout(() => {
                                                                                document.getElementById(`caption-${post._id}`)?.scrollIntoView({ 
                                                                                    behavior: 'smooth',
                                                                                    block: 'nearest'
                                                                                });
                                                                            }, 100);
                                                                        }
                                                                    }}
                                                                    className="text-xs"
                                                                 >
                                                                     {expandedCaptionId === post._id ? 'Hide' : 'View'}
                                                                 </Button>
                                                                 
                                                                 {showDeleteConfirm === post._id ? (
                                                                     <div className="flex items-center gap-2">
                                                                         <Button
                                                                             size="sm"
                                                                             variant="outline"
                                                                             onClick={() => setShowDeleteConfirm(null)}
                                                                         >
                                                                             Cancel
                                                                         </Button>
                                                                         <Button
                                                                             size="sm"
                                                                             variant="destructive"
                                                                             onClick={async () => {
                                                                                 // Prevent multiple rapid clicks
                                                                                 if (isDeleting === post._id) return;
                                                                                 setIsDeleting(post._id);
                                                                                 
                                                                                 try {
                                                                                     const response = await fetch(`/api/posts/${post._id}`, {
                                                                                         method: 'DELETE',
                                                                                     });

                                                                                     if (response.ok) {
                                                                                         const data = await response.json();
                                                                                         
                                                                                         // Always remove from frontend regardless of ImageKit status
                                                                                         setPosts(prevPosts => prevPosts.filter(p => p._id !== post._id));
                                                                                         setExpandedCaptionId(null);
                                                                                         setShowDeleteConfirm(null);
                                                                                         
                                                                                         // Update stats
                                                                                         setStats(prevStats => ({
                                                                                             ...prevStats,
                                                                                             captionsGenerated: Math.max(0, prevStats.captionsGenerated - 1),
                                                                                             totalImages: Math.max(0, prevStats.totalImages - (post.image ? 1 : 0))
                                                                                         }));
                                                                                         
                                                                                         // Show success message
                                                                                         toast({
                                                                                             title: "Caption deleted successfully!",
                                                                                             description: data.message || "Image and caption have been removed from your history.",
                                                                                         });
                                                                                     } else {
                                                                                         const data = await response.json();
                                                                                         
                                                                                         // Handle specific error cases
                                                                                         if (data.message?.includes('ImageKit') || data.message?.includes('image')) {
                                                                                             // ImageKit failed but database was deleted - show success with note
                                                                                             setPosts(prevPosts => prevPosts.filter(p => p._id !== post._id));
                                                                                             setExpandedCaptionId(null);
                                                                                             setShowDeleteConfirm(null);
                                                                                             
                                                                                             // Update stats
                                                                                             setStats(prevStats => ({
                                                                                                 ...prevStats,
                                                                                                 captionsGenerated: Math.max(0, prevStats.captionsGenerated - 1),
                                                                                                 totalImages: Math.max(0, prevStats.totalImages - (post.image ? 1 : 0))
                                                                                             }));
                                                                                             
                                                                                             toast({
                                                                                                 title: "Caption deleted!",
                                                                                                 description: "Caption removed from history. Image may still exist in storage due to technical limitations.",
                                                                                                 variant: "default",
                                                                                             });
                                                                                         } else {
                                                                                             throw new Error(data.message || 'Failed to delete caption');
                                                                                         }
                                                                                     }
                                                                                 } catch (err: any) {
                                                                                     console.error('Failed to delete caption:', err);
                                                                                     
                                                                                     // Show user-friendly error message
                                                                                     toast({
                                                                                         title: "Delete failed",
                                                                                         description: err.message || "Failed to delete caption. Please try again.",
                                                                                         variant: "destructive",
                                                                                     });
                                                                                     
                                                                                     setShowDeleteConfirm(null);
                                                                                 } finally {
                                                                                     setIsDeleting(null);
                                                                                 }
                                                                             }}
                                                                             disabled={isDeleting === post._id}
                                                                         >
                                                                             {isDeleting === post._id ? (
                                                                                 <>
                                                                                     <Loader2 className="w-4 h-4 animate-spin" />
                                                                                     Deleting...
                                                                                 </>
                                                                             ) : (
                                                                                 'Confirm Delete'
                                                                             )}
                                                                         </Button>
                                                                     </div>
                                                                 ) : (
                                                                     <Button
                                                                         size="sm"
                                                                         variant="outline"
                                                                         onClick={() => setShowDeleteConfirm(post._id)}
                                                                         className="text-xs text-destructive hover:text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                                                         disabled={isDeleting === post._id}
                                                                         title="Delete this caption"
                                                                     >
                                                                         {isDeleting === post._id ? (
                                                                             <Loader2 className="w-4 h-4 animate-spin" />
                                                                         ) : (
                                                                             <Trash2 className="w-4 h-4" />
                                                                         )}
                                                                     </Button>
                                                                 )}
                                                             </div>
                                                         </div>
                                                         
                                                         {/* Caption Preview - Show actual caption */}
                                                         <p className="text-sm text-muted-foreground line-clamp-2">
                                                             {post.captions && post.captions.length > 0 && post.captions[0].trim() !== '' ? (
                                                                 post.captions[0]
                                                             ) : (
                                                                 <span className="italic text-muted-foreground/70">Caption generation in progress...</span>
                                                             )}
                                                         </p>
                                                     </div>
                                                 </div>
                                                 
                                                 {/* Expanded Caption Details */}
                                                 {expandedCaptionId === post._id && (
                                                     <div id={`caption-${post._id}`} className="mt-4 pt-4 border-t">
                                                         <div className="space-y-4">
                                                             {/* Full Caption - Show actual caption data */}
                                                             <div>
                                                                 <h4 className="text-sm font-medium text-muted-foreground mb-2">Generated Caption</h4>
                                                                 <div className="text-base leading-relaxed p-4 bg-muted/30 rounded-lg border">
                                                                     {post.captions && post.captions.length > 0 && post.captions[0].trim() !== '' ? (
                                                                         <div className="whitespace-pre-line text-foreground">
                                                                             {post.captions[0]}
                                                                         </div>
                                                                     ) : (
                                                                         <div className="text-muted-foreground italic">
                                                                             Caption generation is in progress. Please wait a moment and refresh.
                                                                         </div>
                                                                     )}
                                                                 </div>
                                                             </div>
                                                             
                                                             {/* Metadata - Better layout */}
                                                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-muted/20 rounded-lg">
                                                                 <div>
                                                                     <h4 className="text-sm font-medium text-muted-foreground mb-1">Mood</h4>
                                                                     <Badge variant="secondary" className="text-xs">
                                                                         {post.mood || 'Unknown'}
                                                                     </Badge>
                                                                 </div>
                                                                 <div>
                                                                     <h4 className="text-sm font-medium text-muted-foreground mb-1">Date Created</h4>
                                                                     <p className="text-sm text-foreground">{format(new Date(post.createdAt), 'MMM dd, yyyy')}</p>
                                                                 </div>
                                                             </div>
                                                             
                                                             {/* Action Buttons - Copy button only (delete handled in main list) */}
                                                             <div className="flex justify-end pt-4 border-t">
                                                                 {post.captions && post.captions.length > 0 && post.captions[0].trim() !== '' && (
                                                                     <Button 
                                                                         className="bg-primary hover:bg-primary/90"
                                                                         size="sm"
                                                                         onClick={async () => {
                                                                             // Prevent multiple rapid clicks
                                                                             const button = document.querySelector(`[data-copy-btn="${post._id}"]`) as HTMLButtonElement;
                                                                             if (!button || button.disabled) return;
                                                                             
                                                                             button.disabled = true;
                                                                             const originalText = button.innerHTML;
                                                                             button.innerHTML = '<Loader2 className="w-4 h-4 animate-spin" /> Copying...';
                                                                             
                                                                             try {
                                                                                 await navigator.clipboard.writeText(post.captions[0] || '');
                                                                                 // Show inline success message
                                                                                 button.innerHTML = '<CheckCircle className="w-4 h-4" /> Copied!';
                                                                                 button.className = 'bg-green-600 hover:bg-green-700 flex items-center gap-2';
                                                                                 
                                                                                 setTimeout(() => {
                                                                                     button.innerHTML = originalText;
                                                                                     button.disabled = false;
                                                                                     button.className = 'bg-primary hover:bg-primary/90 flex items-center gap-2';
                                                                                 }, 2000);
                                                                             } catch (err) {
                                                                                 console.error('Failed to copy caption:', err);
                                                                                 // Show inline error message
                                                                                 button.innerHTML = '<AlertCircle className="w-4 h-4" /> Failed';
                                                                                 button.className = 'bg-red-600 hover:bg-green-700 flex items-center gap-2';
                                                                                 
                                                                                 setTimeout(() => {
                                                                                     button.innerHTML = originalText;
                                                                                     button.disabled = false;
                                                                                     button.className = 'bg-primary hover:bg-primary/90 flex items-center gap-2';
                                                                                 }, 2000);
                                                                             }
                                                                         }}
                                                                         data-copy-btn={post._id}
                                                                     >
                                                                         <Copy className="w-4 h-4" />
                                                                         Copy Caption
                                                                     </Button>
                                                                 )}
                                                             </div>
                                                         </div>
                                                     </div>
                                                 )}
                                             </CardContent>
                                         </Card>
                                     ))}
                                 </div>
                            )}
                        </div>

                        {/* Profile Deletion */}
                        <ProfileDeletion userEmail={userEmail} />
                    </div>
                </div>
            </div>

            {/* Caption Viewing Dialog */}
            {/* This dialog is no longer needed as captions are expanded inline */}

            {/* Data Recovery Dialog */}
            <Dialog open={showDataRecovery} onOpenChange={setShowDataRecovery}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Data Recovery Request</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="recoveryReason" className="text-sm font-medium">Reason for Recovery</label>
                            <select
                                id="recoveryReason"
                                value={recoveryReason}
                                onChange={(e) => setRecoveryReason(e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Select a reason</option>
                                <option value="Account Access">Account Access</option>
                                <option value="Data Loss">Data Loss</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="recoveryDetails" className="text-sm font-medium">Details (Optional)</label>
                            <textarea
                                id="recoveryDetails"
                                value={recoveryDetails}
                                onChange={(e) => setRecoveryDetails(e.target.value)}
                                rows={4}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="contactEmail" className="text-sm font-medium">Contact Email (Optional)</label>
                            <input
                                type="email"
                                id="contactEmail"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>
                    <Button onClick={handleDataRecoveryRequest} className="w-full">Submit Recovery Request</Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}
