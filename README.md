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

CaptionCraft isn't just another caption generator – it's your **AI-powered creative partner** that actually *sees* and *understands* your images to create contextually perfect captions with maximum variety.

### 🎯 **Key Differentiators:**
- **🔍 Advanced Image Analysis**: AI analyzes colors, objects, people, and scenes
- **🎭 Mood-Driven Generation**: 21 different moods for perfect tone matching
- **🔄 Maximum Caption Variety**: 3 completely different caption styles every time
- **🛡️ Smart Rate Limiting**: 3 free generations, 25 for registered users
- **🔐 Advanced Admin Security**: JWT-based production-ready admin system
- **🗑️ Auto Cleanup**: Automatic ImageKit storage management
- **📱 Fully Responsive**: Perfect experience on all devices
- **⚡ Optimized Performance**: Streamlined processes and database optimization
- **🛡️ Robust Error Handling**: Graceful fallback for all failure scenarios

---

## 🚀 **Live Features Showcase**

### 🎨 **Screenshot Gallery**
> *Screenshots will be added to the `/screenshots` folder*

| Feature | Screenshot | Description |
|---------|------------|-------------|
| **🏠 Homepage & Main Interface** | `screenshots/01-homepage-main.png` | Main caption generation interface with image upload |
| **📸 Image Upload & Preview** | `screenshots/02-image-upload.png` | Drag & drop image upload with preview |
| **🎭 Mood Selection** | `screenshots/03-mood-selection.png` | 21 different mood options for caption generation |
| **✨ Caption Generation** | `screenshots/04-caption-generation.png` | AI-generated captions with variety |
| **🔄 Regenerate for Variety** | `screenshots/05-regenerate-variety.png` | Get completely different caption styles |
| **👤 User Authentication** | `screenshots/06-user-auth.png` | Login, registration, and profile management |
| **📊 Rate Limiting & Quotas** | `screenshots/07-rate-limiting.png` | Quota display and rate limiting information |
| **🔐 Admin Dashboard** | `screenshots/08-admin-dashboard.png` | Super admin system with user management |
| **⚙️ Admin Setup** | `screenshots/09-admin-setup.png` | Secure JWT-based admin setup process |
| **📱 Mobile Responsiveness** | `screenshots/10-mobile-responsive.png` | Mobile-first design across all devices |
| **🎨 Dark Mode Theme** | `screenshots/11-dark-mode.png` | Beautiful dark theme with proper contrast |
| **📧 Password Reset System** | `screenshots/12-password-reset.png` | Enhanced password reset with email integration |
| **🚫 Unauthorized Access** | `screenshots/13-unauthorized.png` | Creative unauthorized access page |

---

## 🆕 **Latest Features & Enhancements (v2.1)**

### **🎯 Enhanced AI Caption Engine - Maximum Variety**
- **🔄 Smart Diversity System**: AI automatically detects and regenerates similar captions
- **🎲 Randomization Seeds**: Each generation gets unique timestamp and random seed
- **🎭 Mood-Specific Instructions**: 21 moods with tailored language guidelines
- **🚫 Anti-Duplication Rules**: Prevents similar structures, phrases, and emojis
- **🎨 Creative Variations**: Different sentence lengths, punctuation, and emoji placement
- **🔄 Regenerate Button**: Get completely different caption styles for the same image

### **🔐 Production-Ready Admin System**
- **🔑 JWT-Based Security**: Secure token system for production deployment
- **📧 Email Integration**: Tokens sent via Brevo SMTP to authorized emails
- **🛡️ Separate Admin Database**: Dedicated AdminUser model for security
- **👑 Super Admin Role**: Full system access and user management
- **🚫 Unauthorized Access Handling**: Creative security pages instead of 404s

### **📧 Enhanced Email System**
- **📬 Brevo SMTP Integration**: Professional email delivery service
- **🔐 Secure Token Delivery**: JWT tokens sent to authorized admin emails
- **📱 Spam Folder Instructions**: Clear guidance for email delivery
- **⚡ Automated Workflows**: Password reset and admin setup automation

### **🎨 UI/UX Improvements**
- **📱 Mobile-First Design**: Perfect experience across all device sizes
- **🌙 Dark Mode Optimization**: Fixed contrast issues and theme consistency
- **✨ Loading States**: Enhanced loading indicators and user feedback
- **🎯 Form Optimization**: Streamlined forms with better validation
- **💡 User Guidance**: Helpful tips and instructions throughout the interface

---

## ⚡ **Quick Start Guide**

### 1. **Prerequisites & System Requirements**
```bash
# Minimum Requirements
Node.js: 18.0.0 or higher
npm: 8.0.0 or higher
MongoDB: 5.0 or higher (Atlas recommended)
Memory: 512MB RAM minimum
Storage: 100MB free space

# Recommended Requirements  
Node.js: 20.0.0 LTS
npm: 10.0.0 or higher
MongoDB: 7.0 or higher
Memory: 1GB RAM or higher
Storage: 500MB free space
```

