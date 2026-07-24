import { motion } from 'framer-motion';
import '../styles/Testimonials.css';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Dr. Ramesh K.',
      role: 'Director, Apex Industries (Chennai)',
      avatar: 'RK',
      text: 'The SM Groups transformed our manufacturing operations with their custom automation systems. Their mechanical engineering precision is top-notch!',
      rating: 5
    },
    {
      name: 'Shanmuga Sundaram',
      role: 'Operations Head, Salem Energy Grid',
      avatar: 'SS',
      text: 'Their auditing and solar installation team was outstanding. We saved 35% on industrial energy costs within the first two quarters.',
      rating: 5
    },
    {
      name: 'Nirmala Devi',
      role: 'Founder, Creative Tech Corp',
      avatar: 'ND',
      text: 'We partnered with SM Groups for IT system development and brand management. Exceptional scaling roadmap, design, and execution.',
      rating: 5
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <h2 className="section-title">What Our Clients Say</h2>
          <p className="section-subtitle">Delivering high-precision solutions and building lasting partnerships</p>
        </div>

        <div className="testimonials-carousel">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="testimonial-card"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="star">⭐</span>
                ))}
              </div>

              <p className="testimonial-text">"{testimonial.text}"</p>

              <div className="testimonial-author">
                <div className="author-avatar">{testimonial.avatar}</div>
                <div className="author-info">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
