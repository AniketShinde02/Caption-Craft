import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Extends the built-in session model to include the 'id' property.
   */
  interface Session {
    user: {
      /** The user's unique identifier. */
      id: string;
    } & DefaultSession['user']; // Inherit the default properties
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extends the built-in JWT model to include the 'id' property.
   */
  interface JWT {
    /** The user's unique identifier. */
    id: string;
  }
}
