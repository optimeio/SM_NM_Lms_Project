# 🚀 LearnHub Development Guide

## Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 3. Build for Production
```bash
npm run build
```

## 📝 Code Style Guidelines

### Components
- Use functional components with hooks
- Use Framer Motion for animations
- Keep components small and reusable
- Use prop drilling minimally

### Styling
- Use CSS files organized by component
- Follow responsive design principles
- Use CSS Grid and Flexbox
- Mobile-first approach

### File Naming
- Components: PascalCase (Hero.jsx)
- CSS files: Match component name (Hero.css)
- Pages: PascalCase (Login.jsx)

## 🔄 Workflow

### Adding a New Page
1. Create page file in `src/pages/`
2. Create styles in `src/styles/`
3. Add import to `src/App.jsx`
4. Add route to `<Routes>` component

Example:
```jsx
// In App.jsx
import NewPage from './pages/NewPage';

// In <Routes>
<Route path="/new-page" element={<NewPage />} />
```

### Adding a New Component
1. Create component in `src/components/`
2. Create CSS in `src/styles/`
3. Import CSS in component
4. Use in pages

Example:
```jsx
// src/components/MyComponent.jsx
import '../styles/MyComponent.css';

export default function MyComponent() {
  return <div className="my-component">Content</div>;
}
```

## 🎨 Responsive Design Tips

### Breakpoints
```css
/* Desktop (1440px+) */
/* Laptop (1024px - 1440px) */
@media (max-width: 1024px) { }

/* Tablet (768px - 1024px) */
@media (max-width: 768px) { }

/* Mobile (320px - 768px) */
@media (max-width: 576px) { }
```

### Common Patterns
```css
/* Grid to Single Column */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

## 🎬 Using Framer Motion

### Page Transition
```jsx
import { motion } from 'framer-motion';

export default function Page() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      Content
    </motion.div>
  );
}
```

### Hover Effects
```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

### Scroll Reveal
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
>
  Content appears on scroll
</motion.div>
```

## 🔍 Debugging

### Common Issues

1. **Component not rendering**
   - Check route path in App.jsx
   - Verify component export is default
   - Check CSS import path

2. **Styles not applying**
   - Clear browser cache
   - Check CSS class names match
   - Verify CSS file is imported

3. **Framer Motion not animating**
   - Ensure motion component is used
   - Check initial and animate props
   - Verify viewport settings for scroll animations

## 📱 Mobile Testing

### Browser DevTools
- F12 to open DevTools
- Ctrl+Shift+M to toggle device toolbar
- Test all breakpoints

### Common Mobile Issues
- Hamburger menu not working → Check state management
- Touch targets too small → Increase padding
- Forms not responsive → Use width: 100%

## 🎯 Performance Tips

### Optimization
- Use lazy loading for images
- Code splitting with lazy components
- Optimize animations (reduce transforms)
- Minimize CSS bundle

### React Performance
```jsx
// Use lazy loading for pages
const Home = lazy(() => import('./pages/Home'));

// In App.jsx
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<Home />} />
  </Routes>
</Suspense>
```

## 🚨 Common Patterns

### Form Handling
```jsx
const [formData, setFormData] = useState({
  email: '',
  password: '',
});

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData({
    ...formData,
    [name]: value,
  });
};

const handleSubmit = (e) => {
  e.preventDefault();
  console.log(formData);
};
```

### Conditional Rendering
```jsx
{isSubmitted ? (
  <div>Success Message</div>
) : (
  <form onSubmit={handleSubmit}>
    Form fields
  </form>
)}
```

## 📚 Resources

- [React Documentation](https://react.dev)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [React Router Docs](https://reactrouter.com/)
- [Vite Documentation](https://vitejs.dev/)

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
npx kill-port 5173
```

### Clear Cache
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### Hard Refresh Browser
- Ctrl+Shift+R (Windows/Linux)
- Cmd+Shift+R (Mac)

---

**Happy coding! 🎉**
