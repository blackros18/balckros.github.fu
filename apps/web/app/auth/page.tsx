'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, ApiError } from '@/lib/api';

type AuthStep =
  | 'login'
  | 'email_otp'
  | 'totp_enroll'
  | 'totp_verify'
  | 'forgot_password'
  | 'forgot_sent'
  | 'reset_password'
  | 'reset_done';

export default function AuthPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState<AuthStep>('login');
  const [pendingToken, setPendingToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [totpCode, setTotpCode] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const token = params.get('token');
    if (token) { setPendingToken(token); setStep('reset_password'); }
  }, [params]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  useEffect(() => {
    if (step === 'totp_enroll' && pendingToken) {
      auth.getTotpEnrollment(pendingToken).then(d => {
        setQrDataUrl(d.qrDataUrl);
        setTotpSecret(d.secret);
      }).catch(() => setError('Failed to load QR code.'));
    }
  }, [step, pendingToken]);

  function clearError() { setError(''); }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); clearError(); setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await auth.login(fd.get('identifier') as string, fd.get('password') as string);
      if ('success' in res) { router.push('/dashboard'); }
      else { setPendingToken(res.pendingToken); setStep(res.mfaType); if (res.mfaType === 'email_otp') setResendCooldown(60); }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed.');
    } finally { setLoading(false); }
  }

  function handleOtpDigit(i: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpDigits]; next[i] = val; setOtpDigits(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  }
  function handleOtpKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft' && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) otpRefs.current[i + 1]?.focus();
  }
  function handleOtpPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) { setOtpDigits(text.split('')); otpRefs.current[5]?.focus(); }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length < 6) { setError('Please enter the 6-digit code.'); return; }
    clearError(); setLoading(true);
    try { await auth.verifyOtp(pendingToken, otp); router.push('/dashboard'); }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Verification failed.'); setOtpDigits(['','','','','','']); otpRefs.current[0]?.focus(); }
    finally { setLoading(false); }
  }

  async function handleResendOtp() {
    if (resendCooldown > 0) return; clearError();
    try { await auth.resendOtp(pendingToken); setOtpDigits(['','','','','','']); setResendCooldown(60); otpRefs.current[0]?.focus(); }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Could not resend.'); }
  }

  async function handleVerifyTotpEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (totpCode.length < 6) { setError('Enter the 6-digit code from your authenticator app.'); return; }
    clearError(); setLoading(true);
    try { await auth.verifyTotpEnrollment(pendingToken, totpCode); router.push('/dashboard'); }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Invalid code.'); setTotpCode(''); }
    finally { setLoading(false); }
  }

  async function handleVerifyTotp(e: React.FormEvent) {
    e.preventDefault();
    if (totpCode.length < 6) { setError('Enter the 6-digit code from your authenticator app.'); return; }
    clearError(); setLoading(true);
    try { await auth.verifyTotp(pendingToken, totpCode); router.push('/dashboard'); }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Invalid code.'); setTotpCode(''); }
    finally { setLoading(false); }
  }

  async function handleForgotPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); clearError(); setLoading(true);
    const fd = new FormData(e.currentTarget);
    try { await auth.forgotPassword(fd.get('email') as string); }
    catch { /* always show sent */ }
    finally { setStep('forgot_sent'); setLoading(false); }
  }

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); clearError();
    const fd = new FormData(e.currentTarget);
    const password = fd.get('password') as string;
    const confirm = fd.get('confirmPassword') as string;
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try { await auth.resetPassword(pendingToken, password, confirm); setStep('reset_done'); }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Reset failed.'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d4a24 0%, #177c3e 50%, #6ba047 100%)' }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #fff 0%, transparent 60%)' }} />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="mi text-white text-2xl">favorite</span>
            </div>
            <span className="text-xl font-bold tracking-tight">FosterKonnect</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold leading-tight mb-4">Connecting care,<br />one family at a time.</h1>
            <p className="text-white/70 text-lg max-w-sm">The complete platform for Texas foster care agencies.</p>
          </div>
          <div className="flex gap-8">
            {([['500+', 'Agencies'], ['12K+', 'Children'], ['98%', 'Compliance']] as const).map(([n, l]) => (
              <div key={l}><div className="text-2xl font-bold">{n}</div><div className="text-white/60 text-sm">{l}</div></div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 lg:max-w-lg xl:max-w-xl items-center justify-center p-6 bg-n50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-fk-primary flex items-center justify-center">
              <span className="mi text-white text-lg">favorite</span>
            </div>
            <span className="font-bold text-fk-primary">FosterKonnect</span>
          </div>
          {step === 'login' && <LoginForm onSubmit={handleLogin} onForgot={() => { clearError(); setStep('forgot_password'); }} loading={loading} error={error} />}
          {step === 'email_otp' && <EmailOtpForm otpDigits={otpDigits} otpRefs={otpRefs} onDigit={handleOtpDigit} onKeyDown={handleOtpKeyDown} onPaste={handleOtpPaste} onSubmit={handleVerifyOtp} onResend={handleResendOtp} onBack={() => setStep('login')} resendCooldown={resendCooldown} loading={loading} error={error} />}
          {step === 'totp_enroll' && <TotpEnrollForm qrDataUrl={qrDataUrl} secret={totpSecret} code={totpCode} setCode={setTotpCode} onSubmit={handleVerifyTotpEnroll} onBack={() => setStep('login')} loading={loading} error={error} />}
          {step === 'totp_verify' && <TotpVerifyForm code={totpCode} setCode={setTotpCode} onSubmit={handleVerifyTotp} onBack={() => setStep('login')} loading={loading} error={error} />}
          {step === 'forgot_password' && <ForgotPasswordForm onSubmit={handleForgotPassword} onBack={() => { clearError(); setStep('login'); }} loading={loading} error={error} />}
          {step === 'forgot_sent' && <ForgotSentScreen onBack={() => setStep('login')} />}
          {step === 'reset_password' && <ResetPasswordForm onSubmit={handleResetPassword} loading={loading} error={error} />}
          {step === 'reset_done' && <ResetDoneScreen onLogin={() => setStep('login')} />}
        </div>
      </div>
    </div>
  );
}

function FormError({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-fk-danger">
      <span className="mi text-base mt-0.5 shrink-0">error</span>
      <span>{msg}</span>
    </div>
  );
}

function PrimaryButton({ children, loading, type = 'submit' }: { children: React.ReactNode; loading?: boolean; type?: 'submit' | 'button' }) {
  return (
    <button type={type} disabled={loading}
      className="w-full flex items-center justify-center gap-2 rounded-xl bg-fk-primary text-white font-semibold text-sm py-3 px-4 transition hover:bg-fk-primary-dark disabled:opacity-60 disabled:cursor-not-allowed">
      {loading ? <span className="mi text-base animate-spin">progress_activity</span> : children}
    </button>
  );
}

function BackButton({ onClick, label = 'Back to sign in' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1 text-sm text-n500 hover:text-fk-primary transition">
      <span className="mi text-base">arrow_back</span>{label}
    </button>
  );
}

function PasswordInput({ name }: { name: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={name} name={name} type={show ? 'text' : 'password'} placeholder="••••••••"
        autoComplete="current-password" required
        className="w-full rounded-xl border border-n300 px-4 py-2.5 text-sm text-n900 placeholder:text-n400 outline-none focus:border-fk-primary focus:ring-2 focus:ring-fk-primary/10 transition pr-10" />
      <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-n400 hover:text-n700">
        <span className="mi text-lg">{show ? 'visibility_off' : 'visibility'}</span>
      </button>
    </div>
  );
}

function InputField({ label, name, type = 'text', placeholder, autoComplete }: { label: string; name: string; type?: string; placeholder?: string; autoComplete?: string }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-n700">{label}</label>
      <div className="relative">
        <input id={name} name={name} type={isPassword ? (show ? 'text' : 'password') : type}
          placeholder={placeholder} autoComplete={autoComplete} required
          className="w-full rounded-xl border border-n300 px-4 py-2.5 text-sm text-n900 placeholder:text-n400 outline-none focus:border-fk-primary focus:ring-2 focus:ring-fk-primary/10 transition" />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-n400 hover:text-n700">
            <span className="mi text-lg">{show ? 'visibility_off' : 'visibility'}</span>
          </button>
        )}
      </div>
    </div>
  );
}

