# 🦄 Unicorn Web Services (UWS)

> A comprehensive cloud platform providing scalable infrastructure services with an intuitive dashboard and AI-powered assistance.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0+-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🌟 Overview

Unicorn Web Services (UWS) is a modern cloud platform that provides developers and businesses with essential cloud infrastructure services. Built with Next.js 14 and powered by AI, UWS offers a seamless experience for managing storage, databases, compute resources, serverless functions, message queues, and secrets.

## 🚀 Key Features

### 🏗️ **6 Core Cloud Services**
- **☁️ Object Storage** - S3-compatible storage with public/private buckets
- **🗃️ Database Services** - PostgreSQL and MongoDB with high availability
- **⚙️ Compute Services** - Containerized instances with auto-scaling
- **⚡ Lambda Functions** - Serverless computing with multiple runtimes
- **📋 Message Queue** - Reliable FIFO and standard queues
- **🔐 Secrets Manager** - Encrypted storage for sensitive data

### 🏠 **Customizable Dashboard**
- **🖱️ Drag & Drop** - Rearrange dashboard cards to your preference
- **📊 Real-time Metrics** - Live service statistics and monitoring
- **🎨 Multiple Layouts** - Grid, compact, rows, and masonry layouts
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile

### 🤖 **AI-Powered Assistant**
- **💬 Intelligent Chat** - Get help with any UWS service
- **🧠 Service Knowledge** - Comprehensive understanding of all features
- **💰 Cost Optimization** - Smart recommendations for reducing expenses
- **🔧 Troubleshooting** - Expert assistance with technical issues

### 📊 **Advanced Monitoring**
- **📈 CloudWatch-style Metrics** - Comprehensive monitoring dashboard
- **🚨 Custom Alarms** - Set up alerts for important thresholds
- **📧 Notifications** - Multiple notification channels
- **📱 Real-time Updates** - Live status monitoring

## 🛠️ Technology Stack

### **Frontend**
- **⚛️ Next.js 14** - React framework with App Router
- **🔷 TypeScript** - Type-safe development
- **🎨 Tailwind CSS** - Utility-first CSS framework
- **🧩 shadcn/ui** - Modern component library
- **🎭 Radix UI** - Headless accessible components
- **🎯 Heroicons** - Beautiful SVG icons

### **AI Integration**
- **🤖 Google Gemini API** - Advanced AI capabilities
- **💬 Real-time Chat** - Instant responses and assistance

### **State Management**
- **⚛️ React Context** - Global state management
- **💾 Local Storage** - Persistent user preferences
- **🔄 Real-time Updates** - Live data synchronization

### **UI/UX**
- **🖱️ @dnd-kit** - Drag and drop functionality
- **📱 Responsive Design** - Mobile-first approach
- **🌙 Dark/Light Mode** - Theme switching
- **♿ Accessibility** - WCAG compliant

## 📁 Project Structure

