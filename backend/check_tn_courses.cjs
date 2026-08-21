// check_tn_courses.cjs
// Checks published courses on TN LMS portal
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const CLIENT_KEY = process.env.CLIENT_KEY;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const BASE = 'https://api.skilldevelopment.tn.gov.in';

async function run() {
  console.log('🔐 Step 1: Fetching token from TN LMS...');

  // Step 1: Get Token
  const formData = new URLSearchParams();
  formData.append('client_key', CLIENT_KEY);
  formData.append('client_secret', CLIENT_SECRET);

  const tokenRes = await fetch(`${BASE}/api/v1/lms/client/token/`, {
    method: 'POST',
    body: formData
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error('❌ Token fetch failed:', tokenRes.status, err);
    process.exit(1);
  }

  const tokenData = await tokenRes.json();
  console.log('📦 Full token response:', JSON.stringify(tokenData, null, 2));

  const token = tokenData.token || tokenData.access_key || tokenData.access;
  console.log('✅ Token received:', token ? token.slice(0, 60) + '...' : 'NONE');

  if (!token) {
    console.error('❌ No token found in response:', tokenData);
    process.exit(1);
  }

  // Step 2: Try multiple URL paths for courses list
  const urlsToTry = [
    `${BASE}/api/v1/lms/client/courses/`,
    `${BASE}/lms/client/courses/`,
  ];

  for (const url of urlsToTry) {
    console.log(`\n📚 Trying: ${url}`);
    const coursesRes = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const body = await coursesRes.text();
    console.log(`   Status: ${coursesRes.status}`);
    console.log(`   Response: ${body.slice(0, 300)}`);

    if (coursesRes.ok) {
      const coursesData = JSON.parse(body);
      const list = coursesData.courses_list || coursesData.results || [];
      console.log(`\n✅ Found ${list.length} course(s) on TN Portal`);
      list.forEach((c, i) => {
        console.log(`  ${i + 1}. [${c.course_id || c.course_unique_code}] ${c.name || c.course_name} — Active: ${c.course_status ?? c.is_active}`);
      });

      const iot = list.find(c => (c.course_id || c.course_unique_code) === 'TSMG2026IOT');
      if (iot) {
        console.log('\n🎉 TSMG2026IOT is PUBLISHED on TN Portal!');
      } else {
        console.log('\n⚠️  TSMG2026IOT NOT found yet — may be pending approval.');
      }
      break;
    }
  }
}

run().catch(err => {
  console.error('❌ Unexpected error:', err.message);
  process.exit(1);
});
