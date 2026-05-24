export type Language = 'en' | 'yo' | 'ha' | 'sw';

export type StringKey =
  | 'welcome'
  | 'main_menu'
  | 'account_menu'
  | 'energy_menu'
  | 'internet_menu'
  | 'earnings_menu'
  | 'register_menu'
  | 'balance_hbar'
  | 'no_account'
  | 'invalid_option'
  | 'processing'
  | 'error'
  | 'tx_success'
  | 'session_expired'
  | 'goodbye';

type Strings = Record<StringKey, string>;

const EN: Strings = {
  welcome: 'Welcome to HederaNet\nCommunity Infrastructure',
  main_menu: 'HederaNet\n1. My Account\n2. Energy Market\n3. Internet Services\n4. Earnings\n5. Register as Operator',
  account_menu: 'My Account\n1. View Balance\n2. Recent Transactions\n3. Subscription Status\n0. Back',
  energy_menu: 'Energy Market\n1. View Listings\n2. Buy Energy\n3. Sell Energy\n0. Back',
  internet_menu: 'Internet Services\n1. My Plan\n2. Upgrade Plan\n3. Data Balance\n0. Back',
  earnings_menu: 'My Earnings\n1. Today\'s Earnings\n2. This Month\n3. Withdraw to Mobile Money\n0. Back',
  register_menu: 'Become an Operator\n1. Register Node\n2. Set Price\n3. Go Live\n0. Back',
  balance_hbar: 'Your Balance:\nHBAR: {hbar}\nHNET: {hnet}\nHEC: {hec}',
  no_account: 'No Hedera account linked.\nVisit hederanet.online to connect.',
  invalid_option: 'Invalid option. Please try again.',
  processing: 'Processing your request...',
  error: 'Error occurred. Please try again.',
  tx_success: 'Transaction successful!\nTx ID: {txId}',
  session_expired: 'Session expired. Dial *384*1# to start again.',
  goodbye: 'Thank you for using HederaNet!\n*384*1# to return.',
};

const YO: Strings = {
  ...EN,
  main_menu: 'HederaNet\n1. Akaunti Mi\n2. Oja Agbara\n3. Iṣẹ Intanẹẹti\n4. Ere\n5. Forukọsilẹ Aṣaṣe',
  welcome: 'E kaabọ si HederaNet\nAwọn Amayederun Agbegbe',
  goodbye: 'E dupe fun lilo HederaNet!\n*384*1# lati pada.',
  invalid_option: 'Aṣayan ti ko tọ. Jọwọ gbiyanju lẹẹkansii.',
  error: 'Aṣiṣe waye. Jọwọ gbiyanju lẹẹkansii.',
};

const HA: Strings = {
  ...EN,
  main_menu: 'HederaNet\n1. Asusuna Na\n2. Kasuwar Makamashi\n3. Sabis na Intanet\n4. Kuɗin Samun\n5. Yi Rajista',
  welcome: 'Barka da zuwa HederaNet\nKayayyakin Yarda',
  goodbye: 'Na gode da amfani da HederaNet!\n*384*1# don komawa.',
  invalid_option: 'Zaɓi mara inganci. Da fatan za a sake gwadawa.',
};

const SW: Strings = {
  ...EN,
  main_menu: 'HederaNet\n1. Akaunti Yangu\n2. Soko la Nishati\n3. Huduma za Intaneti\n4. Mauzo\n5. Jisajili Kama Opereta',
  welcome: 'Karibu HederaNet\nMiundombinu ya Jamii',
  goodbye: 'Asante kwa kutumia HederaNet!\n*384*1# kurudi.',
  invalid_option: 'Chaguo batili. Tafadhali jaribu tena.',
};

const STRINGS: Record<Language, Strings> = { en: EN, yo: YO, ha: HA, sw: SW };

export function t(key: StringKey, lang: Language = 'en', vars?: Record<string, string>): string {
  let str = STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, v);
    }
  }
  return str;
}

export function detectLanguage(phoneNumber: string): Language {
  // Kenya (+254) → Swahili, Nigeria (+234) → English/Yoruba/Hausa
  if (phoneNumber.startsWith('+254') || phoneNumber.startsWith('254')) return 'sw';
  return 'en';
}
