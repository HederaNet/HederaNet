import type { UssdSession, UssdResponse } from '@hederanet/types';
import { t, detectLanguage } from '../i18n/strings.js';
import { ussdGetBalance } from '@hederanet/hedera-sdk';

type Handler = (session: UssdSession, input: string) => Promise<UssdResponse>;

function menu(text: string): UssdResponse {
  return { text, isEnd: false };
}

function end(text: string): UssdResponse {
  return { text, isEnd: true };
}

// ─── Main Menu ────────────────────────────────────────────────────────────────

const handleMain: Handler = async (session, input) => {
  const lang = detectLanguage(session.phoneNumber);

  if (!input) {
    return menu(t('main_menu', lang));
  }

  switch (input) {
    case '1': return { text: t('account_menu', lang), isEnd: false, nextState: 'ACCOUNT' };
    case '2': return { text: t('energy_menu', lang), isEnd: false, nextState: 'ENERGY' };
    case '3': return { text: t('internet_menu', lang), isEnd: false, nextState: 'INTERNET' };
    case '4': return { text: t('earnings_menu', lang), isEnd: false, nextState: 'EARNINGS' };
    case '5': return { text: t('register_menu', lang), isEnd: false, nextState: 'REGISTER' };
    default: return menu(t('invalid_option', lang) + '\n\n' + t('main_menu', lang));
  }
};

// ─── Account Menu ─────────────────────────────────────────────────────────────

const handleAccount: Handler = async (session, input) => {
  const lang = detectLanguage(session.phoneNumber);

  switch (input) {
    case '1': {
      if (!session.accountId) return end(t('no_account', lang));
      try {
        const balance = await ussdGetBalance(session.accountId);
        const text = t('balance_hbar', lang, {
          hbar: balance.hbar.toFixed(4),
          hnet: balance.hnet.toString(),
          hec: balance.hec.toString(),
        });
        return end(text);
      } catch {
        return end(t('error', lang));
      }
    }

    case '2':
      return end('Recent Transactions:\n(Last 3 transactions appear here)\n\nDial *384*1# to return.');

    case '3':
      return end('Subscription Status:\nActive: Internet plan\nExpires: 2024-08-01\n\nDial *384*1# to return.');

    case '0':
      return { text: t('main_menu', lang), isEnd: false, nextState: 'MAIN' };

    default:
      return menu(t('invalid_option', lang) + '\n\n' + t('account_menu', lang));
  }
};

// ─── Energy Menu ──────────────────────────────────────────────────────────────

const handleEnergy: Handler = async (session, input) => {
  const lang = detectLanguage(session.phoneNumber);

  switch (input) {
    case '1':
      return end('Available Energy:\n1. Amaka - 5 kWh - 0.12 ℏ/kWh\n2. Chidi - 12 kWh - 0.10 ℏ/kWh\n3. Fatuma - 8 kWh - 0.11 ℏ/kWh\n\nReply with listing # to buy\nDial *384*1# to cancel');

    case '2':
      return menu('Enter kWh amount to buy (e.g. 5):');

    case '3':
      return menu('Enter kWh amount to sell (e.g. 10):');

    case '0':
      return { text: t('main_menu', lang), isEnd: false, nextState: 'MAIN' };

    default:
      // Handle sub-inputs (e.g. kWh amounts or listing selections)
      if (/^\d+(\.\d+)?$/.test(input)) {
        const amount = parseFloat(input);
        if (session.data['energyAction'] === 'buy') {
          return end(`Confirm purchase: ${amount} kWh\nEstimated cost: ${(amount * 0.11).toFixed(2)} ℏ\n\nReply 1 to confirm, 0 to cancel`);
        }
        if (session.data['energyAction'] === 'sell') {
          return menu(`Confirm listing: ${amount} kWh\nEnter price per kWh in ℏ:`);
        }
      }
      return menu(t('invalid_option', lang) + '\n\n' + t('energy_menu', lang));
  }
};

// ─── Internet Menu ────────────────────────────────────────────────────────────

const handleInternet: Handler = async (session, input) => {
  const lang = detectLanguage(session.phoneNumber);

  switch (input) {
    case '1':
      return end('My Internet Plan:\nStatus: Active\nPlan: Basic (5 HBAR/month)\nData: Unlimited\nExpires: 2024-08-01\n\nDial *384*1# to return.');

    case '2':
      return end('Available Plans:\n1. Basic - 5 ℏ/month\n2. Standard - 10 ℏ/month\n3. Premium - 20 ℏ/month\n\nDial *384*1# then choose to upgrade.');

    case '3':
      return end('Data Balance:\nUnlimited plan active\n\nDial *384*1# to return.');

    case '0':
      return { text: t('main_menu', lang), isEnd: false, nextState: 'MAIN' };

    default:
      return menu(t('invalid_option', lang) + '\n\n' + t('internet_menu', lang));
  }
};

// ─── Earnings Menu ────────────────────────────────────────────────────────────

const handleEarnings: Handler = async (_session, input) => {
  switch (input) {
    case '1':
      return end("Today's Earnings:\nSubscriptions: 2.5 ℏ\nEnergy: 1.2 ℏ\nTotal: 3.7 ℏ\n\nDial *384*1# to return.");

    case '2':
      return end("This Month's Earnings:\nSubscriptions: 45.0 ℏ\nEnergy: 28.3 ℏ\nTotal: 73.3 ℏ\n\nDial *384*1# to return.");

    case '3':
      return menu('Withdraw to Mobile Money\nEnter amount in ℏ (e.g. 50):');

    case '0':
      return { text: t('main_menu'), isEnd: false, nextState: 'MAIN' };

    default:
      if (/^\d+(\.\d+)?$/.test(input)) {
        const amount = parseFloat(input);
        return end(`Withdrawal of ${amount} ℏ requested.\nYou will receive ${(amount * 0.075).toFixed(2)} USD via M-Pesa/MTN MoMo.\n\nProcessing... SMS confirmation will follow.\nDial *384*1# to continue.`);
      }
      return menu(t('invalid_option') + '\n\n' + t('earnings_menu'));
  }
};

// ─── Register Menu ────────────────────────────────────────────────────────────

const handleRegister: Handler = async (_session, input) => {
  switch (input) {
    case '1':
      return menu('Register Node\nEnter your GPS coordinates\n(format: lat,lng e.g. 6.5244,3.3792):');

    case '2':
      return menu('Set Hotspot Price\nEnter monthly price in ℏ (e.g. 5):');

    case '3':
      return end('Activating your node...\nYour node is now live!\nShare with neighbors to earn.\n\nDial *384*1# to manage.');

    case '0':
      return { text: t('main_menu'), isEnd: false, nextState: 'MAIN' };

    default:
      return menu(t('invalid_option') + '\n\n' + t('register_menu'));
  }
};

// ─── Router ───────────────────────────────────────────────────────────────────

export const HANDLERS: Record<string, Handler> = {
  MAIN: handleMain,
  ACCOUNT: handleAccount,
  ENERGY: handleEnergy,
  INTERNET: handleInternet,
  EARNINGS: handleEarnings,
  REGISTER: handleRegister,
};

export async function routeUssd(session: UssdSession, lastInput: string): Promise<UssdResponse & { nextState?: string }> {
  const handler = HANDLERS[session.menuState] ?? handleMain;
  return handler(session, lastInput);
}
