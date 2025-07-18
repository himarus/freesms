// server.js
const express = require('express');
const axios = require('axios');
const qs = require('qs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

function normalizeNumber(raw) {
  let number = raw.replace(/\D/g, '');
  if (number.startsWith('09')) return '+63' + number.slice(1);
  if (number.startsWith('9') && number.length === 10) return '+63' + number;
  if (number.startsWith('63') && number.length === 12) return '+' + number;
  if (number.startsWith('+63') && number.length === 13) return number;
  return null;
}

function generateDeviceId() {
  return crypto.randomBytes(8).toString('hex');
}

function randomUserAgent() {
  const agents = [
    'Dalvik/2.1.0 (Linux; Android 10; TECNO KE5 Build/QP1A.190711.020)',
    'Dalvik/2.1.0 (Linux; Android 11; Infinix X6810 Build/RP1A.200720.011)',
    'Dalvik/2.1.0 (Linux; Android 12; itel L6506 Build/SP1A.210812.016)',
    'Dalvik/2.1.0 (Linux; Android 14; TECNO KL4 Build/UP1A.231005.007)'
  ];
  return agents[Math.floor(Math.random() * agents.length)];
}

app.get('/', (req, res) => {
  res.send('✅ SMS API is online');
});

app.get('/send', async (req, res) => {
  const { number: inputNumber, text: inputText } = req.query;

  if (!inputNumber || !inputText) {
    return res.status(400).json({ error: 'Missing number or text parameter' });
  }

  const normalized = normalizeNumber(inputNumber);
  if (!normalized) {
    return res.status(400).json({ error: 'Invalid number format' });
  }

  const suffix = '-freed0m';
  const finalText = inputText.endsWith(suffix) ? inputText : `${inputText} ${suffix}`;

  const payload = [
    'free.text.sms',
    '412',
    normalized,
    'DEVICE',
    'fjsx9-G7QvGjmPgI08MMH0:APA91bGcxiqo05qhojnIdWFYpJMHAr45V8-kdccEshHpsci6UVaxPH4X4I57Mr6taR6T4wfsuKFJ_T-PBcbiWKsKXstfMyd6cwdqwmvaoo7bSsSJeKhnpiM',
    finalText,
    ''
  ];

  const postData = qs.stringify({
    humottaee: 'Processing',
    '$Oj0O%K7zi2j18E': JSON.stringify(payload),
    device_id: generateDeviceId()
  });

  const config = {
    method: 'POST',
    url: 'https://sms.m2techtronix.com/v13/sms.php',
    headers: {
      'User-Agent': randomUserAgent(),
      'Connection': 'Keep-Alive',
      'Accept-Encoding': 'gzip',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept-Charset': 'UTF-8'
    },
    data: postData
  };

  try {
    const response = await axios.request(config);
    res.json({ success: true, response: response.data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send SMS',
      error: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
