const crypto = require('crypto');

const PIXEL_ID = '3642416299242334';
const GRAPH_API_URL = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`;

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
  const accessToken = process.env.META_ACCESS_TOKEN || 'EAAavSOfbvJcBSGMbzY8rYyXUZAXStJaCd98LlZBCPiwroI4zIl5bOOMXLNAgMs42DsXKlrmfE273auSCPqtGRCrfZAfHJEZAIdwohNrkHeYwbVwaax7V3lUyjsCVm6XYkyc8KRZB6XMu6meMsZBPgISXCcdIiwc5Mt7ZA2RuNBZAdMmOrMDcZCTiTm1lNARt2VgZDZD';
  if (!accessToken) {
    console.log('[Meta CAPI] Skipped: META_ACCESS_TOKEN not set');
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

  try {
    const response = await fetch(GRAPH_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
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
