/**
 * Environment Configuration
 * Centralized configuration to prevent URL and trailing slash issues
 */

export const envConfig = {
  // NextAuth Configuration
  nextAuth: {
    url: process.env.NEXTAUTH_URL || 
         (process.env.NODE_ENV === 'production' 
           ? 'https://ai-caption-generator-pied.vercel.app' 
           : 'http://localhost:3000'),
    secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production',
  },
  
  // App Configuration
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 
         (process.env.NODE_ENV === 'production' 
           ? 'https://ai-caption-generator-pied.vercel.app' 
           : 'http://localhost:3000'),
    environment: process.env.NODE_ENV || 'development',
  },
  
  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/captioncraft',
  },
  
  // Email Configuration
  email: {
    from: process.env.SMTP_FROM || process.env.EMAIL_FROM || 'noreply@captioncraft.com',
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    }
  }
};

/**
 * Get properly formatted NextAuth URL with trailing slash
 */
export const getNextAuthUrl = (): string => {
  const url = envConfig.nextAuth.url;
  return url.endsWith('/') ? url : url + '/';
};

/**
 * Get base URL without trailing slash
 */
export const getBaseUrl = (): string => {
  const url = envConfig.app.url;
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

/**
 * Check if running in production
 */
export const isProduction = (): boolean => {
  return envConfig.app.environment === 'production';
};

/**
 * Validate environment configuration
 */
export const validateEnv = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!envConfig.nextAuth.secret || envConfig.nextAuth.secret === 'fallback-secret-change-in-production') {
    errors.push('NEXTAUTH_SECRET is not set or using fallback value');
  }
  
  if (!envConfig.database.uri) {
    errors.push('MONGODB_URI is not set');
  }
  
  if (isProduction() && !envConfig.email.smtp.host) {
    errors.push('SMTP configuration is missing for production');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Log configuration on import
console.log('🔧 Environment Configuration Loaded:', {
  environment: envConfig.app.environment,
  nextAuthUrl: getNextAuthUrl(),
  baseUrl: getBaseUrl(),
  hasSecret: !!envConfig.nextAuth.secret,
  hasDatabase: !!envConfig.database.uri
});

export default envConfig;