### 2. **Clone & Install**
```bash
git clone https://github.com/yourusername/captioncraft.git
cd captioncraft
npm install
```

### 3. **Environment Setup**
Copy the enhanced environment template:
```bash
cp docs/env.example .env
```

**Required Environment Variables:**
```env
# Database (REQUIRED)
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/captioncraft"

# Authentication (REQUIRED)
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:9002"

# AI Integration (REQUIRED)
GOOGLE_API_KEY="your-gemini-api-key"

# Image Storage (REQUIRED)
IMAGEKIT_PUBLIC_KEY="your-imagekit-public-key"
IMAGEKIT_PRIVATE_KEY="your-imagekit-private-key"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your-endpoint"

# Admin Setup Security (CRITICAL)
JWT_SECRET="your-super-secure-jwt-secret-key"

# Email Service (Required for Admin Setup)
SMTP_HOST="smtp-relay.sendinblue.com"
SMTP_PORT="587"
SMTP_USER="your-brevo-username"
SMTP_PASS="your-brevo-password"
SMTP_FROM="your-from-email@domain.com"
```

**Generate Secure Secrets:**
```bash
# Generate NextAuth secret
openssl rand -hex 32

# Generate JWT secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

### 4. **Launch**
```bash
npm run dev
# Open http://localhost:9002
```

---

## 🔐 **Admin System Setup**

### **🚀 Production-Ready JWT System**
1. **Set JWT_SECRET** in your environment variables
2. **Deploy to Vercel** with proper environment variables
3. **Visit `/setup`** page in production
4. **Click "Get Token"** button (restricted to authorized emails)
5. **Token sent via email** to `sunnyshinde2601@gmail.com`
6. **Verify token** and create admin account
7. **Access admin dashboard** at `/admin/dashboard`

### **🔑 Local Development Setup**
```bash
# Generate production JWT token
npm run generate-production-jwt

# Setup super admin
npm run setup-super-admin

# Test super admin
npm run test-super-admin
```

---

## 🎯 **AI Caption Generation Features**

### **🔄 Maximum Caption Variety**
- **3 Different Styles**: Direct, Emotional, and Trendy approaches
- **Smart Diversity Check**: AI automatically regenerates similar captions
- **Mood-Specific Language**: Tailored instructions for each of 21 moods
- **Randomization Seeds**: Unique generation every time
- **Anti-Duplication**: Prevents similar structures and patterns

### **🎭 Available Moods (21 Options)**
- **😊 Happy / Cheerful** - Upbeat, positive vibes
- **😍 Romantic / Flirty** - Sweet, intimate language
- **😎 Cool / Confident** - Bold, powerful statements
- **😜 Fun / Playful** - Humorous, casual tone
- **🤔 Thoughtful / Deep** - Reflective, philosophical
- **😌 Calm / Peaceful** - Zen, mindfulness vibes
- **😢 Sad / Emotional** - Vulnerable, relatable feelings
- **😏 Sassy / Savage** - Attitude, bold confidence
- **😲 Surprised / Excited** - Energetic, hype language
- **🌅 Aesthetic / Artsy** - Artistic, visual descriptions
- **👔 Formal / Professional** - Business, polished tone
- **📈 Business / Corporate** - Success, achievement focus
- **📝 Informative / Educational** - Fact-based, learning
- **🎩 Elegant / Sophisticated** - Luxury, refined language
- **🏖 Casual / Chill** - Relaxed, comfortable vibes
- **🔥 Motivational / Inspirational** - Inspiring, power words
- **🎉 Celebratory / Festive** - Party, celebration vibes
- **⚡ Bold / Daring** - Daring, confident tone
- **🌍 Travel / Adventure** - Exploration, wanderlust
- **🍔 Foodie / Culinary** - Delicious, appetite appeal
- **🐾 Pet / Cute** - Adorable, lovable language
- **🎵 Musical / Rhythmic** - Beat, lyrical style

---

## 🔒 **Security & Privacy**

### **Data Protection:**
- **GDPR Compliant**: European data protection standards
- **Data Encryption**: All sensitive data encrypted at rest and in transit
- **No Data Selling**: Your data stays private and is never shared
- **Transparent Policies**: Clear privacy documentation and data handling

### **Security Features:**
- **Rate Limiting**: Prevents abuse and brute force attacks
- **JWT-Based Admin**: Secure token system for production
- **Session Security**: NextAuth.js with configurable expiry
- **IP Monitoring**: Suspicious activity detection and blocking
- **Input Validation**: Comprehensive request validation and sanitization
- **Separate Admin Database**: Isolated admin user management

---

## 🏗️ **System Architecture & Flow**

### 📊 **Application Flow Diagram**

```mermaid
graph TB
    A[User Visits Homepage] --> B[Rate Limit Check]
    B --> C{Authenticated?}
    C -->|No| D[3 Free Generations]
    C -->|Yes| E[25 Monthly Generations]
    
    D --> F[Upload Image]
    E --> F
    F --> G[AI Image Analysis]
    G --> H[Caption Generation]
    H --> I[Diversity Check]
    I -->|Similar| J[Regenerate]
    I -->|Diverse| K[Display Captions]
    J --> H
    K --> L[Save to Database]
