import React, { useEffect, useState, useCallback } from 'react';
import {
  ShieldCheck,
  Users,
  Crown,
  Clock,
  AlertTriangle,
  Search,
  RefreshCw,
  LogOut,
  RotateCcw,
  Ban,
  CheckCircle2,
  Trash2,
  Layers,
  Activity,
} from 'lucide-react';
import { ToporoLogo } from '../icons/ToporoLogo';
import { AdminApi, AdminKpis, AuditEvent, AuthUser, PlanTier, UserRole, UserStatus } from '../../services/authApi';
import { useAuthStore } from '../../store/useAuthStore';

interface AdminPortalProps {
  onNavigate: (route: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onNavigate }) => {
  const { user: currentUser, isElevatedAdminSession, exitElevatedSession } = useAuthStore();

  const [kpis, setKpis] = useState<AdminKpis | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [audits, setAudits] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionBusyEmail, setActionBusyEmail] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | 'free' | 'pro' | 'trial'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await AdminApi.listUsers();
      setKpis(data.kpis);
      setUsers(data.users);
      setAudits(data.auditEvents);
    } catch (err: any) {
      setError(err?.message || 'Unable to load admin portal.');
      if (String(err?.message || '').toLowerCase().includes('elevated') || String(err?.message || '').toLowerCase().includes('expired')) {
        exitElevatedSession();
        onNavigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [exitElevatedSession, onNavigate]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin' || !isElevatedAdminSession) {
      onNavigate('/login');
      return;
    }
    fetchDashboard();
  }, [currentUser, isElevatedAdminSession, fetchDashboard, onNavigate]);

  const handleUpdateUser = async (
    targetEmail: string,
    patch: {
      plan?: PlanTier;
      role?: UserRole;
      status?: UserStatus;
      emailVerified?: boolean;
      resetTrial?: boolean;
    }
  ) => {
    setActionBusyEmail(targetEmail);
    setError(null);
    try {
      await AdminApi.updateUser(targetEmail, patch);
      await fetchDashboard();
    } catch (err: any) {
      setError(err?.message || 'Failed to update user.');
    } finally {
      setActionBusyEmail(null);
    }
  };

  const handleDeleteUser = async (targetEmail: string) => {
    if (!window.confirm(`Permanently delete user account "${targetEmail}"?`)) return;
    setActionBusyEmail(targetEmail);
    setError(null);
    try {
      await AdminApi.deleteUser(targetEmail);
      await fetchDashboard();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete user.');
    } finally {
      setActionBusyEmail(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.fullName || '').toLowerCase().includes(q);
    const matchesPlan =
      planFilter === 'all' ||
      (planFilter === 'trial' && u.isTrialActive) ||
      (planFilter === 'pro' && u.plan === 'pro') ||
      (planFilter === 'free' && u.effectivePlan === 'free');
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesPlan && matchesRole;
  });

  return (
    <div className="tp-canvas min-h-screen flex flex-col">
      <div className="tp-frame flex-1 flex flex-col">
        {/* Top Admin Security Header */}
        <header className="tp-cell py-4 flex flex-wrap items-center justify-between gap-4 bg-[var(--tp-surface)]">
          <div className="flex items-center gap-3">
            <ToporoLogo className="w-8 h-8" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[var(--tp-main)] tracking-tight">
                  Toporo User &amp; RBAC Management
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0b1d0b] text-[#a7e68f] font-mono text-[10px] font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  ELEVATED SESSION (/manage)
                </span>
              </div>
              <p className="text-xs font-mono text-[var(--tp-muted)]">
                Signed in as {currentUser?.email} · 30m privileged session TTL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchDashboard}
              disabled={isLoading}
              className="tp-btn tp-btn-outline !py-1.5 !px-3 !text-xs inline-flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/studio')}
              className="tp-btn tp-btn-outline !py-1.5 !px-3 !text-xs inline-flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Open Studio</span>
            </button>
            <button
              type="button"
              onClick={() => {
                exitElevatedSession();
                onNavigate('/login');
              }}
              className="tp-btn tp-btn-dark !py-1.5 !px-3 !text-xs inline-flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Elevated Session</span>
            </button>
          </div>
        </header>

        <main className="tp-cell py-6 space-y-6 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* KPI Summary Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-4 rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-line)]">
              <div className="flex items-center justify-between text-xs text-[var(--tp-muted)] font-mono">
                <span>TOTAL USERS</span>
                <Users className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-[var(--tp-main)] mt-2">
                {kpis?.totalUsers ?? '—'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-line)]">
              <div className="flex items-center justify-between text-xs text-[var(--tp-muted)] font-mono">
                <span>TOPORO PRO</span>
                <Crown className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-[var(--tp-main)] mt-2">
                {kpis?.activePro ?? '—'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-line)]">
              <div className="flex items-center justify-between text-xs text-[var(--tp-muted)] font-mono">
                <span>7-DAY TRIALS</span>
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-[var(--tp-main)] mt-2">
                {kpis?.activeTrials ?? '—'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-line)]">
              <div className="flex items-center justify-between text-xs text-[var(--tp-muted)] font-mono">
                <span>FREE TIER</span>
                <Users className="w-4 h-4 text-stone-500" />
              </div>
              <div className="text-2xl font-bold text-[var(--tp-main)] mt-2">
                {kpis?.freeTier ?? '—'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-line)]">
              <div className="flex items-center justify-between text-xs text-[var(--tp-muted)] font-mono">
                <span>UNVERIFIED</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-[var(--tp-main)] mt-2">
                {kpis?.pendingVerification ?? '—'}
              </div>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="p-4 rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-line)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-[var(--tp-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-user-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by email, username, or display name..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[var(--tp-line)] rounded-lg outline-none text-[var(--tp-main)] focus:border-[var(--tp-main)]"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs bg-white border border-[var(--tp-line)] rounded-lg text-[var(--tp-main)]"
                >
                  <option value="all">All Plans</option>
                  <option value="free">Free Tier</option>
                  <option value="trial">Active 7-Day Trial</option>
                  <option value="pro">Toporo Pro</option>
                </select>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs bg-white border border-[var(--tp-line)] rounded-lg text-[var(--tp-main)]"
                >
                  <option value="all">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-lg border border-[var(--tp-line)] bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--tp-line)] bg-[var(--tp-surface)] text-[11px] font-mono uppercase text-[var(--tp-muted)]">
                    <th className="py-2.5 px-3">Account</th>
                    <th className="py-2.5 px-3">Auth</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Plan &amp; Trial</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--tp-line)]">
                  {filteredUsers.map((u) => {
                    const isSelf = u.email === currentUser?.email;
                    const busy = actionBusyEmail === u.email;
                    return (
                      <tr key={u.userId} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[var(--tp-main)]">
                            {u.email}
                            {isSelf && (
                              <span className="ml-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-200 text-stone-700">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-[var(--tp-muted)]">
                            @{u.username} {u.fullName ? `· ${u.fullName}` : ''}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {u.authProviders.map((prov) => (
                              <span
                                key={prov}
                                className="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 font-mono text-[10px] uppercase text-stone-700"
                              >
                                {prov}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-0.5">
                            <span
                              className={`inline-flex w-fit items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold ${
                                u.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : u.status === 'suspended'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {u.status}
                            </span>
                            <span className="text-[10px] text-[var(--tp-muted)]">
                              {u.emailVerified ? 'Email verified' : 'Pending OTP'}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            {u.effectivePlan === 'pro' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold text-[11px]">
                                <Crown className="w-3 h-3 text-amber-600" />
                                {u.isTrialActive ? `Pro Trial (${u.trialDaysRemaining}d)` : 'Pro'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium text-[11px]">
                                Free
                              </span>
                            )}
                          </div>
                          {u.trialAvailed && !u.isTrialActive && u.plan === 'free' && (
                            <div className="text-[10px] text-[var(--tp-muted)] mt-0.5">
                              Trial exhausted
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px]">
                          <span
                            className={
                              u.role === 'admin'
                                ? 'font-bold text-emerald-800'
                                : 'text-[var(--tp-muted)]'
                            }
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                            {/* Plan Toggle */}
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                handleUpdateUser(u.email, {
                                  plan: u.plan === 'pro' ? 'free' : 'pro',
                                })
                              }
                              className="px-2 py-1 rounded border border-[var(--tp-line)] hover:border-[var(--tp-main)] bg-white text-[11px] font-medium cursor-pointer disabled:opacity-50"
                              title={u.plan === 'pro' ? 'Downgrade to Free' : 'Grant Toporo Pro'}
                            >
                              {u.plan === 'pro' ? 'Set Free' : 'Grant Pro'}
                            </button>

                            {/* Reset Trial Eligibility */}
                            {u.trialAvailed && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleUpdateUser(u.email, { resetTrial: true })}
                                className="px-2 py-1 rounded border border-[var(--tp-line)] hover:border-[var(--tp-main)] bg-white text-[11px] inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                title="Reset 7-day trial eligibility"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Reset Trial</span>
                              </button>
                            )}

                            {/* Verify Email if unverified */}
                            {!u.emailVerified && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleUpdateUser(u.email, { emailVerified: true })}
                                className="px-2 py-1 rounded border border-emerald-300 bg-emerald-50 text-emerald-800 text-[11px] inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Verify</span>
                              </button>
                            )}

                            {/* Suspend / Reactivate */}
                            {!isSelf && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  handleUpdateUser(u.email, {
                                    status: u.status === 'suspended' ? 'active' : 'suspended',
                                  })
                                }
                                className="px-2 py-1 rounded border border-[var(--tp-line)] hover:border-amber-500 bg-white text-[11px] inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <Ban className="w-3 h-3" />
                                <span>{u.status === 'suspended' ? 'Activate' : 'Suspend'}</span>
                              </button>
                            )}

                            {/* Role Toggle */}
                            {!isSelf && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  handleUpdateUser(u.email, {
                                    role: u.role === 'admin' ? 'user' : 'admin',
                                  })
                                }
                                className="px-2 py-1 rounded border border-[var(--tp-line)] hover:border-[var(--tp-main)] bg-white text-[11px] cursor-pointer disabled:opacity-50"
                              >
                                {u.role === 'admin' ? 'Make User' : 'Make Admin'}
                              </button>
                            )}

                            {/* Delete */}
                            {!isSelf && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleDeleteUser(u.email)}
                                className="p-1.5 rounded border border-rose-200 text-rose-700 hover:bg-rose-50 cursor-pointer disabled:opacity-50"
                                title="Delete user account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[var(--tp-muted)]">
                        No users match the current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Security Audit Log */}
          <div className="p-4 rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-line)]">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-[var(--tp-main)]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--tp-main)]">
                Recent Security &amp; Subscription Audit Trail
              </h2>
            </div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {audits.map((ev) => (
                <div
                  key={ev.id}
                  className="px-3 py-2 rounded-lg bg-white border border-[var(--tp-line)] flex flex-wrap items-center justify-between gap-2 text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                        ev.severity === 'warning'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {ev.eventType}
                    </span>
                    <span className="text-[var(--tp-main)]">{ev.detail}</span>
                  </div>
                  <div className="font-mono text-[10px] text-[var(--tp-muted)]">
                    {ev.actor} · {new Date(ev.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
              {audits.length === 0 && (
                <div className="text-xs text-[var(--tp-muted)]">No audit events recorded yet.</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