```
unicorn-web-services/
├── 📁 uws-web-app/               # Frontend Application
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── 📁 dashboard/     # Dashboard components
│   │   │   │   ├── 📁 cards/     # Service preview cards
│   │   │   │   ├── dashboard-context.tsx
│   │   │   │   └── dashboard-templates.tsx
│   │   │   ├── 📁 layout/        # Layout components
│   │   │   │   ├── app-header.tsx
│   │   │   │   ├── app-sidebar.tsx
│   │   │   │   └── resizable-layout.tsx
│   │   │   ├── 📁 ui/            # shadcn/ui components
│   │   │   └── ai-chatbot.tsx    # AI assistant
│   │   ├── 📁 pages/
│   │   │   ├── 📁 app/           # Main application pages
│   │   │   │   ├── 📁 services/  # Service-specific pages
│   │   │   │   ├── index.tsx     # Dashboard
│   │   │   │   ├── monitoring.tsx # Monitoring dashboard
│   │   │   │   └── billing.tsx   # Billing management
│   │   │   └── _app.tsx          # App configuration
│   │   ├── 📁 hooks/             # Custom React hooks
│   │   ├── 📁 styles/            # Global styles
│   │   └── 📁 lib/               # Utility functions
│   ├── 📄 package.json
│   ├── 📄 tailwind.config.js
│   ├── 📄 tsconfig.json
│   └── 📄 next.config.js
└── 📁 uws-backend/               # Backend API (separate repository)
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0 or later
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/unicorn-web-services.git
   cd unicorn-web-services/uws-web-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Configure the following variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Backend Setup

The frontend requires the UWS backend API to be running. Please refer to the backend documentation for setup instructions.

## 📊 Available Services

### ☁️ Object Storage
- **S3-compatible API** for seamless integration
- **Bucket management** with public/private access
- **File upload/download** with drag & drop interface
- **Object lifecycle** management and versioning
- **💰 Pricing**: $0.021/GB/month

### 🗃️ Database Services
- **PostgreSQL** with high availability and automated backups
- **MongoDB** for NoSQL document storage
- **Query editor** with advanced filtering capabilities
- **Real-time monitoring** and performance metrics
- **💰 Pricing**: From $15/month per database

### ⚙️ Compute Services
- **Docker containers** with custom images
- **Auto-scaling** based on demand
- **Load balancing** for high availability
- **Instance management** with full lifecycle control
- **💰 Pricing**: From $0.012/hour per instance

### ⚡ Lambda Functions
- **Multiple runtimes** (Node.js, Python, etc.)
- **Event-driven execution** with various triggers
- **Built-in code editor** with syntax highlighting
- **Version control** and deployment management
- **💰 Pricing**: $0.20/1M requests + compute time

### 📋 Message Queue
- **FIFO and standard queues** for reliable messaging
- **Dead letter queues** for failed message handling
- **Batch operations** and long polling support
- **Message attributes** and metadata management
- **💰 Pricing**: 1M requests free, then $0.50/million

### 🔐 Secrets Manager
- **Encrypted storage** for API keys and passwords
- **Hierarchical organization** with path-based structure
- **Version history** and rollback capabilities
- **Secure sharing** with access control
- **💰 Pricing**: $0.50/secret/month

## 🤖 AI Assistant Features

The integrated AI chatbot provides:

- **📚 Service Guidance** - Comprehensive help with all UWS services
- **💰 Cost Optimization** - Smart recommendations to reduce expenses
- **🔧 Troubleshooting** - Expert assistance with technical issues
- **📖 Documentation** - Instant access to feature explanations
- **🚀 Best Practices** - Architecture and deployment recommendations

### Using the AI Assistant

1. Click the **floating chat button** in the bottom-right corner
2. Ask questions about any UWS service or feature
3. Get instant, contextual responses
4. Use **quick action buttons** for common queries

Example queries:
- "How much does storage cost?"
- "How do I set up a database?"
- "What's the best way to deploy a Lambda function?"
- "How can I monitor my resources?"

## 📊 Dashboard Customization

### Adding Cards
1. Click the **"Add Card"** button on the dashboard
2. Choose from **Service Cards** or **General Cards**
3. The card will be added to your dashboard

### Rearranging Cards
- **Drag and drop** cards to rearrange them
- Changes are **automatically saved** to local storage
- **Resize cards** by selecting different size options

### Layout Templates
Choose from pre-built templates:
- **Classic Dashboard** - Traditional grid with service overview
- **Executive Overview** - High-level metrics and KPIs
- **Monitoring Focus** - Detailed service status and performance
- **Services Overview** - Complete overview of all UWS services

## 🎨 Theming

UWS supports both **dark** and **light** themes:

- Toggle using the **theme button** in the header
- Preference is **automatically saved**
- **System theme** detection available
- **Consistent styling** across all components

## 📱 Responsive Design

UWS is fully responsive and optimized for:

- **Desktop** - Full feature set with resizable sidebar
- **Tablet** - Adapted layout with touch interactions
- **Mobile** - Streamlined interface with collapsible navigation

## 🔐 Authentication

UWS uses **JWT-based authentication**:

- **Secure login** with token persistence
- **Auto-refresh** token management
- **Protected routes** for authenticated content
- **Session management** with automatic logout

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Configuration

For production deployment, ensure these environment variables are set:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_GEMINI_API_KEY=your_production_gemini_key
```

### Deployment Platforms

UWS can be deployed on:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS**
- **Google Cloud Platform**
- **Self-hosted** with Docker

## 🧪 Development

### Running Tests

```bash
npm run test
# or
yarn test
```

### Linting

```bash
npm run lint
# or
yarn lint
```

### Type Checking

```bash
npm run type-check
# or
yarn type-check
```

## 📈 Performance

UWS is optimized for performance with:

- **Next.js App Router** for optimal loading
- **Server Components** where applicable
- **Code splitting** for smaller bundles
- **Image optimization** for faster loading
- **Efficient state management** with minimal re-renders

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- **User Guide** - Comprehensive feature documentation
- **API Reference** - Complete API documentation
- **Tutorials** - Step-by-step guides

### Getting Help
- **AI Assistant** - Built-in chat support
- **GitHub Issues** - Bug reports and feature requests
- **Community** - Join our developer community

### Contact
- **Email**: support@unicornwebservices.com
- **Website**: https://unicornwebservices.com
- **Documentation**: https://docs.unicornwebservices.com

---

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **shadcn** for the beautiful component library
- **Tailwind CSS** for the utility-first CSS framework
- **Google** for the Gemini AI API
- **Open Source Community** for the incredible tools and libraries

---

<div align="center">
  <p>Made with ❤️ by the UWS Team</p>
  <p>
    <a href="https://unicornwebservices.com">Website</a> •
    <a href="https://docs.unicornwebservices.com">Documentation</a> •
    <a href="https://github.com/your-org/unicorn-web-services">GitHub</a>
  </p>
</div>
