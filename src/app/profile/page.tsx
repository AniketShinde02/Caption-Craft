
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ProfileDeletion from '@/components/ProfileDeletion';

export default function ProfilePage() {
    const { data: session, status } = useSession({
      required: true,
      onUnauthenticated() {
        // Rely on loading state; middleware also protects this route.
      },
    });

    // Debug logging
    console.log('🔍 Profile Page Debug:', { status, session: !!session, userId: session?.user?.id });

    const [posts, setPosts] = useState<IPost[]>([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);

    // Show loading state while session is loading
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    // Show error state if session failed
    if (status === 'unauthenticated') {
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

    const [username, setUsername] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [bio, setBio] = useState<string>('');
    const [imageUrl, setImageUrl] = useState<string>('');
    const [savingProfile, setSavingProfile] = useState<boolean>(false);
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [selectedCaption, setSelectedCaption] = useState<{ caption: string, mood: string, date: string, image?: string, id?: string } | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    // Profile image upload states
    const [profileImage, setProfileImage] = useState<string>('');
    const [uploadingImage, setUploadingImage] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const profileImageInputRef = useRef<HTMLInputElement | null>(null);
    const { toast } = useToast();

    // Usage Statistics (mock data for now)
    const [stats, setStats] = useState({
        captionsGenerated: 1250,
        mostUsedMood: 'Joyful',
        followers: '15.k',
        engagement: '8.7%'
    });

    useEffect(() => {
        const fetchData = async () => {
            if (session?.user?.id) {
                console.log('🔄 Fetching profile data for user:', session.user.id);
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
                    } else {
                        console.error('❌ Posts API failed:', postsRes.status, postsRes.statusText);
                    }
                    
                    if (userRes.ok) {
                        const u = await userRes.json();
                        console.log('👤 User data:', u);
                        setUsername(u.data.username || 'Cursor AI');
                        setTitle(u.data.title || 'AI Assistant');
                        setBio(u.data.bio || 'Your intelligent coding companion, ready to help you build amazing applications with precision and creativity. Let\'s code the future together!');
                        setImageUrl(u.data.image || '');
                        setProfileImage(u.data.image || '');
                    } else {
                        console.error('❌ User API failed:', userRes.status, userRes.statusText);
                    }
                } catch (error) {
                    console.error('💥 Failed to fetch data', error);
                } finally {
                    setIsLoadingPosts(false);
                }
            } else {
                console.log('⏳ No session user ID yet, waiting...');
            }
        };

        fetchData();
    }, [session]);
    
    const userEmail = session?.user?.email || 'sophia.carter@example.com';
    const fallbackName = userEmail ? userEmail.split('@')[0] : 'User';
    const displayName = username || fallbackName;
    // @ts-ignore
    const userJoined = session?.user?.createdAt ? format(new Date(session.user.createdAt), 'yyyy') : '2022';

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

    if (status === 'loading') {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="bg-card">
                            <CardContent className="p-6">
                                {/* Profile Section */}
                                <div className="text-center mb-6">
                                    <div className="relative inline-block mb-4">
                                        <Avatar className="w-32 h-32 mx-auto border-4 border-background shadow-xl ring-2 ring-primary/10">
                                            {profileImage ? (
                                                <AvatarImage 
                                                    src={profileImage} 
                                                    alt={`${displayName}'s avatar`}
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-2xl font-semibold text-primary">
                                                    {displayName.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                        
                                        {/* Profile Image Upload Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/50 rounded-full cursor-pointer"
                                             onClick={() => profileImageInputRef.current?.click()}>
                                            {uploadingImage ? (
                                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                                            ) : (
                                                <Edit className="w-8 h-8 text-white" />
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
                                        <h2 className="text-xl font-bold text-foreground break-words leading-tight" title={displayName}>
                                            {displayName}
                                        </h2>
                                        <p className="text-sm text-muted-foreground font-medium break-words" title={title}>
                                            {title}
                                        </p>
                                        <p className="text-xs text-muted-foreground bg-muted/30 px-3 py-1 rounded-full inline-block">Joined in {userJoined}</p>
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
                    <div className="lg:col-span-3 space-y-8">
                        {/* Profile Settings */}
                        <Card className="bg-card">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Full Name</label>
                                        <Input
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Enter full name"
                                        />
                                    </div>

                                    {/* Title/Profession */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Title / Profession</label>
                                        <Input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g. Content Creator"
                                        />
                                    </div>

                                    {/* Email Address */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">Email Address</label>
                                        <Input
                                            value={userEmail}
                                            disabled
                                            className="bg-muted/50"
                                        />
                                    </div>

                                    {/* Bio */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">Bio</label>
                                        <Textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            placeholder="Tell us about yourself..."
                                            rows={4}
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
                                <div className="flex justify-end gap-3 pt-6">
                                    <Button variant="outline" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSaveProfile} disabled={savingProfile}>
                                        {savingProfile ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Usage Statistics */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Usage Statistics</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Captions Generated */}
                                <Card className="bg-card">
                                    <CardContent className="p-6 text-center">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Captions Generated</h3>
                                        <p className="text-2xl font-bold">{stats.captionsGenerated.toLocaleString()}</p>
                                    </CardContent>
                                </Card>

                                {/* Most Used Mood */}
                                <Card className="bg-card">
                                    <CardContent className="p-6 text-center">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Most Used Mood</h3>
                                        <div className="flex items-center justify-center gap-2">
                                            <Star className="w-5 h-5 text-yellow-500" />
                                            <p className="text-lg font-semibold text-green-600">{stats.mostUsedMood}</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Followers */}
                                <Card className="bg-card">
                                    <CardContent className="p-6 text-center">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Followers</h3>
                                        <p className="text-2xl font-bold">{stats.followers}</p>
                                    </CardContent>
                                </Card>

                                {/* Engagement */}
                                <Card className="bg-card">
                                    <CardContent className="p-6 text-center">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Engagement</h3>
                                        <p className="text-2xl font-bold">{stats.engagement}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Recent Captions */}
                        <Card className="bg-card" id="recent-captions">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold">Recent Captions</h2>
                                    <Button variant="ghost" className="text-primary">
                                        View all
                                    </Button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 text-sm font-medium text-muted-foreground">Caption</th>
                                                <th className="text-left py-3 text-sm font-medium text-muted-foreground">Mood</th>
                                                <th className="text-left py-3 text-sm font-medium text-muted-foreground">Date</th>
                                                <th className="text-right py-3 text-sm font-medium text-muted-foreground">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoadingPosts ? (
                                                <tr>
                                                    <td colSpan={4} className="text-center py-8">
                                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                                    </td>
                                                </tr>
                                            ) : posts.length > 0 ? (
                                                posts.slice(0, 5).map((post, index) => (
                                                    <tr key={post._id} className="border-b border-border/50">
                                                        <td className="py-3 text-sm max-w-xs">
                                                            <p className="truncate">{post.captions?.[0] || "No caption available"}</p>
                                                        </td>
                                                        <td className="py-3">
                                                            <Badge 
                                                                variant="secondary" 
                                                                className={`${
                                                                    index === 0 ? 'bg-green-500/10 text-green-700' :
                                                                    index === 1 ? 'bg-blue-500/10 text-blue-700' :
                                                                    'bg-orange-500/10 text-orange-700'
                                                                }`}
                                                            >
                                                                {index === 0 ? 'Joyful' : index === 1 ? 'Reflective' : 'Adventurous'}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 text-sm text-muted-foreground">
                                                            {format(new Date(post.createdAt || Date.now() - index * 86400000), 'yyyy-MM-dd')}
                                                        </td>
                                                        <td className="py-3 text-right">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                className="text-primary"
                                                                onClick={() => {
                                                                    // Show all captions from the post (new array structure)
                                                                    const allCaptions = post.captions || ['No captions available'];
                                                                    const fullCaption = allCaptions.join('\n\n• '); // Join all captions with bullet points
                                                                    const mood = post.mood || (index === 0 ? 'Joyful' : index === 1 ? 'Reflective' : 'Adventurous');
                                                                    const date = format(new Date(post.createdAt || Date.now() - index * 86400000), 'yyyy-MM-dd');
                                                                    const sampleImages = [
                                                                        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
                                                                        'https://images.unsplash.com/photo-1500522144261-ea64433bbe27?w=400&h=300&fit=crop',
                                                                        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop'
                                                                    ];
                                                                    setSelectedCaption({ 
                                                                        caption: `• ${fullCaption}`, // Add bullet point to first caption
                                                                        mood, 
                                                                        date, 
                                                                        image: post.image || sampleImages[index],
                                                                        id: post._id
                                                                    });
                                                                    setIsDialogOpen(true);
                                                                }}
                                                            >
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                View
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                // Empty state - no captions generated yet
                                                <tr>
                                                    <td colSpan={4} className="py-12 text-center">
                                                        <div className="flex flex-col items-center justify-center space-y-4">
                                                            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center">
                                                                <Star className="w-8 h-8 text-muted-foreground/50" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <h3 className="text-lg font-medium text-muted-foreground">No captions generated yet</h3>
                                                                <p className="text-sm text-muted-foreground/70 max-w-md">
                                                                    Start creating amazing captions for your social media posts! Upload an image and let AI generate perfect captions for you.
                                                                </p>
                                                            </div>
                                                            <Link href="/">
                                                                <Button className="mt-4">
                                                                    <Star className="w-4 h-4 mr-2" />
                                                                    Generate Your First Caption
                                                            </Button>
                                                            </Link>
                                                        </div>
                                                        </td>
                                                    </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Profile Deletion */}
                        <ProfileDeletion userEmail={userEmail} />
                    </div>
                </div>
            </div>

            {/* Caption Viewing Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-xl font-semibold">Caption Details</DialogTitle>
                            <DialogClose asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Close</span>
                                </Button>
                            </DialogClose>
                        </div>
                    </DialogHeader>
                    
                    {selectedCaption && (
                        <div className="space-y-6">
                            {/* Image */}
                            {selectedCaption.image && (
                                <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
                                    <Image
                                        src={selectedCaption.image}
                                        alt="Caption image"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            
                            {/* Caption Text */}
                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Generated Captions</h3>
                                    <div className="text-base leading-relaxed p-4 bg-muted/30 rounded-lg border whitespace-pre-line">
                                        {selectedCaption.caption}
                                    </div>
                                </div>
                                
                                {/* Metadata */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Mood</h4>
                                        <Badge 
                                            variant="secondary" 
                                            className={`${
                                                selectedCaption.mood === 'Joyful' ? 'bg-green-500/10 text-green-700' :
                                                selectedCaption.mood === 'Reflective' ? 'bg-blue-500/10 text-blue-700' :
                                                'bg-orange-500/10 text-orange-700'
                                            }`}
                                        >
                                            {selectedCaption.mood}
                                        </Badge>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Date Created</h4>
                                        <p className="text-sm">{selectedCaption.date}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex justify-between pt-4 border-t">
                                <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={async () => {
                                        if (window.confirm('Are you sure you want to delete this entire caption set? This will delete all 3 captions from this generation. This action cannot be undone.')) {
                                            if (!selectedCaption.id) {
                                                toast({
                                                    title: "Error",
                                                    description: "Cannot delete caption: No caption ID found.",
                                                    variant: "destructive",
                                                });
                                                return;
                                            }

                                            try {
                                                const response = await fetch(`/api/posts/${selectedCaption.id}`, {
                                                    method: 'DELETE',
                                                });

                                                const data = await response.json();

                                                if (response.ok) {
                                                    toast({
                                                        title: "Caption set deleted!",
                                                        description: "All captions from this generation have been successfully deleted.",
                                                    });
                                                    
                                                    setIsDialogOpen(false);
                                                    
                                                    // Remove the deleted post from the local state
                                                    setPosts(prevPosts => prevPosts.filter(post => post._id !== selectedCaption.id));
                                                    
                                                    // Update stats (decrease the count)
                                                    setStats(prevStats => ({
                                                        ...prevStats,
                                                        captionsGenerated: Math.max(0, prevStats.captionsGenerated - 1)
                                                    }));
                                                } else {
                                                    toast({
                                                        title: "Delete failed",
                                                        description: data.message || "Failed to delete caption. Please try again.",
                                                        variant: "destructive",
                                                    });
                                                }
                                            } catch (err) {
                                                console.error('Failed to delete caption:', err);
                                                toast({
                                                    title: "Network error",
                                                    description: "Failed to delete caption due to a network error. Please try again.",
                                                    variant: "destructive",
                                                });
                                            }
                                        }
                                    }}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete Caption Set
                                </Button>
                                <div className="flex gap-3">
                                    <Button 
                                        className="bg-primary hover:bg-primary/90"
                                        onClick={async () => {
                                            try {
                                                await navigator.clipboard.writeText(selectedCaption.caption);
                                                toast({
                                                    title: "Captions copied!",
                                                    description: "All captions from this set have been copied to your clipboard.",
                                                });
                                            } catch (err) {
                                                console.error('Failed to copy caption:', err);
                                                toast({
                                                    title: "Copy failed",
                                                    description: "Failed to copy caption to clipboard.",
                                                    variant: "destructive",
                                                });
                                            }
                                        }}
                                    >
                                        <Copy className="w-4 h-4 mr-2" />
                                                        Copy All Captions
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
