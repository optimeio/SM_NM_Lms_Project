import { motion } from 'framer-motion';
import '../styles/Footer.css';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const footerSections = [
    {
      title: 'Company',
      links: ['About Us', 'Careers', 'Blog', 'Press']
    },
    {
      title: 'Product',
      links: ['Features', 'Pricing', 'Security', 'Updates']
    },
    {
      title: 'Support',
      links: ['Help Center', 'Contact', 'FAQ', 'Community']
    }
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="back-to-top-container">
          <button onClick={scrollToTop} className="back-to-top-btn" aria-label="Back to top">
            <span className="arrow-up">↑</span> Back to Top
          </button>
        </div>

        <div className="footer-content">
          <motion.div
            className="footer-section about"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="footer-logo">
              <img src="/logo.png" alt="The SM Groups Logo" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <p className="footer-description">
              Engineering Excellence, Accelerating Innovation across our industrial and digital solutions.
            </p>
          </motion.div>

          {footerSections.map((section, index) => (
            <motion.div
              key={index}
              className="footer-section"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (index + 1) * 0.1 }}
            >
              <h3>{section.title}</h3>
              <ul>
                {section.links.map((link, i) => (
                  <li key={i}><a href="#">{link}</a></li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; 2026 The SM Groups. All rights reserved.</p>
          </div>
          <div className="footer-links-bottom">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
