'use client';

import { useState, FormEvent } from 'react';
import { ShieldCheck, Eye, EyeOff, CheckCircle, AlertCircle, X, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const showToast = (type: Toast['type'], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!currentPassword) errs.current = '请输入当前密码';
    if (!newPassword) errs.new = '请输入新密码';
    else if (newPassword.length < 6) errs.new = '新密码至少需要 6 位';
    if (newPassword !== confirmPassword) errs.confirm = '两次输入的密码不一致';
    if (newPassword === currentPassword && newPassword) errs.new = '新密码不能与当前密码相同';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Verify current password by re-signing in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        showToast('error', '无法获取当前用户信息');
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        showToast('error', '当前密码不正确');
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        showToast('error', error.message);
        return;
      }

      showToast('success', '密码修改成功');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    } catch {
      showToast('error', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-3 py-2.5 border rounded-md text-sm text-gray-800 placeholder-gray-400
     focus:outline-none focus:ring-2 focus:border-transparent transition-colors pr-10
     ${errors[field] ? 'border-red-300 focus:ring-red-300 bg-red-50' : 'border-gray-300 focus:ring-[#3c8dbc]'}`;

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">修改密码</h1>
          <p className="text-sm text-gray-500">更新您的登录密码</p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="alert"
          className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-sm font-medium
            ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}
        >
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="shrink-0 opacity-60 hover:opacity-100"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">安全验证</h2>
        </div>
        <form onSubmit={handleSubmit} noValidate className="p-6 flex flex-col gap-5">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">当前密码 <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                placeholder="请输入当前密码"
                value={currentPassword}
                onChange={e => { setCurrentPassword(e.target.value); setErrors(er => ({ ...er, current: '' })); }}
                className={inputClass('current')}
              />
              <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.current && <p className="mt-1 text-xs text-red-500">{errors.current}</p>}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">新密码 <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="至少 6 位"
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setErrors(er => ({ ...er, new: '' })); }}
                className={inputClass('new')}
              />
              <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.new && <p className="mt-1 text-xs text-red-500">{errors.new}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">确认新密码 <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="再次输入新密码"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setErrors(er => ({ ...er, confirm: '' })); }}
                className={inputClass('confirm')}
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#3c8dbc] hover:bg-[#367fa9] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md shadow-sm transition-colors"
            >
              {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />提交中...</> : '确认修改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
