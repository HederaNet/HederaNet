'use client';

import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useWallet } from './WalletContext';
import axios from 'axios';

interface Props { onClose: () => void }

type Tab = 'signin' | 'signup';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

function validate(tab: Tab, name: string, email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};

  if (tab === 'signup' && name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (tab === 'signup') {
    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Za-z]/.test(password)) {
      errors.password = 'Password must contain at least one letter';
    } else if (!/[0-9]/.test(password)) {
      errors.password = 'Password must contain at least one number';
    }
  }

  return errors;
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Za-z]/.test(password),
    /[0-9]/.test(password),
    password.length >= 12,
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-500'];
  const textColors = ['', 'text-red-500', 'text-amber-500', 'text-blue-500', 'text-green-600'];

  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? colors[score] : 'bg-cream-200'}`}
          />
        ))}
      </div>
      <span className={`text-xs ${textColors[score]}`}>{labels[score]}</span>
    </div>
  );
}

export function WalletModal({ onClose }: Props) {
  const { signIn, signUp, signInWithGoogle, connecting } = useWallet();
  const [tab, setTab] = useState<Tab>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState('');
  const [creatingAccount, setCreatingAccount] = useState(false);

  const fieldErrors = validate(tab, name, email, password);
  const showError = (field: keyof FieldErrors) => touched[field] ? fieldErrors[field] : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (Object.keys(fieldErrors).length > 0) return;

    setServerError('');
    setCreatingAccount(tab === 'signup');
    try {
      if (tab === 'signin') {
        await signIn(email.trim().toLowerCase(), password);
      } else {
        await signUp(email.trim().toLowerCase(), password, name.trim());
      }
      onClose();
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? 'Something went wrong'
        : 'Something went wrong';
      setServerError(msg);
    } finally {
      setCreatingAccount(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setServerError('');
      setCreatingAccount(true);
      try {
        await signInWithGoogle(tokenResponse.access_token);
        onClose();
      } catch (err) {
        const msg = axios.isAxiosError(err)
          ? (err.response?.data as { message?: string })?.message ?? 'Google sign-in failed'
          : 'Google sign-in failed';
        setServerError(msg);
      } finally {
        setCreatingAccount(false);
      }
    },
    onError: () => setServerError('Google sign-in was cancelled or failed'),
    flow: 'implicit',
  });

  const busy = connecting || creatingAccount;

  const inputClass = (field: keyof FieldErrors) =>
    `w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
      showError(field)
        ? 'border-red-300 focus:ring-red-300 bg-red-50'
        : 'border-cream-200 focus:ring-forest-400'
    }`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex min-h-full items-center justify-center p-4 py-8">
        <div className="relative card w-full max-w-sm animate-slide-up">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-bold">
              {tab === 'signin' ? 'Sign In' : 'Create Account'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-cream-100 p-1 mb-6 gap-1">
            {(['signin', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setServerError(''); setTouched({}); }}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                  tab === t ? 'bg-white shadow text-forest-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={() => googleLogin()}
            disabled={busy}
            className="w-full flex items-center justify-center gap-3 border-2 border-cream-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-cream-50 transition-colors disabled:opacity-50 mb-4"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-cream-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-cream-200" />
          </div>

          {/* Email/password form */}
          <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-3" noValidate>
            {tab === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName((e.target as HTMLInputElement).value)}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  placeholder="Ada Okafor"
                  autoComplete="name"
                  className={inputClass('name')}
                />
                {showError('name') && (
                  <p className="text-xs text-red-500 mt-1">{showError('name')}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="you@example.com"
                autoComplete="email"
                className={inputClass('email')}
              />
              {showError('email') && (
                <p className="text-xs text-red-500 mt-1">{showError('email')}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                placeholder={tab === 'signup' ? 'Min 8 chars, letters + numbers' : '••••••••'}
                autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                className={inputClass('password')}
              />
              {tab === 'signup' && <PasswordStrength password={password} />}
              {showError('password') && (
                <p className="text-xs text-red-500 mt-1">{showError('password')}</p>
              )}
            </div>

            {serverError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{serverError}</p>
            )}

            {creatingAccount && (
              <p className="text-sm text-forest-600 bg-forest-50 rounded-lg px-3 py-2 flex items-center gap-2">
                <span className="inline-block w-3 h-3 border-2 border-forest-500 border-t-transparent rounded-full animate-spin" />
                Creating your Hedera account on testnet…
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-primary w-full disabled:opacity-50"
            >
              {busy
                ? (tab === 'signup' ? 'Setting up account…' : 'Signing in…')
                : (tab === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p className="mt-4 text-xs text-center text-gray-400">
            {tab === 'signup'
              ? 'A Hedera testnet account with 1 ℏ is automatically created for you.'
              : 'No wallet required — your Hedera account is managed for you.'}
          </p>
        </div>
      </div>
    </div>
  );
}
