import 'dotenv/config.js';
import express from 'express';
import { getOrCreateSession, setSession, deleteSession, checkRateLimit } from './session.js';
import { routeUssd } from './handlers/index.js';
import type { UssdRequest } from '@hederanet/types';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Africa's Talking USSD webhook
app.post('/ussd', async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body as UssdRequest;

  // Rate limiting
  const allowed = await checkRateLimit(phoneNumber);
  if (!allowed) {
    res.send('END You have exceeded the session limit. Try again in an hour.');
    return;
  }

  try {
    const session = await getOrCreateSession(sessionId, phoneNumber);

    // Parse the menu trail from Africa's Talking text format
    // text is cumulative: "1*2*3" means user entered 1, then 2, then 3
    const inputs = text ? text.split('*') : [];
    const lastInput = inputs[inputs.length - 1] ?? '';

    // Rebuild menu state from input trail on first call after reconnect
    if (inputs.length === 0) {
      session.menuState = 'MAIN';
    }

    const response = await routeUssd(session, lastInput);

    // Update session state
    if (response.nextState) {
      session.menuState = response.nextState;
      await setSession(session);
    }

    if (response.isEnd) {
      await deleteSession(sessionId);
      res.send(`END ${response.text}`);
    } else {
      res.send(`CON ${response.text}`);
    }
  } catch (err) {
    console.error('USSD error:', err);
    await deleteSession(sessionId);
    res.send('END An error occurred. Please try again. Dial *384*1#');
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'hederanet-ussd' });
});

const port = process.env['USSD_PORT'] ?? 5000;
app.listen(port, () => {
  console.log(`HederaNet USSD service running on port ${port}`);
});

