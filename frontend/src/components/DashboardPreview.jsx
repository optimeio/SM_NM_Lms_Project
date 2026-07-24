import { motion } from 'framer-motion';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const dashboardCards = [
    { icon: '🏢', value: '9', label: 'Active Divisions' },
    { icon: '👥', value: '52', label: 'Expert Engineers' },
    { icon: '⚡', value: '148', label: 'Projects Delivered' },
    { icon: '🔍', value: '15+', label: 'Staging Audits' },
  ];

  const projectProgress = [
    { name: 'Mechanical Design & Simulation', progress: 95 },
    { name: 'Solar Grid Energy Auditing', progress: 80 },
    { name: 'IT Digital Platform Deployment', progress: 90 },
    { name: 'Automation System Testing', progress: 75 },
  ];

  return (
    <section className="dashboard-section">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2 className="section-title">Operations Dashboard</h2>
          <p className="section-subtitle">Real-time enterprise metrics & project tracking</p>
        </div>

        {/* Dashboard Cards */}
        <div className="dashboard-grid">
          {dashboardCards.map((card, index) => (
            <motion.div
              key={index}
              className="dashboard-card"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="card-icon">{card.icon}</div>
              <div className="card-value">{card.value}</div>
              <div className="card-label">{card.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Progress Section */}
        <motion.div
          className="progress-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="section-title" style={{ marginBottom: '30px', fontSize: '24px' }}>Project Phase Completion</h3>
          {projectProgress.map((project, index) => (
            <div key={index} className="progress-item">
              <div className="progress-header">
                <span className="progress-title">{project.name}</span>
                <span className="progress-percentage">{project.progress}%</span>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${project.progress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                ></motion.div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Chart Section */}
        <motion.div
          className="chart-container"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="chart-placeholder">
            📊 Industrial Resource Allocation & Growth Chart
          </div>
        </motion.div>
      </div>
    </section>
  );
}
