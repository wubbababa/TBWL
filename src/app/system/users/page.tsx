'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Users, Plus, Eye, EyeOff, CheckCircle, AlertCircle, X, RefreshCw, Ban, UserCheck } from 'lucide-react';
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

interface UserItem {
  id: string;
  email: string;
  display_name: string;
  role: string;
  banned: boolean;
  created_at: string;
  last_sign_in_at: string | null;
}

const EMPTY_FORM: FormState = { email: '', password: '', confirmPassword: '', displayName: '' };

export default function UserManagementPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<FormState>>({});
  const [users, setUsers] = useState<UserItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const showToast = (type: Toast['type'], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch('/api/admin/list-users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const { users: list } = await res.json();
        setUsers(list);
      }
    } catch { /* silent */ } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggle = async (userId: string, ban: boolean) => {
    setToggling(userId);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch('/api/admin/toggle-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: userId, banned: ban }),
      });
      const json = await res.json();
      if (res.ok) {
        showToast('success', ban ? '账号已禁用' : '账号已启用');
        fetchUsers();
      } else {
        showToast('error', json.error);
      }
    } catch {
      showToast('error', '操作失败');
    } finally {
      setToggling(null);
    }
  };

  const validate = (): boolean => {
    const errors: Partial<FormState> = {};
    if (!form.email.trim()) errors.email = '邮箱不能为空';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = '请输入有效的邮箱地址';
    if (!form.password) errors.password = '密码不能为空';
    else if (form.password.length < 6) errors.password = '密码至少需要 6 位';
    if (form.password !== form.confirmPassword) errors.confirmPassword = '两次输入的密码不一致';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) { showToast('error', '会话已过期'); return; }
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: form.email.trim(), password: form.password, display_name: form.displayName.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) { showToast('error', json.error ?? '创建失败'); return; }
      showToast('success', `账号 ${json.user.email} 创建成功`);
      setForm(EMPTY_FORM);
      setFieldErrors({});
      fetchUsers();
    } catch { showToast('error', '网络错误'); } finally { setLoading(false); }
  };

  const inputClass = (field: keyof FormState) =>
    `w-full px-3 py-2.5 border rounded-md text-sm text-gray-800 placeholder-gray-400
     focus:outline-none focus:ring-2 focus:border-transparent transition-colors
     ${fieldErrors[field] ? 'border-red-300 focus:ring-red-300 bg-red-50' : 'border-gray-300 focus:ring-[#3c8dbc]'}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Users className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">账号管理</h1>
          <p className="text-sm text-gray-500">管理系统登录账号</p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div role="alert" className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-sm font-medium ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="shrink-0 opacity-60 hover:opacity-100"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* User List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">账号列表</h2>
          <button onClick={fetchUsers} className="text-sm text-[#3c8dbc] hover:underline flex items-center gap-1">
            <RefreshCw className={`w-3.5 h-3.5 ${usersLoading ? 'animate-spin' : ''}`} /> 刷新
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">邮箱</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">名称</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">角色</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">状态</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">创建时间</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">最后登录</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {usersLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">加载中...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">暂无账号</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800 font-medium">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600">{u.display_name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded font-medium ${u.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.role === 'admin' ? '管理员' : '普通用户'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded font-medium ${u.banned ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                        {u.banned ? '已禁用' : '正常'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString('zh-CN')}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString('zh-CN') : '-'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(u.id, !u.banned)}
                        disabled={toggling === u.id || u.role === 'admin'}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                          ${u.banned
                            ? 'text-green-700 bg-green-50 hover:bg-green-100'
                            : 'text-red-600 bg-red-50 hover:bg-red-100'
                          }`}
                      >
                        {u.banned ? <><UserCheck className="w-3.5 h-3.5" />启用</> : <><Ban className="w-3.5 h-3.5" />禁用</>}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Account Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-2xl">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Plus className="w-4 h-4 text-gray-500" />
          <h2 className="font-bold text-gray-800">创建新账号</h2>
        </div>
        <form onSubmit={handleSubmit} noValidate className="p-6 flex flex-col gap-5">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1.5">显示名称 <span className="text-gray-400 font-normal">（可选）</span></label>
            <input id="displayName" type="text" placeholder="例：张三" value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} className={inputClass('displayName')} />
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1.5">邮箱地址 <span className="text-red-500">*</span></label>
            <input id="reg-email" type="email" autoComplete="off" placeholder="请输入登录邮箱" value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setFieldErrors(fe => ({ ...fe, email: undefined })); }} className={inputClass('email')} />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1.5">初始密码 <span className="text-red-500">*</span></label>
            <div className="relative">
              <input id="reg-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="至少 6 位" value={form.password} onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setFieldErrors(fe => ({ ...fe, password: undefined })); }} className={`${inputClass('password')} pr-10`} />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>}
          </div>
          <div>
            <label htmlFor="reg-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">确认密码 <span className="text-red-500">*</span></label>
            <div className="relative">
              <input id="reg-confirm" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" placeholder="再次输入密码" value={form.confirmPassword} onChange={e => { setForm(f => ({ ...f, confirmPassword: e.target.value })); setFieldErrors(fe => ({ ...fe, confirmPassword: undefined })); }} className={`${inputClass('confirmPassword')} pr-10`} />
              <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{fieldErrors.confirmPassword}</p>}
          </div>
          <div className="pt-2 flex items-center gap-3">
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-[#3c8dbc] hover:bg-[#367fa9] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md shadow-sm transition-colors">
              {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />创建中...</> : <><Plus className="w-4 h-4" />创建账号</>}
            </button>
            <button type="button" onClick={() => { setForm(EMPTY_FORM); setFieldErrors({}); }} className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors">重置</button>
          </div>
        </form>
      </div>
    </div>
  );
}
