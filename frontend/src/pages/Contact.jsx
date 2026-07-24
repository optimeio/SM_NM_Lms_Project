import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/Contact.css';

export default function Contact() {
  const infoCards = [
    {
      icon: '📍',
      title: 'Our Office',
      details: ['IInd Floor, OM Shiva Towers', '259-B, Advaitha Ashram Rd', 'Fairlands, Salem - 636004'],
    },
    {
      icon: '📞',
      title: 'Phone',
      details: ['+91 94883 16728', 'Mon - Sat: 9am - 7pm'],
    },
    {
      icon: '✉️',
      title: 'Email',
      details: ['thesmgroups@gmail.com', 'Response within 24h'],
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <motion.div
        className="contact-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1>Get In Touch</h1>
          <p>We'd love to hear from you. Reach out through our office or contact information below.</p>
        </motion.div>
      </motion.div>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-layout">
            {/* Left Column: Contact Cards */}
            <motion.div 
              className="contact-info-column"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {infoCards.map((card, index) => (
                <motion.div
                  key={index}
                  className="info-card-row"
                  variants={cardVariants}
                  whileHover={{ x: 5 }}
                >
                  <div className="info-card-icon">{card.icon}</div>
                  <div className="info-card-body">
                    <h3>{card.title}</h3>
                    {card.details.map((detail, i) => (
                      <p key={i}>{detail}</p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Right Column: Quick Info & Support commitment */}
            <div className="contact-details-column">
              <motion.div
                className="company-details-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h3>Quick Info</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <div className="detail-label">Business Hours</div>
                    <div className="detail-value">Mon - Sat: 9AM - 7PM IST</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Response Time</div>
                    <div className="detail-value">Within 24 Hours</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Founded</div>
                    <div className="detail-value">2020</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Scope</div>
                    <div className="detail-value">Industrial & Digital</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="support-policy-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <h3>Our Support Commitment</h3>
                <ul className="policy-list">
                  <li>
                    <strong>Engineering Support</strong>
                    <span>Direct line to specialized system technicians and managers.</span>
                  </li>
                  <li>
                    <strong>SLA Standards</strong>
                    <span>Critical issues addressed with response guarantees.</span>
                  </li>
                  <li>
                    <strong>Operational Transparency</strong>
                    <span>Regular milestones shared through staging updates.</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}