function LoginForm({ onSubmit, onForgot, loading, error }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; onForgot: () => void; loading: boolean; error: string }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-n900">Welcome back</h2>
        <p className="text-sm text-n500 mt-1">Sign in to your FosterKonnect account</p>
      </div>
      <FormError msg={error} />
      <div className="flex flex-col gap-4">
        <InputField label="Email or username" name="identifier" placeholder="you@agency.com" autoComplete="username" />
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-n700">Password</label>
            <button type="button" onClick={onForgot} className="text-xs text-fk-primary hover:text-fk-primary-dark font-medium">Forgot password?</button>
          </div>
          <PasswordInput name="password" />
        </div>
      </div>
      <PrimaryButton loading={loading}><span className="mi text-base">login</span>Sign in</PrimaryButton>
    </form>
  );
}

function EmailOtpForm({ otpDigits, otpRefs, onDigit, onKeyDown, onPaste, onSubmit, onResend, onBack, resendCooldown, loading, error }: {
  otpDigits: string[]; otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  onDigit: (i: number, val: string) => void; onKeyDown: (i: number, e: React.KeyboardEvent) => void;
  onPaste: (e: React.ClipboardEvent) => void; onSubmit: (e: React.FormEvent) => void;
  onResend: () => void; onBack: () => void; resendCooldown: number; loading: boolean; error: string;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div>
        <div className="w-12 h-12 rounded-xl bg-fk-primary-subtle flex items-center justify-center mb-4">
          <span className="mi text-2xl text-fk-primary">mark_email_read</span>
        </div>
        <h2 className="text-2xl font-bold text-n900">Check your email</h2>
        <p className="text-sm text-n500 mt-1">We sent a 6-digit code to your email. Enter it below.</p>
      </div>
      <FormError msg={error} />
      <div className="flex gap-3 justify-center" onPaste={onPaste}>
        {otpDigits.map((d, i) => (
          <input key={i} ref={el => { otpRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={d}
            onChange={e => onDigit(i, e.target.value)} onKeyDown={e => onKeyDown(i, e)}
            className="w-12 h-14 text-center text-xl font-mono font-bold rounded-xl border border-n300 focus:border-fk-primary focus:ring-2 focus:ring-fk-primary/10 outline-none transition" />
        ))}
      </div>
      <PrimaryButton loading={loading}>Verify code</PrimaryButton>
      <div className="flex items-center justify-between text-sm">
        <BackButton onClick={onBack} />
        <button type="button" onClick={onResend} disabled={resendCooldown > 0}
          className="text-fk-primary hover:text-fk-primary-dark font-medium disabled:text-n400 disabled:cursor-not-allowed">
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
        </button>
      </div>
    </form>
  );
}

function TotpEnrollForm({ qrDataUrl, secret, code, setCode, onSubmit, onBack, loading, error }: {
  qrDataUrl: string; secret: string; code: string; setCode: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void; onBack: () => void; loading: boolean; error: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div>
        <div className="w-12 h-12 rounded-xl bg-fk-primary-subtle flex items-center justify-center mb-4">
          <span className="mi text-2xl text-fk-primary">qr_code_scanner</span>
        </div>
        <h2 className="text-2xl font-bold text-n900">Set up authenticator</h2>
        <p className="text-sm text-n500 mt-1">Scan the QR code with Google Authenticator or any TOTP app.</p>
      </div>
      <FormError msg={error} />
      {qrDataUrl ? (
        <div className="flex flex-col items-center gap-3">
          <img src={qrDataUrl} alt="TOTP QR" className="w-44 h-44 rounded-xl border border-n200" />
          <div className="w-full rounded-xl bg-n50 border border-n200 px-4 py-3 flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-n600 break-all">{secret}</span>
            <button type="button" onClick={() => { navigator.clipboard.writeText(secret); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="shrink-0 text-n400 hover:text-fk-primary">
              <span className="mi text-lg">{copied ? 'check' : 'content_copy'}</span>
            </button>
          </div>
        </div>
      ) : <div className="flex items-center justify-center h-44"><span className="mi text-4xl text-n300 animate-spin">progress_activity</span></div>}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-n700">Enter code from app</label>
        <input type="text" inputMode="numeric" maxLength={6} placeholder="000000" value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full rounded-xl border border-n300 px-4 py-2.5 text-center text-xl font-mono tracking-widest text-n900 outline-none focus:border-fk-primary focus:ring-2 focus:ring-fk-primary/10" />
      </div>
      <PrimaryButton loading={loading}>Verify &amp; activate</PrimaryButton>
      <BackButton onClick={onBack} />
    </form>
  );
}

function TotpVerifyForm({ code, setCode, onSubmit, onBack, loading, error }: {
  code: string; setCode: (v: string) => void; onSubmit: (e: React.FormEvent) => void; onBack: () => void; loading: boolean; error: string;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div>
        <div className="w-12 h-12 rounded-xl bg-fk-primary-subtle flex items-center justify-center mb-4">
          <span className="mi text-2xl text-fk-primary">phonelink_lock</span>
        </div>
        <h2 className="text-2xl font-bold text-n900">Authenticator code</h2>
        <p className="text-sm text-n500 mt-1">Enter the 6-digit code from your authenticator app.</p>
      </div>
      <FormError msg={error} />
      <input type="text" inputMode="numeric" maxLength={6} placeholder="000000" value={code} autoFocus
        onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        className="w-full rounded-xl border border-n300 px-4 py-2.5 text-center text-2xl font-mono tracking-widest text-n900 outline-none focus:border-fk-primary focus:ring-2 focus:ring-fk-primary/10" />
      <PrimaryButton loading={loading}>Verify</PrimaryButton>
      <BackButton onClick={onBack} />
    </form>
  );
}

function ForgotPasswordForm({ onSubmit, onBack, loading, error }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; onBack: () => void; loading: boolean; error: string }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div>
        <div className="w-12 h-12 rounded-xl bg-fk-primary-subtle flex items-center justify-center mb-4">
          <span className="mi text-2xl text-fk-primary">lock_reset</span>
        </div>
        <h2 className="text-2xl font-bold text-n900">Reset your password</h2>
        <p className="text-sm text-n500 mt-1">Enter your email and we&apos;ll send a reset link.</p>
      </div>
      <FormError msg={error} />
      <InputField label="Email address" name="email" type="email" placeholder="you@agency.com" autoComplete="email" />
      <PrimaryButton loading={loading}><span className="mi text-base">send</span>Send reset link</PrimaryButton>
      <BackButton onClick={onBack} />
    </form>
  );
}

function ForgotSentScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="w-12 h-12 rounded-xl bg-fk-primary-subtle flex items-center justify-center mb-4">
          <span className="mi text-2xl text-fk-primary">mark_email_read</span>
        </div>
        <h2 className="text-2xl font-bold text-n900">Check your inbox</h2>
        <p className="text-sm text-n500 mt-1">If an account exists, we&apos;ve sent a reset link. Check your inbox and spam folder.</p>
      </div>
      <BackButton onClick={onBack} />
    </div>
  );
}

