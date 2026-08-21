const https = require('https');

function post(url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(body))
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + u.search,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function run() {
  try {
    console.log('Logging in to live API...');
    const loginRes = await post('https://smtnskill.thesmgroups.com/api/auth/login', {
      client_key: '59e8bb42f89d5ee93ff466be97022427',
      client_secret: 'f7a761767124aef8b904c49b52a555d6'
    });

    console.log('Login Status:', loginRes.statusCode);
    const token = loginRes.body.token;
    if (!token) {
      console.error('Failed to get token:', loginRes.body);
      return;
    }
    console.log('Token received successfully.');

    console.log('Fetching courses list from live API...');
    const coursesRes = await get('https://smtnskill.thesmgroups.com/api/lms/client/courses/', token);
    console.log('Courses Status:', coursesRes.statusCode);
    
    const iotCourse = coursesRes.body.courses_list?.find(c => c.course_unique_code === 'TSMG2026IOT');
    if (!iotCourse) {
      console.log('TSMG2026IOT not found in response');
    } else {
      console.log('Course Name:', iotCourse.name || iotCourse.title);
      console.log('is_active:', iotCourse.is_active);
      console.log('course_status:', iotCourse.course_status);
      console.log('approval_status:', iotCourse.approval_status);
      console.log('midQuiz questions count:', iotCourse.midQuiz?.questions?.length);
      console.log('finalQuiz questions count:', iotCourse.finalQuiz?.questions?.length);
      console.log('image url length:', iotCourse.course_image_url?.length);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
