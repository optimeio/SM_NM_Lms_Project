import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Course from './models/Course.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ Connected to MongoDB Atlas');

const newMidQuiz = {
  title: 'Mid-Course Quiz (After Video 6) - 25 Marks',
  totalMarks: 25,
  questions: [
    { question: 'What does IoT stand for?', options: ['Internet of Things', 'Integration of Technology', 'Internal Operating Terminal', 'Interface of Telecom'], correctAnswer: 0, marks: 1 },
    { question: 'Which of the following is an example of an embedded system?', options: ['A desktop computer', 'A microwave oven controller', 'A web browser', 'A spreadsheet application'], correctAnswer: 1, marks: 1 },
    { question: 'Which device is commonly used as the core hardware in this course?', options: ['Arduino Mega', 'Raspberry Pi', 'STM32', 'ESP8266'], correctAnswer: 1, marks: 1 },
    { question: 'What is the primary function of a sensor in an IoT system?', options: ['Store data permanently', 'Sense physical parameters from the environment', 'Provide internet connectivity', 'Power the microcontroller'], correctAnswer: 1, marks: 1 },
    { question: 'Which of these is a real-world example of IoT application discussed in Day 1?', options: ['Smart City Monitoring', 'Video Editing Software', 'Word Processing', 'Spreadsheet Automation'], correctAnswer: 0, marks: 1 },
    { question: 'GPIO stands for:', options: ['General Purpose Input Output', 'Global Processing Input Operation', 'General Program Interface Output', 'Graphics Processing Input Output'], correctAnswer: 0, marks: 1 },
    { question: 'What operating system is commonly used on Raspberry Pi for embedded projects?', options: ['Windows', 'Linux-based OS (Raspberry Pi OS)', 'macOS', 'MS-DOS'], correctAnswer: 1, marks: 1 },
    { question: 'In Day 2, what basic hands-on activity was performed?', options: ['Sensor calibration', 'LED control through GPIO', 'Cloud dashboard setup', 'Data encryption'], correctAnswer: 1, marks: 1 },
    { question: 'Which protocol is NOT covered under embedded communication protocols in Day 4?', options: ['I2C', 'SPI', 'UART', 'HTTP'], correctAnswer: 3, marks: 1 },
    { question: 'SPI stands for:', options: ['Serial Peripheral Interface', 'System Program Interface', 'Simple Protocol Integration', 'Serial Program Input'], correctAnswer: 0, marks: 1 },
    { question: 'UART is mainly used for:', options: ['Parallel data transfer', 'Serial communication between devices', 'Wireless communication', 'Power management'], correctAnswer: 1, marks: 1 },
    { question: 'Which sensor is used for temperature and humidity sensing in Day 5?', options: ['Ultrasonic sensor', 'DHT11 sensor', 'IR sensor', 'LDR sensor'], correctAnswer: 1, marks: 1 },
    { question: 'What does an ultrasonic sensor primarily measure?', options: ['Temperature', 'Humidity', 'Distance', 'Light intensity'], correctAnswer: 2, marks: 1 },
    { question: 'What is the case study discussed for sensor interfacing in Day 5?', options: ['Smart Agriculture Monitoring', 'Smart City Monitoring', 'Industrial Automation Networks', 'Smart Home Control Devices'], correctAnswer: 0, marks: 1 },
    { question: 'What is the purpose of data logging in IoT systems?', options: ['To delete unnecessary data', 'To record and store data for future use', 'To increase network speed', 'To reduce sensor accuracy'], correctAnswer: 1, marks: 1 },
    { question: 'Which Day covers "Data Logging and Real-Time Monitoring"?', options: ['Day 3', 'Day 4', 'Day 5', 'Day 6'], correctAnswer: 3, marks: 1 },
    { question: 'Which of the following best describes "embedded software"?', options: ['Software that only runs on cloud servers', 'Software designed to run on a specific hardware device for dedicated tasks', 'Software used only for gaming', 'Software with no hardware interaction'], correctAnswer: 1, marks: 1 },
    { question: 'What is the main advantage of using I2C over UART?', options: ['I2C supports multiple devices on the same bus using addressing', 'I2C is wireless', 'I2C does not require any wiring', 'I2C is used only for audio devices'], correctAnswer: 0, marks: 1 },
    { question: 'In an IoT architecture, which layer is responsible for collecting data from the environment?', options: ['Application Layer', 'Perception Layer', 'Cloud Layer', 'Security Layer'], correctAnswer: 1, marks: 1 },
    { question: 'What kind of exercise was assigned in Day 2 related to GPIO?', options: ['GPIO pin mapping exercise', 'Sensor comparison exercise', 'Cloud integration exercise', 'Data encryption exercise'], correctAnswer: 0, marks: 1 },
    { question: 'Which industry case study relates to communication protocols in Day 4?', options: ['Smart Agriculture Monitoring', 'Industrial Automation Networks', 'Industrial Equipment Monitoring', 'Smart City Monitoring'], correctAnswer: 1, marks: 1 },
    { question: 'Push-button controlled LED is an example of:', options: ['Analog signal processing', 'Digital input/output interfacing', 'Wireless communication', 'Cloud data storage'], correctAnswer: 1, marks: 1 },
    { question: 'Why is Linux commonly preferred for embedded systems like Raspberry Pi?', options: ['It is heavy and requires high processing power', 'It is lightweight, open-source, and customizable', 'It only works with Windows applications', 'It cannot handle hardware-level programming'], correctAnswer: 1, marks: 1 },
    { question: 'What is the key learning outcome expected by the end of Day 5?', options: ['Students can design cloud dashboards', 'Students can interface sensors and capture live data', 'Students can configure wireless networks', 'Students can build a mobile app'], correctAnswer: 1, marks: 1 },
    { question: 'Which of these is an example of an actuator?', options: ['Temperature sensor', 'Motor or relay', 'Camera module', 'Push button'], correctAnswer: 1, marks: 1 }
  ]
};

const updated = await Course.findOneAndUpdate(
  { course_unique_code: 'TSMG2026IOT' },
  { $set: { midQuiz: newMidQuiz } },
  { new: true }
);

if (updated) {
  console.log(`✅ Successfully updated Mid Quiz for: ${updated.course_name} (NTEDU0001)`);
  // Update local manifest file as well
  const manifestPath = path.join(__dirname, 'courses', 'NTEDU0001', 'manifest.json');
  if (mongoose.connection.readyState === 1 && updated.folderPath) {
    const localManifestPath = path.join(updated.folderPath, 'manifest.json');
    try {
      if (mongoose.connection.readyState === 1) {
        const manifestData = JSON.parse(fs.readFileSync(localManifestPath, 'utf8'));
        manifestData.midQuiz = newMidQuiz;
        fs.writeFileSync(localManifestPath, JSON.stringify(manifestData, null, 2));
        console.log('✅ Local manifest file updated.');
      }
    } catch (e) {
      // ignore
    }
  }
} else {
  console.log('❌ Course NTEDU0001 not found.');
}

await mongoose.disconnect();
process.exit(0);
