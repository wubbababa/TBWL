'use client';

import { useState, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

/** Map Supabase auth errors to friendly Chinese messages */
function friendlyError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return '邮箱或密码错误';
  if (msg.includes('Email not confirmed')) return '邮箱未验证，请检查收件箱';
  if (msg.includes('Too many requests')) return '登录尝试过于频繁，请稍后再试';
  if (msg.includes('Network')) return '网络连接失败，请检查网络';
  return msg;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  // Validation
  const emailError = touched.email && !email.trim()
    ? '请输入邮箱'
    : touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? '邮箱格式不正确'
    : '';
  const passwordError = touched.password && !password
    ? '请输入密码'
    : touched.password && password.length < 6
    ? '密码至少6位'
    : '';

  const canSubmit = email.trim() && password.length >= 6 && !loading;

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!canSubmit) return;

    setError('');
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(friendlyError(authError.message));
        return;
      }

      router.push('/home');
    } catch {
      setError('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [canSubmit, email, password, router]);

  const inputClass = (hasError: boolean) =>
    `w-full px-3 py-2.5 border rounded-md text-sm text-gray-800 placeholder-gray-400
     focus:outline-none focus:ring-2 focus:border-transparent transition-colors
     ${hasError ? 'border-red-300 focus:ring-red-400' : 'border-gray-300 focus:ring-[#228b22]'}`;

  return (
    <div className="min-h-screen bg-[#ecf0f5] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#228b22] mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#222d32] tracking-wide">客户端贴单ERP系统</h1>
          <p className="text-sm text-gray-500 mt-1">请登录以继续</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                邮箱地址
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(p => ({ ...p, email: true }))}
                placeholder="请输入邮箱"
                className={inputClass(!!emailError)}
              />
              {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
            </div>

            {/* Password */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                密码
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched(p => ({ ...p, password: true }))}
                placeholder="请输入密码"
                className={inputClass(!!passwordError)}
              />
              {passwordError && <p className="mt-1 text-xs text-red-500">{passwordError}</p>}
            </div>

            {/* Error message */}
            {error && (
              <div role="alert" className="mb-5 px-3 py-2.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-2.5 px-4 bg-[#228b22] hover:bg-[#1a6b1a] active:bg-[#155215]
                         text-white text-sm font-semibold rounded-md shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#228b22]
                         disabled:opacity-60 disabled:cursor-not-allowed
                         transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          内部系统 · 如需账号请联系管理员
        </p>
      </div>
    </div>
  );
}
