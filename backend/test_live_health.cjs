const https = require('https');

function getHealth() {
  https.get('https://smtnskill.thesmgroups.com/api/health', (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      console.log('Health:', data);
    });
  }).on('error', err => {
    console.error('Error fetching health:', err.message);
  });
}

getHealth();
