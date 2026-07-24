# 📚 LearnHub - Modern Learning Management System

A production-ready, fully responsive Learning Management System (LMS) built with React.js, Vite, Framer Motion, and modern CSS.

## ✨ Features

### 🎨 Modern UI Design
- Premium SaaS design with glassmorphism effects
- Dark blue and purple gradient theme
- Smooth animations and transitions
- Responsive design across all screen sizes
- Professional hover effects and interactions

### 📱 Fully Responsive
- Mobile First Design (320px - 768px)
- Tablet Design (768px - 1024px)
- Laptop Design (1024px - 1440px)
- Desktop Design (1440px+)
- No horizontal scrolling
- Responsive navbar with hamburger menu
- Adaptive cards, grids, and forms

### 🏠 Landing Page
- Modern hero section with animated gradient background
- Floating shapes animation
- Course statistics section
- Popular courses section
- Features section
- Testimonials carousel
- Instructor showcase
- Call-to-action sections
- Scroll reveal animations

### 🔐 Authentication Pages
- Login Page with social login options
- Registration Page with form validation
- Forgot Password Page
- OTP Verification Page
- Reset Password Page
- Animated transitions and transitions

### 📚 Additional Pages
- About Us Page with company info, mission/vision, team, and timeline
- Contact Us Page with form, maps, and company details
- Dashboard Preview with progress tracking

### 🎯 Dashboard Features
- Student dashboard cards
- Progress charts
- Course progress tracking
- Attendance summary
- Certificates section
- Upcoming classes section

## 🛠 Tech Stack

- **Frontend Framework**: React 19.2.6
- **Build Tool**: Vite 8.0.12
- **Routing**: React Router DOM 7.18.0
- **Animations**: Framer Motion 12.40.0
- **Styling**: Modern CSS with Flexbox and Grid
- **Language**: JavaScript ES6+

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── Hero.jsx
│   ├── Features.jsx
│   ├── Testimonials.jsx
│   ├── DashboardPreview.jsx
│   ├── Footer.jsx
│   └── MobileMenu.jsx
│
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── About.jsx
│   ├── Contact.jsx
│   ├── ForgotPassword.jsx
│   ├── OTPVerification.jsx
│   └── ResetPassword.jsx
│
├── styles/
│   ├── Global.css
│   ├── App.css
│   ├── Navbar.css
│   ├── Hero.css
│   ├── Features.css
│   ├── Testimonials.css
│   ├── Dashboard.css
│   ├── Auth.css
│   ├── About.css
│   ├── Contact.css
│   ├── Home.css
│   └── Footer.css
│
├── App.jsx
├── App.css
├── index.css
├── main.jsx
└── vite.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Preview the build:
```bash
npm run preview
```

## 📋 Available Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Landing page with all sections |
| `/login` | Login | User login page |
| `/register` | Register | New user registration |
| `/about` | About | About us page |
| `/contact` | Contact | Contact us page |
| `/forgot-password` | ForgotPassword | Password recovery |
| `/otp-verification` | OTPVerification | OTP verification |
| `/reset-password` | ResetPassword | Reset password |

## 🎨 Design Features

### Colors
- **Primary**: #1e3c72 (Dark Blue)
- **Secondary**: #2a5298 (Blue)
- **Accent**: #7b68ee (Purple)
- **Light**: #f8f9fa
- **Text**: #333333

### Typography
- **Font Family**: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- **Font Weights**: 400, 500, 600, 700, 800

### Responsive Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Laptop**: 1024px - 1440px
- **Desktop**: 1440px+

## 🎬 Animation Features

### Framer Motion Animations
- Smooth page transitions
- Hover effects on cards and buttons
- Staggered children animations
- Scroll reveal animations
- Floating shapes animation
- Progress bar animations

### CSS Animations
- Float animations
- Glow effects
- Fade in/up animations
- Transform transitions
- Smooth scrolling

## 📱 Mobile Optimization

- **Hamburger Menu**: Responsive navigation menu
- **Touch-friendly**: Large tap targets
- **Performance**: Lazy loading and code splitting
- **Images**: Responsive images and icons
- **Forms**: Mobile-optimized forms with proper spacing
- **Typography**: Responsive font sizes

## 🔧 Customization

### Changing Colors
Edit `:root` variables in `src/index.css`:
```css
:root {
  --primary-color: #1e3c72;
  --accent-color: #7b68ee;
  /* ... */
}
```

### Adding New Routes
1. Create a new page in `src/pages/`
2. Import in `src/App.jsx`
3. Add route to `<Routes>` in App.jsx

### Creating New Components
1. Create component file in `src/components/`
2. Create corresponding CSS file in `src/styles/`
3. Import and use in pages

## 📊 Performance

- **Code Splitting**: Lazy loaded pages
- **Optimization**: Optimized animations
- **Bundle**: Minimal dependencies
- **CSS**: Organized and efficient styles

## 🔐 Security Considerations

- Form validation on all inputs
- Secure password handling
- XSS prevention with React
- CSRF protection ready

## 🤝 Contributing

Feel free to fork, modify, and improve this LMS template.

## 📝 License

This project is open source and available for personal and commercial use.

## 📞 Support

For issues, questions, or suggestions, please create an issue in the repository.

---

**Built with ❤️ using React, Vite, and Framer Motion**