```

### 🔐 **Admin System Flow**

```mermaid
graph TB
    A[Admin Setup Request] --> B[Email Verification]
    B --> C[JWT Token Generation]
    C --> D[Token Sent via Email]
    D --> E[Token Verification]
    E --> F[Admin Account Creation]
    F --> G[Access Admin Dashboard]
    G --> H[User Management]
    G --> I[System Monitoring]
```

---

## 📱 **Responsive Design Features**

### **Mobile-First Approach:**
- **Touch-Friendly Interface**: Proper touch targets and gestures
- **Responsive Grid**: Adapts to all screen sizes
- **Progressive Enhancement**: Features scale appropriately
- **Mobile-Optimized Forms**: Easy input on small screens

### **Cross-Device Compatibility:**
- **Desktop**: Full-featured experience with advanced controls
- **Tablet**: Optimized layout for medium screens
- **Mobile**: Streamlined interface for small screens
- **All Devices**: Consistent functionality across platforms

---

## 🚀 **Deployment & Production**

### **Vercel Deployment:**
1. **Connect Repository** to Vercel
2. **Set Environment Variables** in Vercel dashboard
3. **Deploy** with automatic builds
4. **Configure Custom Domain** (optional)
5. **Monitor Performance** with Vercel analytics

### **Environment Variables for Production:**
```env
# Required for Production
JWT_SECRET=your-super-secure-jwt-secret-key
MONGODB_URI=your-production-mongodb-uri
NEXTAUTH_SECRET=your-production-nextauth-secret
NEXTAUTH_URL=https://yourdomain.vercel.app
GOOGLE_API_KEY=your-production-gemini-api-key

# Email Service (Brevo SMTP)
SMTP_HOST=smtp-relay.sendinblue.com
SMTP_PORT=587
SMTP_USER=your-brevo-username
SMTP_PASS=your-brevo-password
SMTP_FROM=your-from-email@domain.com
```

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

## 📚 **Comprehensive Documentation**

### **📖 Core Documentation:**
- **README.md** - This comprehensive guide (you're reading it!)
- **docs/SETUP.md** - Detailed setup instructions
- **docs/help.md** - User documentation & troubleshooting
- **docs/ADMIN_SETUP.md** - Admin system setup guide
- **docs/API_DOCUMENTATION.md** - Complete API reference
- **docs/TROUBLESHOOTING.md** - Comprehensive troubleshooting guide

### **🔧 Technical Documentation:**
- **docs/flow.md** - Authentication flow & architecture
- **docs/commands.md** - Command reference & scripts
- **docs/new_features.md** - Feature changelog & updates
- **docs/blueprint.md** - Design guidelines & specifications
- **VERCEL_DEPLOYMENT_GUIDE.md** - Production deployment guide
- **docs/PRODUCTION_TOKEN_SYSTEM.md** - JWT-based admin system
- **docs/SUPER_ADMIN_SYSTEM.md** - Super admin capabilities

### **📋 Quick Reference:**
- **Environment Variables**: `docs/env.example`
- **API Endpoints**: `docs/API_DOCUMENTATION.md`
- **Admin Setup**: `docs/ADMIN_SETUP.md`
- **Troubleshooting**: `docs/TROUBLESHOOTING.md`

---

## 📞 **Support & Community**

### 🆘 **Getting Help**
- 📖 **Documentation**: Check the comprehensive docs above
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/captioncraft/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/captioncraft/discussions)
- 📧 **Direct Support**: ai.captioncraft@outlook.com

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
- **Brevo**: For professional email delivery
- **Open Source Community**: For incredible tools

### 🏆 **Built With Excellence**
- **Next.js 15**: Latest React framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **ShadCN/UI**: Beautiful component library
- **MongoDB**: Flexible database solution
- **NextAuth.js**: Secure authentication
- **Google Gemini AI**: Advanced image analysis

---

<div align="center">

## 🚀 **Ready to Transform Your Social Media?**

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/captioncraft)

**[🌟 Star on GitHub](https://github.com/yourusername/captioncraft)** • **[🚀 Try Live Demo](https://captioncraft.vercel.app)** • **[📚 Read Docs](./help.md)**

---

### 💝 **Made with ❤️ for creators worldwide**

*CaptionCraft - Where AI meets creativity*

**Last Updated**: January 2025 • **Version**: 2.1 • **Status**: Production Ready

</div>
