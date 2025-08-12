
import type {NextAuthOptions} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import AdminUser from '@/models/AdminUser';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { getNextAuthUrl, envConfig } from './env-config';

// Debug: Check NextAuth environment variables
console.log('🔐 NextAuth Environment Check:', {
  NEXTAUTH_SECRET: envConfig.nextAuth.secret !== 'fallback-secret-change-in-production' ? '✅ Set' : '❌ Missing',
  NEXTAUTH_URL: envConfig.nextAuth.url,
  NODE_ENV: envConfig.app.environment,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing'
});

console.log('🔐 NextAuth URL configured as:', getNextAuthUrl());


export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await dbConnect();

        if (!credentials?.email || !credentials.password) {
          throw new Error('Missing email or password.');
        }

        const user = await User.findOne({ email: credentials.email }).select('+password');

        if (!user) {
          // Security best practice: use a generic error message
          // to prevent user enumeration attacks.
          throw new Error('Invalid credentials.');
        }
        
        const isPasswordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordMatch) {
          throw new Error('Invalid credentials.');
        }
        
        // Update user's last login time and status
        await User.findByIdAndUpdate(user._id, { 
          lastLoginAt: new Date(),
          status: 'active' // Ensure user is marked as active on login
        });
        
        // Return a plain, serializable object. This is the critical fix.
        return {
          id: user._id.toString(),
          email: user.email,
        };
      },
    }),
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Admin auth: Missing credentials');
          return null;
        }

        try {
          console.log('🔐 Admin auth: Attempting login for:', credentials.email);
          
          // Find admin user using AdminUser model
          const adminUser = await AdminUser.findOne({
            email: credentials.email.toLowerCase(),
            isAdmin: true
          }).select('+password');

          if (!adminUser) {
            console.log('❌ Admin auth: No admin user found with email:', credentials.email);
            return null;
          }

          console.log('✅ Admin auth: Found admin user:', { id: adminUser._id, role: adminUser.role });

          // Check if account is locked
          if (adminUser.isLocked()) {
            console.log('❌ Admin auth: Account locked for:', credentials.email);
            return null;
          }

          // Verify password using AdminUser model method
          const isPasswordValid = await adminUser.comparePassword(credentials.password);
          if (!isPasswordValid) {
            console.log('❌ Admin auth: Invalid password for:', credentials.email);
            return null;
          }

          console.log('✅ Admin auth: Password verified for:', credentials.email);

          // Update last login time
          adminUser.lastLoginAt = new Date();
          await adminUser.save();

          // Return admin user data
          return {
            id: adminUser._id.toString(),
            email: adminUser.email,
            username: adminUser.username,
            role: adminUser.role,
            isAdmin: adminUser.isAdmin,
            isSuperAdmin: adminUser.isSuperAdmin,
            status: adminUser.status
          };
        } catch (error) {
          console.error('❌ Admin auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30, // 30 days (like most websites)
    updateAge: 60 * 60 * 24 * 7,   // refresh JWT claims at most once per week
  },
  // Enhanced cookie configuration for better security and session management
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days cookie expiry
        domain: process.env.NODE_ENV === 'production' ? getNextAuthUrl().replace(/https?:\/\//, '').split('/')[0] : undefined
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/',
  },
  // Add configuration to allow public routes
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user && account) {
        token.id = user.id;
        token.email = user.email;
        token.role = (user as any).role;
        token.username = (user as any).username;
        token.isVerified = (user as any).isVerified;
        // Add timestamp to track when token was created
        token.iat = Math.floor(Date.now() / 1000);
        token.lastValidated = Math.floor(Date.now() / 1000);
      }
      
      // Handle admin users differently
      if (token.role?.name === 'admin') {
        // For admin users, validate against users collection
        const now = Math.floor(Date.now() / 1000);
        const timeSinceLastValidation = now - (Number(token.lastValidated) || 0);
        
        if (timeSinceLastValidation > 24 * 60 * 60) { // 24 hours for admin
          try {
            const { db } = await connectToDatabase();
            const adminUser = await db.collection('users').findOne({
              _id: new ObjectId(token.id),
              'role.name': 'admin'
            });
            
            if (!adminUser) {
              // Admin user no longer exists or role changed
              return { ...token, id: '', email: '', role: undefined };
            }
            token.lastValidated = now;
          } catch (error) {
            console.error('Error validating admin user in JWT callback:', error);
          }
        }
        return token;
      }
      
      // Regular user validation (existing logic)
      const now = Math.floor(Date.now() / 1000);
      const timeSinceLastValidation = now - (Number(token.lastValidated) || 0);
      
      // Only validate token periodically, not on every request
      if (token.id && timeSinceLastValidation > 7 * 24 * 60 * 60) {
        try {
          await dbConnect();
          const userExists = await User.findById(token.id);
          if (!userExists) {
            // User was deleted from database, invalidate token
            console.log('User no longer exists in database, invalidating token');
            // Return token with cleared user data
            return { ...token, id: '', email: '' };
          }
          // Update last validated timestamp
          token.lastValidated = now;
        } catch (error) {
          console.error('Error validating user in JWT callback:', error);
          // Don't invalidate on database errors - could be temporary
          // Just keep the existing token and try again later
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      console.log('🔐 Session callback - Token:', { id: token.id, role: token.role, email: token.email });
      
      if (token && session.user) {
        // Ensure the session user object has the id and admin properties
        session.user.id = token.id as string;
        session.user.role = token.role as any; // Pass the entire role object
        session.user.username = token.username as string;
        session.user.isVerified = token.isVerified as boolean;
        
        console.log('🔐 Session callback - Updated session user:', { 
          id: session.user.id, 
          role: session.user.role, 
          email: session.user.email 
        });
        
        // Handle admin users differently
        if (token.role?.name === 'admin') {
          console.log('🔐 Session callback - Processing admin user');
          const timeSinceLastValidation = Math.floor(Date.now() / 1000) - (Number(token.lastValidated) || 0);
          
          if (timeSinceLastValidation > 24 * 60 * 60) { // 24 hours for admin
            try {
              const { db } = await connectToDatabase();
              const adminUser = await db.collection('users').findOne({
                _id: new ObjectId(token.id),
                'role.name': 'admin'
              });
              
              if (adminUser) {
                console.log('✅ Session callback - Admin user validated:', adminUser.email);
                session.user.email = adminUser.email;
                session.user.role = adminUser.role; // Pass the entire role object
                session.user.username = adminUser.username || adminUser.name;
                session.user.isVerified = adminUser.isVerified || false;
              } else {
                console.log('❌ Session callback - Admin user no longer exists or role changed');
                // Admin user no longer exists or role changed
                return { ...session, user: { id: '', email: '', name: '' } };
              }
            } catch (error) {
              console.error('❌ Session callback - Error fetching admin user:', error);
            }
          } else {
            console.log('✅ Session callback - Admin user recently validated, skipping DB check');
          }
          return session;
        }
        
        // Regular user validation (existing logic)
        const timeSinceLastValidation = Math.floor(Date.now() / 1000) - (Number(token.lastValidated) || 0);
        
        // Only fetch user data if session is very old (14 days) 
        if (timeSinceLastValidation > 14 * 24 * 60 * 60) {
          try {
            // Fetch fresh user data from database
            await dbConnect();
            const userFromDb = await User.findById(token.id);
            if (userFromDb) {
              // @ts-ignore
              session.user.createdAt = userFromDb.createdAt;
              // Update email in case it was changed
              session.user.email = userFromDb.email;
            } else {
              // User no longer exists in database
              console.log('User not found in session callback, invalidating session');
              // Return session without user data to trigger re-authentication
              return { ...session, user: { id: '', email: '', name: '' } };
            }
          } catch (error) {
            console.error('Error fetching user in session callback:', error);
            // Don't invalidate on database errors - could be temporary
            // Keep existing session data
          }
        }
      }
      
      console.log('🔐 Session callback - Final session:', { 
        userId: session.user?.id, 
        userRole: session.user?.role, 
        userEmail: session.user?.email 
      });
      return session;
    },
    async signIn({ user, account, profile }) {
      // Handle admin credentials provider
      if (account?.provider === 'admin-credentials') {
        // Admin users are already validated in the authorize callback
        return (user as any).role?.name === 'admin';
      }
      
      // Regular credentials provider validation
      if (account?.provider === 'credentials') {
        try {
          await dbConnect();
          const userExists = await User.findById(user.id);
          return !!userExists; // Only allow sign in if user exists in database
        } catch (error) {
          console.error('Error validating user during sign in:', error);
          return false;
        }
      }
      return true;
    }
  },
  // Add event handlers for better session management
  events: {
    async signOut({ token, session }) {
      // Minimal sign out logging
    },
    async session({ session, token }) {
      // Session event logging disabled for cleaner console
    }
  },
  // Disable debug mode to reduce console noise
  debug: false,
};