function ResetPasswordForm({ onSubmit, loading, error }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; loading: boolean; error: string }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div>
        <div className="w-12 h-12 rounded-xl bg-fk-primary-subtle flex items-center justify-center mb-4">
          <span className="mi text-2xl text-fk-primary">key</span>
        </div>
        <h2 className="text-2xl font-bold text-n900">Create new password</h2>
        <p className="text-sm text-n500 mt-1">Choose a strong password for your account.</p>
      </div>
      <FormError msg={error} />
      <InputField label="New password" name="password" type="password" placeholder="••••••••" autoComplete="new-password" />
      <InputField label="Confirm password" name="confirmPassword" type="password" placeholder="••••••••" autoComplete="new-password" />
      <PrimaryButton loading={loading}><span className="mi text-base">lock</span>Set new password</PrimaryButton>
    </form>
  );
}

function ResetDoneScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="w-12 h-12 rounded-xl bg-fk-primary-subtle flex items-center justify-center mb-4">
          <span className="mi text-2xl text-fk-primary">check_circle</span>
        </div>
        <h2 className="text-2xl font-bold text-n900">Password updated!</h2>
        <p className="text-sm text-n500 mt-1">Your password has been reset. Sign in with your new credentials.</p>
      </div>
      <button type="button" onClick={onLogin}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-fk-primary text-white font-semibold text-sm py-3 px-4 transition hover:bg-fk-primary-dark">
        <span className="mi text-base">login</span>Sign in
      </button>
    </div>
  );
}
