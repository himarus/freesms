// server.js
const express = require('express');
const axios = require('axios');
const qs = require('qs');

const app = express();
const PORT = process.env.PORT || 3000;

function normalizeNumber(raw) {
  let number = raw.replace(/\D/g, ''); // Strip non-digit characters

  if (number.startsWith('09')) {
    return '+63' + number.slice(1);
  } else if (number.startsWith('9') && number.length === 10) {
    return '+63' + number;
  } else if (number.startsWith('63') && number.length === 12) {
    return '+' + number;
  } else if (number.startsWith('+63') && number.length === 13) {
    return number;
  } else {
    return null;
  }
}

app.get('/send', async (req, res) => {
  const { number: inputNumber, text } = req.query;

  if (!inputNumber || !text) {
    return res.status(400).json({ error: 'Missing number or text parameter' });
  }

  const normalized = normalizeNumber(inputNumber);
  if (!normalized) {
    return res.status(400).json({ error: 'Invalid number format' });
  }

  const payload = [
    "free.text.sms",
    "412",
    normalized,
    "2207117BPG",
    "fuT8-dobSdyEFRuwiHrxiz:APA91bHNbeMP4HxJR-eBEAS0lf9fyBPg-HWWd21A9davPtqxmU-J-TTQWf28KXsWnnTnEAoriWq3TFG8Xdcp83C6GrwGka4sTd_6qnlqbfN4gP82YaTgvvg",
    text,
    ""
  ];

  const postData = qs.stringify({
    humottaee: 'Processing',
    '$Oj0O%K7zi2j18E': JSON.stringify(payload),
    device_id: 'f2fc64cd56e9f598'
  });

  const config = {
    method: 'POST',
    url: 'https://sms.m2techtronix.com/v13/sms.php',
    headers: {
      'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 15; 2207117BPG Build/AP3A.240905.015.A2)',
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
