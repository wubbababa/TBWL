'use client';

import { useState, FormEvent } from 'react';
import { Users, Plus, Eye, EyeOff, CheckCircle, AlertCircle, X, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface FormState {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

const EMPTY_FORM: FormState = {
  email: '',
  password: '',
  confirmPassword: '',
  displayName: '',
};

export default function UserManagementPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<FormState>>({});

  const showToast = (type: Toast['type'], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const validate = (): boolean => {
    const errors: Partial<FormState> = {};

    if (!form.email.trim()) {
      errors.email = '邮箱不能为空';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = '请输入有效的邮箱地址';
    }

    if (!form.password) {
      errors.password = '密码不能为空';
    } else if (form.password.length < 6) {
      errors.password = '密码至少需要 6 位';
    }

    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Get current session token to authenticate the admin API call
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast('error', '会话已过期，请重新登录');
        return;
      }

      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          display_name: form.displayName.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        showToast('error', json.error ?? '创建失败，请稍后重试');
        return;
      }

      showToast('success', `账号 ${json.user.email} 创建成功`);
      setForm(EMPTY_FORM);
      setFieldErrors({});
    } catch {
      showToast('error', '网络错误，请检查连接后重试');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof FormState) =>
    `w-full px-3 py-2.5 border rounded-md text-sm text-gray-800 placeholder-gray-400
     focus:outline-none focus:ring-2 focus:border-transparent transition-colors
     ${fieldErrors[field]
       ? 'border-red-300 focus:ring-red-300 bg-red-50'
       : 'border-gray-300 focus:ring-[#3c8dbc]'
     }`;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Users className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">账号管理</h1>
          <p className="text-sm text-gray-500">为系统创建新的登录账号</p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="alert"
          className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-sm font-medium
            ${toast.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
            }`}
        >
          {toast.type === 'success'
            ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          }
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="shrink-0 opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create Account Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Plus className="w-4 h-4 text-gray-500" />
          <h2 className="font-bold text-gray-800">创建新账号</h2>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 flex flex-col gap-5">
          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1.5">
              显示名称 <span className="text-gray-400 font-normal">（可选）</span>
            </label>
            <input
              id="displayName"
              type="text"
              placeholder="例：张三 / 仓库管理员"
              value={form.displayName}
              onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
              className={inputClass('displayName')}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1.5">
              邮箱地址 <span className="text-red-500">*</span>
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="off"
              placeholder="请输入登录邮箱"
              value={form.email}
              onChange={e => {
                setForm(f => ({ ...f, email: e.target.value }));
                if (fieldErrors.email) setFieldErrors(fe => ({ ...fe, email: undefined }));
              }}
              className={inputClass('email')}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1.5">
              初始密码 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="至少 6 位"
                value={form.password}
                onChange={e => {
                  setForm(f => ({ ...f, password: e.target.value }));
                  if (fieldErrors.password) setFieldErrors(fe => ({ ...fe, password: undefined }));
                }}
                className={`${inputClass('password')} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="reg-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">
              确认密码 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="reg-confirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="再次输入密码"
                value={form.confirmPassword}
                onChange={e => {
                  setForm(f => ({ ...f, confirmPassword: e.target.value }));
                  if (fieldErrors.confirmPassword) setFieldErrors(fe => ({ ...fe, confirmPassword: undefined }));
                }}
                className={`${inputClass('confirmPassword')} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
                aria-label={showConfirm ? '隐藏密码' : '显示密码'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Password strength hint */}
          {form.password && (
            <PasswordStrength password={form.password} />
          )}

          {/* Submit */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#3c8dbc] hover:bg-[#367fa9]
                         disabled:opacity-60 disabled:cursor-not-allowed
                         text-white text-sm font-semibold rounded-md shadow-sm transition-colors"
            >
              {loading
                ? <><RefreshCw className="w-4 h-4 animate-spin" />创建中...</>
                : <><Plus className="w-4 h-4" />创建账号</>
              }
            </button>
            <button
              type="button"
              onClick={() => { setForm(EMPTY_FORM); setFieldErrors({}); }}
              className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              重置
            </button>
          </div>
        </form>
      </div>

      {/* Info box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 leading-relaxed">
        <p className="font-semibold mb-1">注意事项</p>
        <ul className="list-disc list-inside space-y-1 text-amber-700">
          <li>新账号创建后可立即登录，无需邮件验证</li>
          <li>请将初始密码通过安全渠道告知账号持有人</li>
          <li>账号持有人登录后可在个人设置中修改密码</li>
          <li>如需删除账号，请前往 Supabase 控制台操作</li>
        </ul>
      </div>
    </div>
  );
}

// ── Password strength indicator ──────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '至少 6 位', pass: password.length >= 6 },
    { label: '包含数字', pass: /\d/.test(password) },
    { label: '包含字母', pass: /[a-zA-Z]/.test(password) },
    { label: '包含特殊字符', pass: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const levels = ['', '弱', '一般', '较强', '强'];
  const colors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= score ? colors[score] : 'bg-gray-200'
            }`}
          />
        ))}
        <span className={`text-xs ml-2 font-medium ${
          score <= 1 ? 'text-red-500' : score === 2 ? 'text-orange-500' : score === 3 ? 'text-yellow-600' : 'text-green-600'
        }`}>
          {levels[score]}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {checks.map(c => (
          <span key={c.label} className={`text-xs flex items-center gap-1 ${c.pass ? 'text-green-600' : 'text-gray-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.pass ? 'bg-green-500' : 'bg-gray-300'}`} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
