
import type {NextAuthOptions} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// Debug: Check NextAuth environment variables
console.log('🔐 NextAuth Environment Check:', {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'undefined',
  NODE_ENV: process.env.NODE_ENV || 'undefined',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing'
});


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
        
        // Return a plain, serializable object. This is the critical fix.
        return {
          id: user._id.toString(),
          email: user.email,
        };
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
        domain: process.env.NODE_ENV === 'production' ? process.env.NEXTAUTH_URL?.replace(/https?:\/\//, '').split('/')[0] : undefined
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
  // Enhanced callbacks with better error handling and session validation
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user && account) {
        token.id = user.id;
        token.email = user.email;
        // Add timestamp to track when token was created
        token.iat = Math.floor(Date.now() / 1000);
        token.lastValidated = Math.floor(Date.now() / 1000);
      }
      
      // Only validate token periodically, not on every request
      const now = Math.floor(Date.now() / 1000);
      const timeSinceLastValidation = now - (Number(token.lastValidated) || 0);
      
      // Completely disable database validation - too aggressive
      // Only validate user existence if token is very old (7 days)
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
      if (token && session.user) {
        // Ensure the session user object has the id
        session.user.id = token.id as string;
        
        // Only fetch user data if we haven't validated recently
        const timeSinceLastValidation = Math.floor(Date.now() / 1000) - (Number(token.lastValidated) || 0);
        
        // Completely disable session validation - too aggressive
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
      return session;
    },
    async signIn({ user, account, profile }) {
      // Additional sign-in validation
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
