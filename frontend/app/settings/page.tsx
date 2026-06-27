"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";
import {
  Bell,
  BellOff,
  Calendar,
  Check,
  Clock,
  Globe,
  KeyRound,
  Loader2,
  Save,
  Shield,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

type Tab = "profile" | "security" | "preferences" | "notifications";

type UserProfile = {
  id: string;
  email: string;
  name: string;
  timezone: string;
  workday_start: string;
  workday_end: string;
  notifications_enabled: boolean;
};

type Toast = { message: string; type: "success" | "error" };

const TIMEZONES = [
  "UTC",
  "Asia/Kolkata",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "America/Denver",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // Profile form state
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("UTC");

  // Preferences state
  const [workdayStart, setWorkdayStart] = useState("09:00");
  const [workdayEnd, setWorkdayEnd] = useState("18:00");

  // Notifications state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    api<UserProfile>("/users/me")
      .then((data) => {
        setProfile(data);
        setName(data.name);
        setTimezone(data.timezone);
        setWorkdayStart(data.workday_start);
        setWorkdayEnd(data.workday_end);
        setNotificationsEnabled(data.notifications_enabled);
      })
      .catch((err: unknown) => {
        const msg = err instanceof ApiError ? err.message : "Failed to load profile";
        showToast(msg, "error");
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile() {
    setSaving(true);
    try {
      const updated = await api<UserProfile>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ name, timezone }),
      });
      setProfile(updated);
      showToast("Profile updated successfully", "success");
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to update profile";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  async function savePreferences() {
    setSaving(true);
    try {
      const updated = await api<UserProfile>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ workday_start: workdayStart, workday_end: workdayEnd }),
      });
      setProfile(updated);
      showToast("Preferences saved", "success");
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to save preferences";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  async function saveNotifications() {
    setSaving(true);
    try {
      const updated = await api<UserProfile>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ notifications_enabled: notificationsEnabled }),
      });
      setProfile(updated);
      showToast("Notification settings saved", "success");
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to save notification settings";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }
    setSaving(true);
    try {
      await api("/users/me/password", {
        method: "PATCH",
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password changed successfully", "success");
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to change password";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User size={16} /> },
    { id: "security", label: "Security", icon: <Shield size={16} /> },
    { id: "preferences", label: "Preferences", icon: <Clock size={16} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  ];

  return (
    <AppShell>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium shadow-2xl backdrop-blur-xl border transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
              : "bg-rose-500/20 border-rose-500/40 text-rose-300"
          }`}
        >
          {toast.type === "success" ? <Check size={16} /> : null}
          {toast.message}
        </div>
      )}

      <PageHeader
        title="Settings"
        subtitle="Manage your profile, security, scheduling preferences, and notifications."
      />

      <div className="max-w-3xl space-y-6">
        {/* Tab Bar */}
        <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`settings-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 size={32} className="animate-spin text-white/30" />
          </div>
        ) : (
          <>
            {/* ── Profile Tab ── */}
            {activeTab === "profile" && (
              <div className="glass rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                    <User size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">Profile Information</h2>
                    <p className="text-xs text-white/50">Update your name and account details</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-widest">
                      Full Name
                    </label>
                    <Input
                      id="settings-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-widest">
                      Email Address
                    </label>
                    <Input
                      id="settings-email"
                      value={profile?.email ?? ""}
                      disabled
                      className="opacity-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-white/30">Email cannot be changed</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-widest flex items-center gap-1.5">
                      <Globe size={12} /> Timezone
                    </label>
                    <select
                      id="settings-timezone"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-cyan-400/60 transition"
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz} className="bg-[#0d0f18]">
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-white/5">
                  <Button
                    id="settings-save-profile"
                    onClick={saveProfile}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Profile
                  </Button>
                </div>
              </div>
            )}

            {/* ── Security Tab ── */}
            {activeTab === "security" && (
              <div className="glass rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">Change Password</h2>
                    <p className="text-xs text-white/50">Keep your account secure with a strong password</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-widest flex items-center gap-1.5">
                      <KeyRound size={12} /> Current Password
                    </label>
                    <Input
                      id="settings-current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-widest">
                      New Password
                    </label>
                    <Input
                      id="settings-new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-widest">
                      Confirm New Password
                    </label>
                    <Input
                      id="settings-confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                    />
                  </div>

                  {/* Password strength indicator */}
                  {newPassword.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              newPassword.length >= level * 3
                                ? level <= 1
                                  ? "bg-rose-400"
                                  : level <= 2
                                  ? "bg-amber-400"
                                  : level <= 3
                                  ? "bg-cyan-400"
                                  : "bg-emerald-400"
                                : "bg-white/10"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-white/30">
                        {newPassword.length < 4
                          ? "Too short"
                          : newPassword.length < 7
                          ? "Weak"
                          : newPassword.length < 10
                          ? "Good"
                          : "Strong"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2 border-t border-white/5">
                  <Button
                    id="settings-save-password"
                    onClick={changePassword}
                    disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                    className="flex items-center gap-2 bg-violet-500 hover:brightness-110"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                    Update Password
                  </Button>
                </div>
              </div>
            )}

            {/* ── Preferences Tab ── */}
            {activeTab === "preferences" && (
              <div className="glass rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">Scheduling Preferences</h2>
                    <p className="text-xs text-white/50">Set your working hours for AI-powered planning</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-widest">
                      Workday Starts
                    </label>
                    <Input
                      id="settings-workday-start"
                      type="time"
                      value={workdayStart}
                      onChange={(e) => setWorkdayStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-widest">
                      Workday Ends
                    </label>
                    <Input
                      id="settings-workday-end"
                      type="time"
                      value={workdayEnd}
                      onChange={(e) => setWorkdayEnd(e.target.value)}
                    />
                  </div>
                </div>

                {/* Visual preview */}
                <div className="rounded-xl bg-white/5 border border-white/5 p-4 space-y-2">
                  <p className="text-xs text-white/40 uppercase tracking-widest">Your Work Window</p>
                  <div className="flex items-center gap-3">
                    <div className="h-3 rounded-full bg-white/10 flex-1 relative overflow-hidden">
                      {(() => {
                        const parseTime = (t: string) => {
                          const [h, m] = t.split(":").map(Number);
                          return (h * 60 + m) / (24 * 60);
                        };
                        const left = parseTime(workdayStart) * 100;
                        const width = (parseTime(workdayEnd) - parseTime(workdayStart)) * 100;
                        return (
                          <div
                            className="absolute h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                            style={{ left: `${left}%`, width: `${Math.max(0, width)}%` }}
                          />
                        );
                      })()}
                    </div>
                    <span className="text-sm font-medium text-white/70">
                      {workdayStart} – {workdayEnd}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-white/20">
                    <span>12 AM</span>
                    <span>6 AM</span>
                    <span>12 PM</span>
                    <span>6 PM</span>
                    <span>12 AM</span>
                  </div>
                </div>

                {/* Calendar integrations */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-white/60 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar size={12} /> Calendar Integrations
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-white">Google Calendar</p>
                        <p className="text-xs text-white/40">Connected</p>
                      </div>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                        <Check size={12} className="text-emerald-400" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-white">Outlook Calendar</p>
                        <p className="text-xs text-white/40">Not connected</p>
                      </div>
                      <button className="rounded-lg bg-white/10 px-3 py-1 text-xs text-white/60 hover:bg-white/20 transition">
                        Connect
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-white/5">
                  <Button
                    id="settings-save-preferences"
                    onClick={savePreferences}
                    disabled={saving}
                    className="flex items-center gap-2 bg-emerald-500"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}

            {/* ── Notifications Tab ── */}
            {activeTab === "notifications" && (
              <div className="glass rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">Notification Settings</h2>
                    <p className="text-xs text-white/50">Control when and how Life Saver AI notifies you</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Master toggle */}
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4">
                    <div className="flex items-center gap-3">
                      {notificationsEnabled ? (
                        <Bell size={20} className="text-amber-400" />
                      ) : (
                        <BellOff size={20} className="text-white/30" />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-white">All Notifications</p>
                        <p className="text-xs text-white/40">
                          {notificationsEnabled ? "You will receive notifications" : "All notifications are muted"}
                        </p>
                      </div>
                    </div>
                    <button
                      id="settings-notifications-toggle"
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        notificationsEnabled ? "bg-amber-500" : "bg-white/10"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          notificationsEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Individual notification types */}
                  {[
                    {
                      label: "Task Reminders",
                      desc: "Notify before tasks are due",
                      defaultOn: true,
                    },
                    {
                      label: "AI Suggestions",
                      desc: "Smart planning recommendations",
                      defaultOn: true,
                    },
                    {
                      label: "Calendar Events",
                      desc: "Upcoming meeting alerts",
                      defaultOn: true,
                    },
                    {
                      label: "Weekly Summary",
                      desc: "Productivity report every Monday",
                      defaultOn: false,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center justify-between rounded-xl border px-5 py-4 transition-all duration-200 ${
                        notificationsEnabled
                          ? "border-white/10 bg-white/5"
                          : "border-white/5 bg-white/[0.02] opacity-40"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{item.label}</p>
                        <p className="text-xs text-white/40">{item.desc}</p>
                      </div>
                      <div
                        className={`h-2 w-2 rounded-full ${
                          item.defaultOn && notificationsEnabled ? "bg-amber-400" : "bg-white/10"
                        }`}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2 border-t border-white/5">
                  <Button
                    id="settings-save-notifications"
                    onClick={saveNotifications}
                    disabled={saving}
                    className="flex items-center gap-2 bg-amber-500"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Notifications
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
