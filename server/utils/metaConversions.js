const crypto = require('crypto');

const PIXEL_ID = process.env.META_PIXEL_ID;
const GRAPH_API_URL = `https://graph.facebook.com/v19.0/${process.env.META_PIXEL_ID}/events`;

function sha256(value) {
  if (!value) return undefined;
  return crypto.createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex');
}

function normalizePhone(phone) {
  if (!phone) return undefined;
  let digits = String(phone).replace(/[^\d]/g, '');
  if (digits.length === 10) digits = `1${digits}`;
  return digits;
}

async function sendMetaEvent({ eventName, userData, customData, eventId }) {
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!PIXEL_ID || !accessToken) {
    console.log('[Meta CAPI] Skipped: META_PIXEL_ID or META_ACCESS_TOKEN not set');
    return;
  }

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'system_generated',
        event_id: eventId,
        user_data: {
          ph: sha256(normalizePhone(userData.phone)),
          fn: sha256(userData.name),
        },
        custom_data: customData || {},
      },
    ],
    access_token: accessToken,
  };
  if (process.env.META_TEST_CODE) {
    payload.test_event_code = process.env.META_TEST_CODE;
  }

  try {
    const metaResponse = await fetch(GRAPH_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const metaData = await metaResponse.json();
    console.log('[Meta CAPI Status]:', metaResponse.status);
    console.log('[Meta CAPI Response]:', metaData);
    const result = metaData;
    if (result.error) {
      console.log(`[Meta CAPI] Error sending ${eventName}:`, result.error.message);
    } else {
      console.log(`[Meta CAPI] Successfully sent ${eventName} event`);
    }
  } catch (err) {
    console.log(`[Meta CAPI] Failed to send ${eventName}:`, err.message);
  }
}

module.exports = { sendMetaEvent };
