import { motion } from 'framer-motion';
import '../styles/Hero.css';

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <section className="hero">
      <motion.div
        className="hero-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 className="hero-title" variants={itemVariants}>
          <span>The SM Groups</span> <br /> Engineering Excellence
        </motion.h1>

        <motion.p className="hero-subtitle" variants={itemVariants}>
          The SM Groups is a pioneering multi-divisional conglomerate driving sustainable growth, state-of-the-art engineering solutions, and digital transformation across Tamil Nadu.
        </motion.p>

        <motion.div className="hero-buttons" variants={itemVariants}>
          <motion.a
            href="#competencies"
            className="btn btn-primary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Our Competencies
          </motion.a>
          <motion.a
            href="/login"
            className="btn btn-secondary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            LMS Portal
          </motion.a>
        </motion.div>

        <motion.div className="hero-stats" variants={itemVariants}>
          <motion.div
            className="stat-item"
            whileHover={{ scale: 1.05 }}
          >
            <div className="stat-number">6+</div>
            <div className="stat-label">Years of Growth</div>
          </motion.div>
          <motion.div
            className="stat-item"
            whileHover={{ scale: 1.05 }}
          >
            <div className="stat-number">50+</div>
            <div className="stat-label">Team Experts</div>
          </motion.div>
          <motion.div
            className="stat-item"
            whileHover={{ scale: 1.05 }}
          >
            <div className="stat-number">100%</div>
            <div className="stat-label">Precision & Quality</div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}