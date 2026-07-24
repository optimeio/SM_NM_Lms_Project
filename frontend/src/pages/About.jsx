import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/About.css';

export default function About() {
  const executives = [
    {
      name: 'Sankarganesh R',
      role: 'CEO & Founder',
      credentials: 'B.E (Mechanical) · M.Tech (Energy Technology)',
      tags: ['CEO & Founder', 'Project Head', 'Team Leader', 'Trainer', 'Designer'],
      vision: 'Engineering Excellence, Accelerating Innovation',
      bio: 'An accomplished mechanical engineer and visionary entrepreneur, Sankarganesh R founded SM Groups with a mission to transform industry standards through technological innovation. With a B.E in Mechanical Engineering and an M.Tech in Energy Technology, he brings deep technical expertise and strategic foresight to every initiative. He leads a team of 50+ professionals across 9 divisions, driving sustainable growth and pioneering solutions that place SM Groups at the forefront of Salem\'s industrial and digital transformation.',
      image: '/sankarganesh.png'
    },
    {
      name: 'Ganga P',
      role: 'Managing Director',
      credentials: 'B.Com · M.Com',
      tags: ['Managing Director', 'Brand Management', 'Operations', 'Business Strategy'],
      vision: 'Innovation, Sustainability & Excellence',
      bio: 'A commerce-driven visionary and strategic leader, Ganga P oversees SM Groups\' day-to-day operations, brand positioning, and long-term strategic direction. Holding a B.Com and M.Com, she brings a sharp business acumen and deep understanding of market dynamics to every decision. Under her leadership, SM Groups has significantly strengthened its brand presence across Tamil Nadu, streamlined operations for efficiency, and built scalable systems that support the group\'s ambitious growth roadmap across all nine divisions.',
      image: 'https://www.thesmgroups.com/assets/ganga.jpg'
    }
  ];

  const stats = [
    { value: '9', label: 'Divisions' },
    { value: '50+', label: 'Team Experts' },
    { value: '100+', label: 'Projects Completed' },
    { value: '100%', label: 'Precision & Quality' },
  ];

  const timeline = [
    { year: '2020', desc: 'SM Groups founded by Sankarganesh R with a vision for engineering innovation' },
    { year: '2022', desc: 'Expanded services across 9 core industrial and digital divisions' },
    { year: '2024', desc: 'Established regional headquarters in Fairlands, Salem' },
    { year: '2026', desc: 'Pioneering sustainable energy and IT integration in Tamil Nadu' },
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
        className="about-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="container">
          <motion.div
            className="about-hero-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1>About <span>The SM Groups</span></h1>
            <p>Engineering Excellence, Accelerating Innovation across Industrial & Digital Frontiers</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <section className="about-section">
        <div className="about-content">
          {/* Mission & Vision */}
          <div className="mission-vision">
            <motion.div
              className="mission-box"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2>Our Mission</h2>
              <p>
                To deliver state-of-the-art technological and engineering solutions, setting new benchmarks 
                for operational efficiency, sustainability, and quality across Salem and Tamil Nadu.
              </p>
            </motion.div>

            <motion.div
              className="vision-box"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2>Our Vision</h2>
              <p>
                To lead industrial and digital transformation by fostering a culture of innovation, 
                excellence, and sustainable growth, creating value for our clients and the community.
              </p>
            </motion.div>
          </div>

          {/* Statistics */}
          <div className="stats-grid" style={{ marginBottom: '80px' }}>
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="stat-item"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Executive Leadership Section - Dark Card Design */}
          <section className="exec-section">
            <div className="team-header">
              <h2 className="section-title">Executive Leadership</h2>
              <p className="section-subtitle">The driving force behind The SM Groups' success</p>
            </div>

            <div className="exec-grid">
              {executives.map((exec, index) => (
                <motion.div
                  key={index}
                  className="exec-card"
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                >
                  {/* Circular Photo */}
                  <div className="exec-photo-wrap">
                    <img
                      src={exec.image}
                      alt={`${exec.name} - ${exec.role}`}
                      className="exec-photo"
                      loading="lazy"
                    />
                  </div>

                  {/* Role Badge */}
                  <div className="exec-role-badge">
                    <span className={`role-dot ${index === 0 ? 'dot-red' : 'dot-green'}`}></span>
                    {exec.role.toUpperCase()}
                  </div>

                  {/* Name */}
                  <h3 className="exec-name">{exec.name}</h3>

                  {/* Credentials */}
                  <p className="exec-credentials">{exec.credentials}</p>

                  {/* Tags */}
                  <div className="exec-tags">
                    {exec.tags.map((tag, tIndex) => (
                      <span key={tIndex} className="exec-tag">{tag}</span>
                    ))}
                  </div>

                  {/* Vision */}
                  <div className="exec-vision-label">VISION</div>
                  <p className="exec-vision-quote">&ldquo;{exec.vision}&rdquo;</p>

                  {/* Bio */}
                  <p className="exec-bio">{exec.bio}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Timeline */}
          <section className="timeline-section">
            <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '60px' }}>Our Journey</h2>
            <div className="timeline">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  className="timeline-item"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-year">{item.year}</div>
                    <div className="timeline-description">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </>
  );
}