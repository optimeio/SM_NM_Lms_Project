import { motion } from 'framer-motion';
import '../styles/Features.css';

export default function Features() {
  const competencies = [
    {
      icon: '⚙️',
      title: 'Engineering Excellence',
      description: 'Precision mechanical engineering and energy technology solutions'
    },
    {
      icon: '📈',
      title: 'Strategic Brand Management',
      description: 'Strengthening brand presence and operations across Tamil Nadu'
    },
    {
      icon: '🌱',
      title: 'Sustainable Innovation',
      description: 'Pioneering clean energy technology and resource optimization'
    },
  ];

  const animateVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <>
      {/* Competencies Section */}
      <section className="features-section" id="competencies">
        <div className="features-header">
          <h2 className="section-title">Core Competencies</h2>
          <p className="section-subtitle">Driving growth and transforming industry standards through strategic innovation</p>
        </div>
        <div className="features-grid">
          {competencies.map((comp, index) => (
            <motion.div
              key={index}
              className="feature-card"
              variants={animateVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
            >
              <div className="feature-icon">{comp.icon}</div>
              <h3 className="feature-title">{comp.title}</h3>
              <p className="feature-description">{comp.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
