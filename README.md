# 🚀 Droppy - Local File Sharing Made Simple

<div align="center">

![Droppy Banner](https://img.shields.io/badge/Droppy-File%20Sharing-blue?style=for-the-badge&logo=files&logoColor=white)
[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://peerdropper-production.up.railway.app/)
[![GitHub](https://img.shields.io/badge/GitHub-ahmed86--star-181717?style=for-the-badge&logo=github)](https://github.com/ahmed86-star)

**A modern, real-time file sharing application with device discovery, QR code generation, and image format conversion**

[✨ Features](#-features) • [🛠️ Tech Stack](#️-tech-stack) • [🚀 Quick Start](#-quick-start) • [📱 Usage](#-usage) • [🌐 Deployment](#-deployment)

</div>

---

## ✨ Features

### 📁 **File Sharing**
- 🎯 **Drag & Drop**: Effortlessly upload files with drag-and-drop support
- 📦 **Large Files**: Support for files up to 100MB each
- 🔄 **Real-time Transfers**: Live progress tracking for all file uploads
- ⚡ **Multi-file Support**: Upload and manage multiple files simultaneously
- 🗑️ **Bulk Actions**: Delete all files with one click using confirmation dialog

### 🔗 **QR Code Generator**
- 📱 **Instant QR Codes**: Generate QR codes from any URL or text
- 💾 **Download**: Save QR codes as PNG images
- 📋 **Copy to Clipboard**: Quick copy functionality for sharing
- 🎨 **High Quality**: Crystal clear QR codes optimized for scanning

### 🖼️ **Image Format Converter**
- 🔒 **100% Private**: All processing happens in your browser - images never leave your device
- ⚡ **Lightning Fast**: Client-side conversion with no server uploads
- 🎯 **Multiple Formats**:
  - **Input**: PNG, JPEG, WebP, AVIF, GIF, SVG, BMP, HEIC/HEIF
  - **Output**: PNG, JPEG, WebP
- 🎛️ **Quality Control**: Adjustable compression (1-100%)
- 📊 **Compression Stats**: See before/after file sizes in real-time
- 📦 **Batch Processing**: Convert multiple images at once
- 🗜️ **ZIP Packaging**: Automatic ZIP creation for bulk downloads
- 🖱️ **Drag & Drop**: Drop images or entire folders for conversion

### 📲 **Device Discovery**
- 🔍 **Auto Discovery**: Find and connect to devices on your network
- 📸 **QR Code Scanning**: Quick device pairing with QR codes
- 💬 **Real-time Messaging**: Send messages between connected devices
- 🔄 **Live Updates**: WebSocket-powered instant synchronization

### 🎨 **User Experience**
- 🌓 **Dark Mode**: Beautiful dark theme with smooth transitions
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- 🎯 **Context Menus**: Right-click files for quick actions (download, share, delete)
- 🔔 **Toast Notifications**: Clear feedback for all actions
- ⌨️ **Keyboard Shortcuts**: Enhanced productivity with shortcuts

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ **React 18** - Modern UI library with TypeScript
- 🎨 **Tailwind CSS** - Utility-first styling framework
- 🧩 **Shadcn UI** - Beautiful, accessible component library
- 📡 **TanStack Query** - Powerful server state management
- 🔀 **Wouter** - Lightweight client-side routing
- 🎭 **Radix UI** - Unstyled, accessible UI primitives
- 🔧 **React Hook Form** - Performant form validation
- ✅ **Zod** - TypeScript-first schema validation

### Backend
- 🟢 **Node.js** - JavaScript runtime
- 🚂 **Express.js** - Fast, minimalist web framework
- 🔌 **WebSocket (ws)** - Real-time bidirectional communication
- 🗄️ **PostgreSQL** - Robust relational database
- 🛡️ **Drizzle ORM** - Type-safe database operations
- ☁️ **Neon Serverless** - Serverless PostgreSQL platform

### Additional Tools
- 📸 **qrcode** - QR code generation
- 🔍 **qr-scanner** - QR code scanning
- 🗜️ **JSZip** - Client-side ZIP file creation
- 🖼️ **Canvas API** - Browser-based image processing
- ⚡ **Vite** - Next-generation build tool
- 🎯 **TypeScript** - Type-safe JavaScript

---

## 🚀 Quick Start

### Prerequisites
- 📋 Node.js 20 or higher
- 🗄️ PostgreSQL database (or Neon serverless)

### Installation

1️⃣ **Clone the repository**
```bash
git clone https://github.com/ahmed86-star/droppy.git
cd droppy
```

2️⃣ **Install dependencies**
```bash
npm install
```

3️⃣ **Set up environment variables**
```bash
# Create .env file
DATABASE_URL=your_postgresql_connection_string
```

4️⃣ **Run database migrations**
```bash
npm run db:push
```

5️⃣ **Start the development server**
```bash
npm run dev
```

6️⃣ **Open your browser**
```
http://localhost:5000
```

---

## 📱 Usage

### File Sharing
1. 📂 Navigate to the **Share Files** tab
2. 🖱️ Drag and drop files or click to select
3. 📤 Files are automatically uploaded and shared
4. 📥 Download, share, or delete files using the context menu

### QR Code Generator
1. 🔗 Switch to the **QR Generator** tab
2. 📝 Enter any URL or text
3. ✨ Click "Generate QR Code"
4. 💾 Download or copy to clipboard

### Image Format Converter
1. 🖼️ Go to the **Image Converter** tab
2. 📁 Drop images or select files
3. 🎯 Choose output format (PNG, JPEG, WebP)
4. 🎛️ Adjust quality slider (1-100%)
5. ⚡ Click "Convert Images"
6. 📦 Download individually or all as ZIP

### Device Discovery
1. 📱 Scan QR code in the sidebar to connect devices
2. 💬 Send messages between connected devices
3. 📡 Real-time synchronization across all devices

---

## 🌐 Deployment

### Deploy on Replit
1. 🔗 Import your repository to Replit
2. ⚙️ Set up environment variables (DATABASE_URL)
3. 🚀 Click "Deploy" and choose deployment type
4. 🌍 Connect your custom domain in deployment settings

### Deploy on Railway
1. 🔗 Connect your GitHub repository
2. ⚙️ Set environment variables
3. 🚀 Railway automatically deploys from main branch
4. 🌍 Configure custom domain in project settings

### Environment Variables
```bash
DATABASE_URL=your_neon_postgres_url
PORT=5000 (automatically set by hosting provider)
```

---

## 📂 Project Structure

```
droppy/
├── 📁 client/              # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── lib/            # Utilities and helpers
│   │   └── hooks/          # Custom React hooks
├── 📁 server/              # Backend Express server
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database operations
│   ├── websocket.ts        # WebSocket server
│   └── index.ts            # Server entry point
├── 📁 shared/              # Shared types and schemas
│   └── schema.ts           # Database schema
└── 📁 uploads/             # File upload directory
```

---

## 🎯 Key Highlights

### 🔒 **Privacy First**
- Image conversion happens entirely in your browser
- No data ever leaves your device during conversion
- Secure file transfers with real-time encryption

### ⚡ **Performance**
- Client-side image processing for instant results
- WebSocket connections for real-time updates
- Optimized bundle size with code splitting

### 🎨 **Beautiful UI**
- Modern, clean design with attention to detail
- Smooth animations and transitions
- Fully responsive across all devices
- Dark mode support with theme persistence

### 🛡️ **Robust Architecture**
- Type-safe TypeScript throughout
- Validated schemas with Zod
- Error handling and toast notifications
- Database transactions for data integrity

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🔀 Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- 🎨 UI Components by [Shadcn UI](https://ui.shadcn.com/)
- 🎭 Icons from [Font Awesome](https://fontawesome.com/)
- 📡 WebSocket library by [ws](https://github.com/websockets/ws)
- 🖼️ Image processing with Canvas API
- 🗜️ ZIP creation by [JSZip](https://stuk.github.io/jszip/)

---

<div align="center">

### 💝 Built with love by [ahmed86-star](https://github.com/ahmed86-star)

[![GitHub followers](https://img.shields.io/github/followers/ahmed86-star?style=social)](https://github.com/ahmed86-star)

**If you found this project helpful, please consider giving it a ⭐!**

</div>

---

## 📞 Support

Need help? Have questions?

- 📧 Open an issue on GitHub
- 💬 Start a discussion in the repository
- 🐛 Report bugs via GitHub Issues

---

<div align="center">

**Made with ❤️ using React, TypeScript, and modern web technologies**

[⬆ Back to Top](#-droppy---local-file-sharing-made-simple)

</div>
