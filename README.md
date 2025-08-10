# 🎨 CaptionCraft: AI-Powered Social Media Caption Generator

> **Transform your social media presence with intelligent, image-aware caption generation powered by Google Gemini AI**

<div align="center">

![CaptionCraft Banner](https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&h=400&fit=crop&crop=entropy&auto=format&q=80)

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Google AI](https://img.shields.io/badge/Google_AI-Gemini_2.0-orange?style=for-the-badge&logo=google)](https://ai.google/)

**🎯 Perfect captions • 🚀 Boost engagement • ✨ Save time • 📈 Grow your audience**

[✨ **Try Live Demo**](https://captioncraft.vercel.app) • [📚 **Documentation**](#-comprehensive-documentation) • [🚀 **Deploy Now**](#-deployment-guide)

</div>

---

## 🌟 What Makes CaptionCraft Special?

CaptionCraft isn't just another caption generator – it's your **AI-powered creative partner** that actually *sees* and *understands* your images to create contextually perfect captions.

### 🎯 **Key Differentiators:**
- **🔍 Advanced Image Analysis**: AI analyzes colors, objects, people, and scenes
- **🎭 Mood-Driven Generation**: 16 different moods for perfect tone matching
- **🛡️ Smart Rate Limiting**: 3 free generations, 10 for registered users
- **🔐 Abuse Prevention**: Advanced security with credential blocking
- **🗑️ Auto Cleanup**: Automatic ImageKit storage management
- **📱 Fully Responsive**: Perfect experience on all devices

---

## 🚀 **Live Features Showcase**

### 🎨 **Screenshot Gallery**
> *Add your screenshots here to showcase the beautiful UI*

| Feature | Screenshot Placeholder |
|---------|----------------------|
| **Homepage with Rate Limiting** | `[Add homepage screenshot showing quota display]` |
| **Profile Management** | `[Add profile page with Cursor AI default]` |
| **Caption Generation** | `[Add generation interface screenshot]` |
| **Rate Limit Display** | `[Add quota visualization screenshot]` |

---

## ⚡ **Quick Start Guide**

### 1. **Clone & Install**
```bash
git clone https://github.com/yourusername/captioncraft.git
cd captioncraft
npm install
```

### 2. **Environment Setup**
Create `.env` file with your keys:
```env
# Database
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/captioncraft"

# Authentication
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:9002"

# AI Integration
GOOGLE_GENAI_API_KEY="your-gemini-api-key"

# Image Storage
IMAGEKIT_PUBLIC_KEY="your-imagekit-public-key"
IMAGEKIT_PRIVATE_KEY="your-imagekit-private-key"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your-endpoint"

# Email Service (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

### 3. **Launch**
```bash
npm run dev
# Open http://localhost:9002
```

---

## 🏗️ **System Architecture & Flow**

### 📊 **Application Flow Diagram**

```mermaid
graph TB
    A[User Visits Homepage] --> B[Rate Limit Check]
    B --> C{Authenticated?}
    C -->|No| D[3 Free Generations]
    C -->|Yes| E[10 Daily Generations]
    
    D --> F[Upload Image]
    E --> F
    F --> G[ImageKit Processing]
    G --> H[AI Analysis]
    H --> I[Google Gemini 2.0]
    I --> J[Generate 3 Captions]
    J --> K[Save to MongoDB]
    K --> L[Display Results]
    
    L --> M[User Actions]
    M --> N[Copy Captions]
    M --> O[Delete Captions]
    O --> P[ImageKit Cleanup]
    
    Q[Account Deletion] --> R[Block Credentials]
    R --> S[24h+ Cooling Period]
```

### 🔄 **Data Flow Architecture**

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as API Routes
    participant AI as Genkit AI
    participant DB as MongoDB
    participant IK as ImageKit
    
    U->>F: Upload Image + Mood
    F->>API: POST /api/generate-captions
    API->>API: Check Rate Limits
    API->>IK: Upload Image
    IK-->>API: Image URL
    API->>AI: Generate Captions
    AI->>AI: Analyze Image + Mood
    AI-->>API: 3 Captions Array
    API->>DB: Save Caption Set
    DB-->>API: Success
    API-->>F: Return Captions
    F-->>U: Display Results
    
    Note over U,IK: Cleanup on Delete
    U->>F: Delete Caption
    F->>API: DELETE /api/posts/[id]
    API->>IK: Delete Image
    API->>DB: Delete Record
```

---

## 📁 **Project Structure Deep Dive**

### 🌳 **Directory Tree**
```
captioncraft/
├── 📂 src/
│   ├── 🤖 ai/                          # AI Integration Layer
│   │   ├── flows/
│   │   │   └── generate-caption.ts     # Core AI logic with rate limiting
│   │   ├── genkit.ts                   # Google Gemini configuration
│   │   └── dev.ts                      # Development server
│   │
│   ├── 🌐 app/                         # Next.js App Router
│   │   ├── api/                        # Backend API Routes
│   │   │   ├── auth/                   # Authentication System
│   │   │   │   ├── [...nextauth]/route.ts    # NextAuth handler
│   │   │   │   ├── register/route.ts          # User registration
│   │   │   │   ├── forgot-password/route.ts   # Password reset
│   │   │   │   └── reset-password/route.ts    # Password update
│   │   │   ├── posts/
│   │   │   │   ├── route.ts            # Fetch user captions
│   │   │   │   └── [id]/route.ts       # Delete with ImageKit cleanup
│   │   │   ├── user/
│   │   │   │   ├── route.ts            # User profile data
│   │   │   │   ├── profile-image/route.ts     # Profile image management
│   │   │   │   └── delete/route.ts            # Account deletion + blocking
│   │   │   ├── upload/route.ts         # ImageKit integration
│   │   │   ├── generate-captions/route.ts     # Rate-limited AI endpoint
│   │   │   └── rate-limit-info/route.ts       # Quota information
│   │   │
│   │   ├── 📄 (pages)/                 # Application Pages
│   │   │   ├── page.tsx                # Homepage with generator
│   │   │   ├── profile/page.tsx        # User dashboard
│   │   │   ├── features/page.tsx       # Feature showcase
│   │   │   ├── about/page.tsx          # About page
│   │   │   ├── contact/page.tsx        # Contact form
│   │   │   ├── pricing/page.tsx        # Pricing tiers
│   │   │   ├── reset-password/page.tsx # Password reset UI
│   │   │   └── [other-pages]/          # Additional pages
│   │   │
│   │   ├── globals.css                 # Global styles + scrollbar hiding
│   │   └── layout.tsx                  # Root layout with providers
│   │
│   ├── 🧩 components/                  # React Components
│   │   ├── ui/                         # ShadCN UI Components
│   │   │   ├── button.tsx, card.tsx, etc.
│   │   │   └── ...                     # Complete UI kit
│   │   ├── caption-generator.tsx       # Main generation interface
│   │   ├── rate-limit-display.tsx      # Quota visualization
│   │   ├── auth-form.tsx              # Login/register forms
│   │   ├── auth-modal.tsx             # Authentication modal
│   │   ├── server-header.tsx          # Navigation header
│   │   ├── footer.tsx                 # Site footer
│   │   └── providers.tsx              # Context providers
│   │
│   ├── 🔧 lib/                        # Core Utilities
│   │   ├── auth.ts                    # NextAuth configuration
│   │   ├── db.ts                      # MongoDB connection
│   │   ├── mail.ts                    # Email service
│   │   ├── rate-limit.ts              # Rate limiting system
│   │   ├── imagekit-utils.ts          # Image cleanup utilities
│   │   └── utils.ts                   # Helper functions
│   │
│   ├── 📊 models/                     # Database Schemas
│   │   ├── User.ts                    # User account structure
│   │   ├── Post.ts                    # Caption storage (array format)
│   │   ├── Contact.ts                 # Contact form submissions
│   │   ├── RateLimit.ts               # Usage tracking
│   │   ├── BlockedCredentials.ts      # Abuse prevention
│   │   └── DeletedProfile.ts          # Account deletion audit
│   │
│   └── 🎯 context/                    # React Context
│       └── AuthModalContext.tsx       # Global auth state
│
├── 📋 Configuration Files
│   ├── next.config.ts                 # Next.js configuration
│   ├── tailwind.config.ts             # Tailwind CSS setup
│   ├── components.json                # ShadCN component config
│   ├── tsconfig.json                  # TypeScript configuration
│   └── package.json                   # Dependencies & scripts
│
└── 📚 Documentation
    ├── README.md                      # This comprehensive guide
    ├── new_features.md                # Feature changelog
    ├── help.md                        # User documentation
    └── flow.md                        # Technical flow diagrams
```

### 🔍 **File Responsibilities Matrix**

| File | Primary Responsibility | Key Features |
|------|----------------------|--------------|
| `ai/flows/generate-caption.ts` | AI caption generation | Rate limiting, image analysis, database storage |
| `app/api/generate-captions/route.ts` | API endpoint for captions | Request validation, IP tracking |
| `lib/rate-limit.ts` | Usage quotas & abuse prevention | Database persistence, credential blocking |
| `components/rate-limit-display.tsx` | User quota visualization | Real-time updates, progress bars |
| `lib/imagekit-utils.ts` | Image storage management | Auto cleanup, batch operations |
| `app/api/user/delete/route.ts` | Account deletion | Credential blocking, audit logging |
| `models/Post.ts` | Caption storage schema | Array format for efficiency |
| `lib/auth.ts` | Authentication system | 30-day sessions, passive validation |

---

## 🎯 **Advanced Features Breakdown**

### 🛡️ **Smart Rate Limiting System**
```typescript
// Anonymous Users: 3 generations/day
// Authenticated Users: 10 generations/day
// Database-persistent with automatic cleanup
```

**Key Components:**
- **Database Tracking**: MongoDB with TTL indexes
- **IP + User Identification**: Comprehensive tracking
- **Visual Feedback**: Real-time quota display
- **Graceful Degradation**: Fallback to in-memory storage

### 🚫 **Advanced Abuse Prevention**
```typescript
// Account deletion → 24h credential block (escalating)
// Rate limit bypass detection
// Suspicious activity monitoring
```

**Security Layers:**
- **Credential Blocking**: Prevent immediate re-registration
- **Escalating Timeouts**: 24h → 48h → 72h → 7 days max
- **Audit Logging**: Complete activity tracking
- **IP Monitoring**: Cross-user pattern detection

### 🗑️ **Automatic Resource Cleanup**
```typescript
// ImageKit integration with automatic cleanup
// Caption deletion → Image deletion
// Profile updates → Old image cleanup
```

**Cleanup Triggers:**
- Caption deletion
- Profile image updates
- Account deletion
- Batch cleanup operations

### 📱 **Responsive Design System**
```css
/* Global scrollbar hiding */
/* Mobile-first responsive utilities */
/* Touch-friendly interfaces */
```

**Design Features:**
- **Hidden Scrollbars**: Clean aesthetic across browsers
- **Responsive Grid**: Adaptive layouts for all devices
- **Touch Optimization**: 44px minimum touch targets
- **Progressive Enhancement**: Works without JavaScript

---

## 🔧 **Technical Implementation**

### 🤖 **AI Integration Architecture**
```typescript
// Google Gemini 2.0 Flash via Genkit
// Image analysis + contextual understanding
// Mood-driven prompt engineering
```

**AI Pipeline:**
1. **Image Upload** → ImageKit processing
2. **Mood Selection** → Prompt customization  
3. **AI Analysis** → Visual element detection
4. **Caption Generation** → 3 unique variations
5. **Database Storage** → Single document with array

### 🔐 **Authentication & Security**
```typescript
// NextAuth.js v5 with JWT strategy
// 30-day sessions with passive validation
// Comprehensive session management
```

**Security Features:**
- **JWT Tokens**: Secure, stateless authentication
- **Session Persistence**: 30-day duration like major platforms
- **Passive Validation**: Minimal server calls
- **Cookie Security**: HttpOnly, SameSite, Secure flags

### 📊 **Database Design**
```typescript
// Optimized MongoDB schemas
// Efficient caption storage (array format)
// Automatic indexing and cleanup
```

**Schema Optimizations:**
- **Caption Arrays**: Single document vs. multiple documents
- **TTL Indexes**: Automatic data expiration
- **Compound Indexes**: Optimized query performance
- **Audit Trails**: Complete activity logging

---

## 🚀 **Deployment Guide**

### ☁️ **Vercel Deployment (Recommended)**

1. **Repository Setup**
```bash
git add .
git commit -m "Production ready"
git push origin main
```

2. **Vercel Configuration**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

3. **Environment Variables**
```env
# Production URLs
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Database & Services
MONGODB_URI=mongodb+srv://...
GOOGLE_GENAI_API_KEY=...
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=...

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=...
SMTP_PASSWORD=...
```

### 🌐 **Alternative Platforms**

| Platform | Best For | Setup Complexity |
|----------|----------|------------------|
| **Vercel** | Next.js apps | ⭐ Easy |
| **Netlify** | Static sites | ⭐⭐ Medium |
| **Railway** | Full-stack apps | ⭐⭐ Medium |
| **DigitalOcean** | Custom control | ⭐⭐⭐ Advanced |

---

## 🛠️ **Development Workflow**

### 🔧 **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint checking
npm run type-check   # TypeScript validation
```

### 🧪 **Testing Strategy**
```bash
# Rate Limiting Tests
# 1. Generate 3 captions as anonymous
# 2. Verify limit reached message
# 3. Register account
# 4. Verify 10 generation quota

# Abuse Prevention Tests  
# 1. Delete account
# 2. Attempt immediate re-registration
# 3. Verify blocking message

# ImageKit Cleanup Tests
# 1. Upload profile image
# 2. Update with new image  
# 3. Verify old image deletion
```

### 🐛 **Common Issues & Solutions**

| Issue | Solution |
|-------|----------|
| Rate limit not working | Check MongoDB connection |
| Images not deleting | Verify ImageKit credentials |
| Auth session issues | Clear browser cache |
| Email not sending | Check SMTP configuration |

---

## 🎨 **Customization Guide**

### 🎭 **Adding New Moods**
```typescript
// In src/components/caption-generator.tsx
const moods = [
  "🎉 Celebratory / Festive",
  "🌟 Your Custom Mood",
  // Add your moods here
];
```

### 🎨 **Theming System**
```css
/* In src/app/globals.css */
:root {
  --primary: your-brand-color;
  --secondary: your-accent-color;
  /* Customize color scheme */
}
```

### 📊 **Rate Limit Configuration**
```typescript
// In src/lib/rate-limit.ts
export const RATE_LIMITS = {
  ANONYMOUS: {
    MAX_GENERATIONS: 5,    // Increase free tier
    WINDOW_HOURS: 24,
  },
  AUTHENTICATED: {
    MAX_GENERATIONS: 25,   // Increase paid tier
    WINDOW_HOURS: 24,
  },
};
```

---

## 📈 **Performance Optimizations**

### ⚡ **Built-in Optimizations**
- **Image Lazy Loading**: Faster initial page loads
- **Code Splitting**: Reduced JavaScript bundles
- **Server Components**: Optimal rendering strategy
- **Static Generation**: Pre-built pages where possible
- **Edge Functions**: Global distribution

### 📊 **Monitoring & Analytics**
- **Rate Limit Tracking**: Usage pattern analysis
- **Error Logging**: Comprehensive error tracking
- **Performance Metrics**: Core Web Vitals monitoring
- **User Analytics**: Engagement tracking

---

## 🤝 **Contributing**

### 🌟 **How to Contribute**

1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Submit pull request**

### 📋 **Contribution Guidelines**
- Follow TypeScript best practices
- Maintain responsive design
- Add proper error handling
- Update documentation
- Test rate limiting impact

### 🎯 **Priority Areas**
- [ ] Additional AI models integration
- [ ] Advanced analytics dashboard  
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Enterprise features

---

## 📞 **Support & Community**

### 🆘 **Getting Help**
- 📖 **Documentation**: Check `help.md` for detailed guides
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/captioncraft/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/captioncraft/discussions)
- 📧 **Direct Support**: support@captioncraft.com

### 🌍 **Community**
- 🐦 **Twitter**: [@CaptionCraft](https://twitter.com/captioncraft)
- 📘 **LinkedIn**: [CaptionCraft](https://linkedin.com/company/captioncraft)
- 📱 **Discord**: [Join Community](https://discord.gg/captioncraft)

---

## 📜 **License & Legal**

### 📄 **License**
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### 🔒 **Privacy & Security**
- **GDPR Compliant**: European data protection standards
- **Data Encryption**: All sensitive data encrypted
- **No Data Selling**: Your data stays private
- **Transparent Policies**: Clear privacy documentation

---

## 🎉 **Acknowledgments**

### 🙏 **Special Thanks**
- **Google AI Team**: For Gemini 2.0 Flash capabilities
- **Vercel**: For seamless deployment platform  
- **MongoDB**: For reliable database infrastructure
- **ImageKit**: For powerful image processing
- **Open Source Community**: For incredible tools

### 🏆 **Built With Excellence**
- **Next.js 15**: Latest React framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **ShadCN/UI**: Beautiful component library
- **MongoDB**: Flexible database solution

---

<div align="center">

## 🚀 **Ready to Transform Your Social Media?**

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/captioncraft)

**[🌟 Star on GitHub](https://github.com/yourusername/captioncraft)** • **[🚀 Try Live Demo](https://captioncraft.vercel.app)** • **[📚 Read Docs](./help.md)**

---

### 💝 **Made with ❤️ for creators worldwide**

*CaptionCraft - Where AI meets creativity*

**Last Updated**: January 2025 • **Version**: 2.0 • **Status**: Production Ready

</div>
