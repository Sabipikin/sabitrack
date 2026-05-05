"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

const lightPalette = {
  bg: "#FFFFFF",
  surface: "#F8FAFB",
  card: "#FFFFFF",
  border: "#E5E7EB",
  violet: "#6366F1",
  lime: "#10B981",
  pink: "#EC4899",
  cyan: "#06B6D4",
  amber: "#F59E0B",
  text: "#111827",
  muted: "#6B7280",
  dim: "#D1D5DB",
  green: "#10B981",
  shadow: "rgba(0, 0, 0, 0.08)",
};

const darkPalette = {
  bg: "#090B11",
  surface: "#111827",
  card: "#1F2937",
  border: "#374151",
  violet: "#818CF8",
  lime: "#34D399",
  pink: "#F472B6",
  cyan: "#67E8F9",
  amber: "#FBBF24",
  text: "#E2E8F0",
  muted: "#94A3B8",
  dim: "#64748B",
  green: "#4ADE80",
  shadow: "rgba(0, 0, 0, 0.28)",
};

let C = { ...lightPalette };

type DashboardScreenProps = {
  user: { name: string; email: string; whatsapp: string };
  goal: any;
  allGoals: any[];
  currentGoalId: string | null;
  switchGoal: (id: string) => void;
  roadmap: Record<string, any> | null;
  tasks: boolean[];
  setTasks: (tasks: boolean[]) => void;
  onTaskUpdate: (taskIndex: number, completed: boolean, taskText: string) => void;
  onCreateGoal: () => void;
  onEditGoal: (goal: any) => void;
  bgMode: "white" | "black";
  toggleBgMode: () => void;
  dbConnected: boolean | null;
  analytics: { 
    streak: number; 
    currentWeek: number; 
    weeklyTrend: number[];
    totalCompleted: number;
    completionRate: number;
    bestStreak: number;
    averageDaily: number;
    goalProgress: number;
    weeklyProgress: number;
    monthlyProgress: number;
  };
  onSettings: () => void;
};

const page: React.CSSProperties = {
  maxWidth: 430,
  margin: "0 auto",
  padding: "0 18px 110px",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

const H = (sz = 30, x: React.CSSProperties = {}): React.CSSProperties => ({ fontFamily: "'Syne',sans-serif", fontSize: sz, fontWeight: 800, lineHeight: 1.15, letterSpacing: -0.5, color: C.text, ...x });
const Card = (x: React.CSSProperties = {}): React.CSSProperties => ({ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px", boxShadow: `0 1px 3px ${C.shadow}`, ...x });
const Lime = (x: React.CSSProperties = {}): React.CSSProperties => ({ background: C.lime, color: "#FFFFFF", border: "none", borderRadius: 12, padding: "12px 24px", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: -0.2, transition: "all .2s", ...x });
const Ghost = (x: React.CSSProperties = {}): React.CSSProperties => ({ background: "transparent", color: C.muted, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 20px", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .2s", ...x });
const Input = (x: React.CSSProperties = {}): React.CSSProperties => ({ width: "100%", padding: "12px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, fontFamily: "inherit", fontWeight: 500, outline: "none", boxSizing: "border-box", ...x });

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 8, cursor: onClick ? "pointer" : "default" }}>
      <div style={{ width: 30, height: 30, background: C.lime, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, color: "#07070E" }}>S</div>
      <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: -0.4 }}>SabiTrack</span>
    </div>
  );
}

function TopNav({ right, onLogoClick }: { right?: React.ReactNode; onLogoClick?: () => void }) {
  return (
    <div style={{ padding: "18px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Logo onClick={onLogoClick} />
      {right}
    </div>
  );
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function InstallPrompt({
  visible,
  promptEvent,
  isIos,
  onInstall,
  onHelp,
  onDismiss,
}: {
  visible: boolean;
  promptEvent: BeforeInstallPromptEvent | null;
  isIos: boolean;
  onInstall: () => void;
  onHelp: () => void;
  onDismiss: () => void;
}) {
  if (!visible) return null;

  const message = promptEvent
    ? "Install SabiTrack for faster access and offline-ready use."
    : "Add SabiTrack to your Home Screen from Safari for a native-like app experience.";

  return (
    <div style={{
      position: "fixed",
      left: "50%",
      bottom: 20,
      transform: "translateX(-50%)",
      width: "min(420px, calc(100% - 24px))",
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 18,
      padding: "16px 18px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12)",
      zIndex: 999,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>Install SabiTrack</div>
          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{message}</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          {promptEvent ? (
            <button onClick={onInstall} style={Lime({ padding: "10px 16px", whiteSpace: "nowrap" })}>Install app</button>
          ) : isIos ? (
            <button onClick={onHelp} style={Lime({ padding: "10px 16px", whiteSpace: "nowrap" })}>How to install</button>
          ) : null}
          <button onClick={onDismiss} style={Ghost({ padding: "10px 16px", whiteSpace: "nowrap" })}>Dismiss</button>
        </div>
      </div>
    </div>
  );
}

function Pill({ children, color = C.violet, style = {} }: { children: React.ReactNode; color?: string; style?: React.CSSProperties }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 100, background: `${color}18`, border: `1px solid ${color}40`, fontSize: 12, color, fontWeight: 700, ...style }}>
      {children}
    </span>
  );
}

function LandingScreen({ onStart, bgMode, toggleBgMode, onLogoClick }: { onStart: () => void; bgMode: "white" | "black"; toggleBgMode: () => void; onLogoClick: () => void }) {
  return (
    <div style={page}>
      <TopNav onLogoClick={onLogoClick} right={<div style={{ display: "flex", alignItems: "center", gap: 8 }}><button onClick={toggleBgMode} style={Ghost({ padding: "10px 12px", fontSize: 12, color: C.text, borderColor: C.muted })}>{bgMode === "black" ? "☀️ Light" : "🌙 Dark"}</button><button onClick={onStart} style={Ghost({ padding: "9px 18px", fontSize: 13 })}>log in</button></div>} />
      <div className="fadeUp" style={{ paddingTop: 12 }}>
        <Pill color={C.lime} style={{ marginBottom: 22 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.lime, display: "inline-block" }} />
          built for the execution era
        </Pill>
        <h1 style={H(42, { marginBottom: 18, lineHeight: 1.08 })}>
          Stop ghosting<br />
          your goals. <span style={{ color: C.lime }}>fr.</span>
        </h1>
        <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.7, marginBottom: 34, fontWeight: 500 }}>
          One real goal → AI breaks it into daily moves → WhatsApp keeps you locked in. No fluff. Just results.
        </p>
        <button onClick={onStart} style={Lime({ width: "100%", padding: "18px", fontSize: 17 })}>
          start my goal plan →
        </button>
        <p style={{ textAlign: "center", fontSize: 12, color: C.dim, marginTop: 10, fontWeight: 600 }}>
          takes 2 mins • free • no cap
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 36 }}>
        {[
          { icon: "🎯", title: "one goal, max clarity", sub: "no overwhelm — just one thing at a time" },
          { icon: "🤖", title: "ai builds your roadmap", sub: "year → quarter → month → week → today" },
          { icon: "💬", title: "whatsapp accountability", sub: "daily check-ins where you already live" },
          { icon: "🔥", title: "edit everything", sub: "ai starts it, you finish it your way" },
        ].map((f, i) => (
          <div key={f.title} className={`fadeUp s${i + 1}`} style={Card({ display: "flex", alignItems: "flex-start", gap: 14, padding: "15px 16px" })}>
            <span style={{ fontSize: 24, flexShrink: 0, marginTop: 1 }}>{f.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Syne',sans-serif", marginBottom: 2 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{f.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-around", marginTop: 40, paddingTop: 28, borderTop: `1px solid ${C.border}` }}>
        {[["2k+", "goals set"], ["94%", "hit week 1"], ["3 min", "to set up"]].map(([n, l]) => (
          <div key={String(l)} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: C.lime }}>{n}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2, fontWeight: 600 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SignupScreen({ user, setUser, onNext, onSignin, isLoading, onLogoClick }: { user: { name: string; email: string; whatsapp: string; password: string; username: string }; setUser: (user: any) => void; onNext: (userData: { name: string; email: string; whatsapp: string; password: string; username: string }) => Promise<void>; onSignin: () => void; isLoading: boolean; onLogoClick: () => void }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const ready = user.username.trim() && user.email.trim() && user.password.length >= 6 && user.name.trim();
  return (
    <div style={page}>
      <TopNav onLogoClick={onLogoClick} />
      <div className="fadeUp" style={{ paddingTop: 16 }}>
        <h2 style={H(28, { marginBottom: 6 })}>create your account</h2>
        <p style={{ color: C.muted, fontSize: 15, marginBottom: 32, fontWeight: 500 }}>join sabi track & start crushing goals</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "your name", key: "name", type: "text", ph: "Ada Okafor" },
            { label: "username", key: "username", type: "text", ph: "adaokafor" },
            { label: "email", key: "email", type: "email", ph: "ada@example.com" },
            { label: "whatsapp number", key: "whatsapp", type: "tel", ph: "+234 801 234 5678" },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>{f.label}</label>
              <input type={f.type} placeholder={f.ph} value={user[f.key as keyof typeof user]} onChange={e => setUser({ ...user, [f.key]: e.target.value })} disabled={isLoading} style={Input()} />
            </div>
          ))}
          <div>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>password (min 6 chars)</label>
            <div style={{ position: "relative" }}>
              <input type={passwordVisible ? "text" : "password"} placeholder="create a strong password" value={user.password} onChange={e => setUser({ ...user, password: e.target.value })} disabled={isLoading} style={Input()} />
              <button onClick={() => setPasswordVisible(!passwordVisible)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.muted }}>
                {passwordVisible ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>
          <div style={Card({ background: `${C.cyan}0D`, border: `1.5px solid ${C.cyan}30`, padding: "13px 15px", borderRadius: 16 })}>
            <p style={{ fontSize: 13, color: C.cyan, fontWeight: 600, lineHeight: 1.5 }}>
              📱 daily accountability drops straight to your whatsapp. no app download needed.
            </p>
          </div>
          <button onClick={() => ready && onNext(user)} disabled={!ready || isLoading} style={Lime({ width: "100%", padding: "17px", opacity: ready && !isLoading ? 1 : 0.3 })}>
            {isLoading ? "creating..." : "create account →"}
          </button>
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <span style={{ fontSize: 14, color: C.muted }}>already have an account? </span>
            <button onClick={onSignin} style={{ background: "none", border: "none", color: C.lime, fontSize: 14, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>
              sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SigninScreen({ onNext, onSignup, isLoading, onLogoClick }: { onNext: (email: string, password: string) => Promise<void>; onSignup: () => void; isLoading: boolean; onLogoClick: () => void }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const ready = identifier.trim() && password.length >= 6;

  const handleSignin = async () => {
    setError("");
    try {
      await onNext(identifier, password);
    } catch (err: any) {
      setError(err.message || "Sign in failed. Please try again.");
    }
  };

  return (
    <div style={page}>
      <TopNav onLogoClick={onLogoClick} />
      <div className="fadeUp" style={{ paddingTop: 16 }}>
        <h2 style={H(28, { marginBottom: 6 })}>welcome back</h2>
        <p style={{ color: C.muted, fontSize: 15, marginBottom: 32, fontWeight: 500 }}>sign in to your account</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>email, phone, or username</label>
            <input type="text" placeholder="ada@example.com, +234..., or adaokafor" value={identifier} onChange={e => setIdentifier(e.target.value)} disabled={isLoading} style={Input()} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>password</label>
            <div style={{ position: "relative" }}>
              <input type={passwordVisible ? "text" : "password"} placeholder="your password" value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} style={Input()} />
              <button onClick={() => setPasswordVisible(!passwordVisible)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.muted }}>
                {passwordVisible ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>
          {error && (
            <div style={{ padding: "10px 12px", background: `${C.pink}10`, border: `1px solid ${C.pink}30`, borderRadius: 8, fontSize: 13, color: C.pink }}>
              {error}
            </div>
          )}
          <button onClick={handleSignin} disabled={!ready || isLoading} style={Lime({ width: "100%", padding: "17px", opacity: ready && !isLoading ? 1 : 0.3 })}>
            {isLoading ? "signing in..." : "sign in →"}
          </button>
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <span style={{ fontSize: 14, color: C.muted }}>don't have an account? </span>
            <button onClick={onSignup} style={{ background: "none", border: "none", color: C.lime, fontSize: 14, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>
              create one
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const CATEGORIES = [
  { label: "Business", emoji: "💼" },
  { label: "Career", emoji: "🚀" },
  { label: "Finance", emoji: "💰" },
  { label: "Health", emoji: "🏋️" },
  { label: "Study", emoji: "📚" },
  { label: "Personal", emoji: "✨" },
];
const DURATIONS = [
  { val: "3 months", label: "3mo", sub: "quick sprint" },
  { val: "6 months", label: "6mo", sub: "solid push" },
  { val: "1 year", label: "1yr", sub: "big move" },
  { val: "2 years", label: "2yr", sub: "life change" },
];

function WizardScreen({ goal, setGoal, onGenerate, isEditing = false, onLogoClick }: { goal: { id: string; title: string; duration: string; motivation: string; category: string }; setGoal: React.Dispatch<React.SetStateAction<{ id: string; title: string; duration: string; motivation: string; category: string }>>; onGenerate: () => void; isEditing?: boolean; onLogoClick: () => void }) {
  const [step, setStep] = useState(1);
  const canGo = [
    goal.title.trim().length > 5,
    !!goal.duration,
    goal.motivation.trim().length > 5,
    !!goal.category,
  ];

  const steps = [
    {
      q: "what's the goal?",
      sub: "be specific — vague goals get vague results.",
      el: <textarea value={goal.title} onChange={e => setGoal({ ...goal, title: e.target.value })} placeholder={"e.g. launch my store and hit ₦500k monthly\nrevenue in 6 months"} rows={5} style={Input({ borderRadius: 20, lineHeight: 1.7 })} />,
    },
    {
      q: "how long you got?",
      sub: "be real with yourself.",
      el: (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {DURATIONS.map(d => {
            const on = goal.duration === d.val;
            return (
              <button key={d.val} onClick={() => setGoal({ ...goal, duration: d.val })} style={Card({ cursor: "pointer", textAlign: "center", padding: "20px 12px", border: `2px solid ${on ? C.lime : C.border}`, background: on ? `${C.lime}15` : C.card })}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: on ? C.lime : C.text }}>{d.label}</div>
                <div style={{ fontSize: 12, color: on ? C.lime : C.muted, fontWeight: 700, marginTop: 4 }}>{d.sub}</div>
              </button>
            );
          })}
        </div>
      ),
    },
    {
      q: "why does this hit?",
      sub: "your why is your fuel when things get hard.",
      el: <textarea value={goal.motivation} onChange={e => setGoal({ ...goal, motivation: e.target.value })} placeholder={"i'm tired of watching others win.\ni want to build something real..."} rows={6} style={Input({ borderRadius: 20, lineHeight: 1.7 })} />,
    },
    {
      q: "pick a vibe.",
      sub: "what category fits this goal?",
      el: (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {CATEGORIES.map(c => {
            const on = goal.category === c.label;
            return (
              <button key={c.label} onClick={() => setGoal({ ...goal, category: c.label })} style={{ padding: "10px 18px", borderRadius: 100, border: `1.5px solid ${on ? C.violet : C.border}`, background: on ? `${C.violet}18` : "transparent", color: on ? C.violet : C.muted, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                {c.emoji} {c.label}
              </button>
            );
          })}
        </div>
      ),
    },
  ];

  const cur = steps[step - 1];
  return (
    <div style={page}>
      <TopNav onLogoClick={onLogoClick} />
      <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
        {steps.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i < step ? C.lime : C.border, transition: "background .3s" }} />
        ))}
      </div>
      <div className="fadeUp" key={step}>
        <div style={{ fontSize: 11, color: C.violet, textTransform: "uppercase", letterSpacing: 2, fontWeight: 800, marginBottom: 8 }}>{isEditing ? "editing goal" : "step"} {step} of 4</div>
        <h2 style={H(26, { marginBottom: 8 })}>{isEditing ? "update your goal" : cur.q}</h2>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 26, fontWeight: 600 }}>{cur.sub}</p>
        <div style={{ marginBottom: 28 }}>{cur.el}</div>
        <div style={{ display: "flex", gap: 10 }}>
          {step > 1 && <button onClick={() => setStep(s => s - 1)} style={Ghost({ flex: 1 })}>← back</button>}
          <button onClick={() => step === 4 ? onGenerate() : setStep(s => s + 1)} disabled={!canGo[step - 1]} style={Lime({ flex: 2, opacity: canGo[step - 1] ? 1 : 0.3 })}>
            {step === 4 ? (isEditing ? "update roadmap 🔥" : "cook my roadmap 🔥") : "next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

const TIERS = [
  { key: "year_target", label: "year goal", emoji: "🌟", color: C.amber },
  { key: "quarter_target", label: "3-month mark", emoji: "🎯", color: C.violet },
  { key: "month_targets", label: "this month", emoji: "📅", color: C.cyan },
  { key: "week_targets", label: "this week", emoji: "⚡", color: C.lime },
];

const LOADING_MSGS = [
  "no more ghosting your goals 👻",
  "ai is in its planning era ✨",
  "mapping your W right now...",
  "turning vision into tasks 🔥",
  "this one's gonna go crazy fr",
];

function ManualRoadmapForm({ goal, onSave, isLoading, onLogoClick }: { goal: { title: string; duration: string; motivation: string; category: string }; onSave: (roadmap: any) => Promise<void>; isLoading: boolean; onLogoClick: () => void }) {
  const [yearTarget, setYearTarget] = useState("");
  const [quarterTarget, setQuarterTarget] = useState("");
  const [monthTargets, setMonthTargets] = useState([""]);
  const [weekTargets, setWeekTargets] = useState([""]);
  const [dailyTargets, setDailyTargets] = useState(["", "", ""]);
  const [newMonthTarget, setNewMonthTarget] = useState("");
  const [newWeekTarget, setNewWeekTarget] = useState("");
  const [newDailyTarget, setNewDailyTarget] = useState("");
  const [saving, setSaving] = useState(false);

  const addMonthTarget = () => {
    if (!newMonthTarget.trim()) return;
    setMonthTargets([...monthTargets, newMonthTarget.trim()]);
    setNewMonthTarget("");
  };

  const removeMonthTarget = (i: number) => {
    setMonthTargets(monthTargets.filter((_, idx) => idx !== i));
  };

  const updateMonthTarget = (i: number, val: string) => {
    const t = [...monthTargets];
    t[i] = val;
    setMonthTargets(t);
  };

  const addWeekTarget = () => {
    if (!newWeekTarget.trim()) return;
    setWeekTargets([...weekTargets, newWeekTarget.trim()]);
    setNewWeekTarget("");
  };

  const removeWeekTarget = (i: number) => {
    setWeekTargets(weekTargets.filter((_, idx) => idx !== i));
  };

  const updateWeekTarget = (i: number, val: string) => {
    const t = [...weekTargets];
    t[i] = val;
    setWeekTargets(t);
  };

  const addDailyTarget = () => {
    if (!newDailyTarget.trim()) return;
    setDailyTargets([...dailyTargets, newDailyTarget.trim()]);
    setNewDailyTarget("");
  };

  const removeDailyTarget = (i: number) => {
    setDailyTargets(dailyTargets.filter((_, idx) => idx !== i));
  };

  const updateDailyTarget = (i: number, val: string) => {
    const t = [...dailyTargets];
    t[i] = val;
    setDailyTargets(t);
  };

  const handleSave = async () => {
    if (!yearTarget.trim() || !quarterTarget.trim() || monthTargets.some(t => !t.trim()) || weekTargets.some(t => !t.trim()) || dailyTargets.some(t => !t.trim())) {
      alert("Please fill in all fields");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        year_target: yearTarget,
        quarter_target: quarterTarget,
        month_targets: monthTargets,
        week_targets: weekTargets,
        daily_targets: dailyTargets,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={page}>
      <TopNav onLogoClick={onLogoClick} />
      <div style={{ marginBottom: 24 }}>
        <h2 style={H(24, { marginBottom: 6 })}>build your roadmap manually</h2>
        <p style={{ color: C.muted, fontSize: 14, fontWeight: 600 }}>
          AI is taking a nap — let's create your plan together
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={Card({ background: `${C.amber}0D`, border: `1.5px solid ${C.amber}30`, padding: "11px 14px", borderRadius: 16, display: "flex", gap: 10, alignItems: "center" })}>
          <span style={{ fontSize: 16 }}>✍️</span>
          <span style={{ fontSize: 13, color: C.amber, fontWeight: 700 }}>fill in each level of your roadmap</span>
        </div>

        {[
          { key: "year", emoji: "📅", label: "year target", value: yearTarget, onChange: setYearTarget, sub: "your ultimate goal by end of year" },
          { key: "quarter", emoji: "📊", label: "quarter target", value: quarterTarget, onChange: setQuarterTarget, sub: "what you'll achieve in 3 months" },
        ].map((t) => (
          <div key={t.key} style={Card({ borderLeft: `3px solid ${C.lime}`, paddingLeft: 18 })}>
            <div style={{ fontSize: 10, color: C.lime, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>{t.emoji} {t.label}</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, fontWeight: 500 }}>{t.sub}</div>
            <textarea
              value={t.value}
              onChange={e => t.onChange(e.target.value)}
              placeholder="write your target..."
              rows={2}
              style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1.5px dashed ${C.dim}`, color: C.text, fontSize: 14, fontFamily: "inherit", fontWeight: 600, lineHeight: 1.65, outline: "none", resize: "none", padding: "4px 0" }}
            />
          </div>
        ))}

        <div style={Card({ borderLeft: `3px solid ${C.cyan}`, paddingLeft: 18 })}>
          <div style={{ fontSize: 10, color: C.cyan, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>🎯 monthly targets ({monthTargets.length})</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {monthTargets.map((target, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: 8, background: `${C.cyan}18`, border: `1px solid ${C.cyan}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: C.cyan, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <input
                  value={target}
                  onChange={e => updateMonthTarget(i, e.target.value)}
                  placeholder="write your monthly target..."
                  style={{ flex: 1, background: "transparent", border: "none", borderBottom: `1.5px dashed ${C.dim}`, color: C.text, fontSize: 14, fontFamily: "inherit", fontWeight: 600, padding: "5px 0", outline: "none" }}
                />
                <button onClick={() => removeMonthTarget(i)} style={{ width: 26, height: 26, borderRadius: "50%", background: C.surface, border: `1px solid ${C.border}`, color: C.muted, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, lineHeight: 1, fontFamily: "inherit" }}>×</button>
              </div>
            ))}

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: `${C.lime}18`, border: `1px dashed ${C.lime}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: C.lime, flexShrink: 0 }}>+</div>
              <input
                value={newMonthTarget}
                onChange={e => setNewMonthTarget(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addMonthTarget()}
                placeholder="add more monthly targets... (press Enter)"
                style={{ flex: 1, background: "transparent", border: "none", borderBottom: `1.5px dashed ${C.dim}`, color: C.text, fontSize: 14, fontFamily: "inherit", fontWeight: 600, padding: "5px 0", outline: "none" }}
              />
              {newMonthTarget.trim() && (
                <button onClick={addMonthTarget} style={{ padding: "5px 12px", borderRadius: 100, background: `${C.lime}18`, border: `1px solid ${C.lime}40`, color: C.lime, fontSize: 12, fontFamily: "inherit", fontWeight: 800, cursor: "pointer" }}>add</button>
              )}
            </div>
          </div>
        </div>

        <div style={Card({ borderLeft: `3px solid ${C.violet}`, paddingLeft: 18 })}>
          <div style={{ fontSize: 10, color: C.violet, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>⚡ weekly targets ({weekTargets.length})</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {weekTargets.map((target, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: 8, background: `${C.violet}18`, border: `1px solid ${C.violet}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: C.violet, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <input
                  value={target}
                  onChange={e => updateWeekTarget(i, e.target.value)}
                  placeholder="write your weekly target..."
                  style={{ flex: 1, background: "transparent", border: "none", borderBottom: `1.5px dashed ${C.dim}`, color: C.text, fontSize: 14, fontFamily: "inherit", fontWeight: 600, padding: "5px 0", outline: "none" }}
                />
                <button onClick={() => removeWeekTarget(i)} style={{ width: 26, height: 26, borderRadius: "50%", background: C.surface, border: `1px solid ${C.border}`, color: C.muted, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, lineHeight: 1, fontFamily: "inherit" }}>×</button>
              </div>
            ))}

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: `${C.lime}18`, border: `1px dashed ${C.lime}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: C.lime, flexShrink: 0 }}>+</div>
              <input
                value={newWeekTarget}
                onChange={e => setNewWeekTarget(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addWeekTarget()}
                placeholder="add more weekly targets... (press Enter)"
                style={{ flex: 1, background: "transparent", border: "none", borderBottom: `1.5px dashed ${C.dim}`, color: C.text, fontSize: 14, fontFamily: "inherit", fontWeight: 600, padding: "5px 0", outline: "none" }}
              />
              {newWeekTarget.trim() && (
                <button onClick={addWeekTarget} style={{ padding: "5px 12px", borderRadius: 100, background: `${C.lime}18`, border: `1px solid ${C.lime}40`, color: C.lime, fontSize: 12, fontFamily: "inherit", fontWeight: 800, cursor: "pointer" }}>add</button>
              )}
            </div>
          </div>
        </div>

        <div style={Card({ borderLeft: `3px solid ${C.pink}`, paddingLeft: 18 })}>
          <div style={{ fontSize: 10, color: C.pink, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>🔥 daily targets ({dailyTargets.length})</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {dailyTargets.map((target, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: 8, background: `${C.pink}18`, border: `1px solid ${C.pink}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: C.pink, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <input
                  value={target}
                  onChange={e => updateDailyTarget(i, e.target.value)}
                  placeholder="write your daily target..."
                  style={{ flex: 1, background: "transparent", border: "none", borderBottom: `1.5px dashed ${C.dim}`, color: C.text, fontSize: 14, fontFamily: "inherit", fontWeight: 600, padding: "5px 0", outline: "none" }}
                />
                <button onClick={() => removeDailyTarget(i)} style={{ width: 26, height: 26, borderRadius: "50%", background: C.surface, border: `1px solid ${C.border}`, color: C.muted, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, lineHeight: 1, fontFamily: "inherit" }}>×</button>
              </div>
            ))}

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: `${C.lime}18`, border: `1px dashed ${C.lime}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: C.lime, flexShrink: 0 }}>+</div>
              <input
                value={newDailyTarget}
                onChange={e => setNewDailyTarget(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addDailyTarget()}
                placeholder="add more daily targets... (press Enter)"
                style={{ flex: 1, background: "transparent", border: "none", borderBottom: `1.5px dashed ${C.dim}`, color: C.text, fontSize: 14, fontFamily: "inherit", fontWeight: 600, padding: "5px 0", outline: "none" }}
              />
              {newDailyTarget.trim() && (
                <button onClick={addDailyTarget} style={{ padding: "5px 12px", borderRadius: 100, background: `${C.lime}18`, border: `1px solid ${C.lime}40`, color: C.lime, fontSize: 12, fontFamily: "inherit", fontWeight: 800, cursor: "pointer" }}>add</button>
              )}
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving || isLoading} style={Lime({ width: "100%", fontSize: 15, padding: "16px", opacity: saving || isLoading ? 0.6 : 1 })}>
          {saving || isLoading ? "saving..." : "lock it in 🔒"}
        </button>
      </div>
    </div>
  );
}

function RoadmapScreen({ roadmap, setRoadmap, loading, goal, onApprove, onRegenerate, onLogoClick }: { roadmap: Record<string, any> | null; setRoadmap: React.Dispatch<React.SetStateAction<Record<string, any> | null>>; loading: boolean; goal: { title: string; duration: string; motivation: string; category: string }; onApprove: () => void; onRegenerate: () => void; onLogoClick: () => void }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [newMonthTarget, setNewMonthTarget] = useState("");
  const [newWeekTarget, setNewWeekTarget] = useState("");
  const [newDailyTarget, setNewDailyTarget] = useState("");

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setMsgIdx(i => (i + 1) % LOADING_MSGS.length), 1800);
    return () => clearInterval(t);
  }, [loading]);

  const updateTier = (key: string, val: string) => setRoadmap(r => r ? ({ ...r, [key]: val }) : r);
  const updateArrayItem = (key: string, i: number, val: string) => setRoadmap(r => {
    if (!r) return r;
    const arr = [...r[key]];
    arr[i] = val;
    return { ...r, [key]: arr };
  });
  const removeArrayItem = (key: string, i: number) => setRoadmap(r => {
    if (!r) return r;
    return { ...r, [key]: r[key].filter((_: unknown, idx: number) => idx !== i) };
  });
  const addArrayItem = (key: string, val: string) => {
    if (!val.trim()) return;
    setRoadmap(r => {
      if (!r) return r;
      return { ...r, [key]: [...r[key], val.trim()] };
    });
  };

  const addMonthTarget = () => {
    addArrayItem("month_targets", newMonthTarget);
    setNewMonthTarget("");
  };

  const addWeekTarget = () => {
    addArrayItem("week_targets", newWeekTarget);
    setNewWeekTarget("");
  };

  const addDailyTarget = () => {
    addArrayItem("daily_targets", newDailyTarget);
    setNewDailyTarget("");
  };

  return (
    <div style={page}>
      <TopNav onLogoClick={onLogoClick} />
      <div style={{ marginBottom: 24 }}>
        <h2 style={H(24, { marginBottom: 6 })}>
          {loading ? "cooking your plan..." : "your roadmap 🗺️"}
        </h2>
        <p style={{ color: C.muted, fontSize: 14, fontWeight: 600 }}>
          {loading ? LOADING_MSGS[msgIdx] : "tap any field to edit • add your own moves"}
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {TIERS.map((t, i) => (
            <div key={t.key} style={Card({ borderLeft: `3px solid ${t.color}`, paddingLeft: 18, opacity: 0.3 + i * 0.15 })}>
              <div style={{ fontSize: 10, color: t.color, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>{t.emoji} {t.label}</div>
              <div className="skel" style={{ height: 14, width: `${55 + i * 10}%` }} />
            </div>
          ))}
          <div style={Card({ borderLeft: `3px solid ${C.pink}`, paddingLeft: 18, opacity: 0.5 })}>
            <div style={{ fontSize: 10, color: C.pink, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>🔥 daily moves</div>
            {[70, 85, 60].map((w, i) => <div key={i} className="skel" style={{ height: 12, width: `${w}%`, marginBottom: 10 }} />)}
          </div>
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
            <div style={{ width: 22, height: 22, border: `3px solid ${C.lime}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
          </div>
        </div>
      ) : roadmap ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="fadeUp" style={Card({ background: `${C.lime}0D`, border: `1.5px solid ${C.lime}30`, padding: "11px 14px", borderRadius: 16, display: "flex", gap: 10, alignItems: "center" })}>
            <span style={{ fontSize: 16 }}>✏️</span>
            <span style={{ fontSize: 13, color: C.lime, fontWeight: 700 }}>everything is editable — make it yours</span>
          </div>

          <div className={`fadeUp s1`} style={Card({ borderLeft: `3px solid ${C.amber}`, paddingLeft: 18 })}>
            <div style={{ fontSize: 10, color: C.amber, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>🌟 year goal</div>
            <textarea
              value={roadmap.year_target}
              onChange={e => updateTier("year_target", e.target.value)}
              rows={2}
              style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1.5px dashed ${C.dim}`, color: C.text, fontSize: 14, fontFamily: "inherit", fontWeight: 600, lineHeight: 1.65, outline: "none", resize: "none", padding: "4px 0" }}
            />
          </div>

          <div className={`fadeUp s2`} style={Card({ borderLeft: `3px solid ${C.violet}`, paddingLeft: 18 })}>
            <div style={{ fontSize: 10, color: C.violet, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>🎯 3-month mark</div>
            <textarea
              value={roadmap.quarter_target}
              onChange={e => updateTier("quarter_target", e.target.value)}
              rows={2}
              style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1.5px dashed ${C.dim}`, color: C.text, fontSize: 14, fontFamily: "inherit", fontWeight: 600, lineHeight: 1.65, outline: "none", resize: "none", padding: "4px 0" }}
            />
          </div>

          <div className={`fadeUp s3`} style={Card({ borderLeft: `3px solid ${C.cyan}`, paddingLeft: 18 })}>
            <div style={{ fontSize: 10, color: C.cyan, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>📅 this month ({roadmap.month_targets?.length || 0})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {roadmap.month_targets?.map((target: string, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 8, background: `${C.cyan}18`, border: `1px solid ${C.cyan}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: C.cyan, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <input
                    value={target}
                    onChange={e => updateArrayItem("month_targets", i, e.target.value)}
                    placeholder="write your monthly target..."
                    style={{ flex: 1, background: "transparent", border: "none", borderBottom: `1.5px dashed ${C.dim}`, color: C.text, fontSize: 14, fontFamily: "inherit", fontWeight: 600, padding: "5px 0", outline: "none" }}
                  />
                  <button onClick={() => removeArrayItem("month_targets", i)} style={{ width: 26, height: 26, borderRadius: "50%", background: C.surface, border: `1px solid ${C.border}`, color: C.muted, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, lineHeight: 1, fontFamily: "inherit" }}>×</button>
                </div>
              ))}

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                <div style={{ width: 24, height: 24, borderRadius: 8, background: `${C.lime}18`, border: `1px dashed ${C.lime}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: C.lime, flexShrink: 0 }}>+</div>
                <input
                  value={newMonthTarget}
                  onChange={e => setNewMonthTarget(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addMonthTarget()}
                  placeholder="add monthly target... (press Enter)"
                  style={{ flex: 1, background: "transparent", border: "none", borderBottom: `1.5px dashed ${C.dim}`, color: C.text, fontSize: 14, fontFamily: "inherit", fontWeight: 600, padding: "5px 0", outline: "none" }}
                />
                {newMonthTarget.trim() && (
                  <button onClick={addMonthTarget} style={{ padding: "5px 12px", borderRadius: 100, background: `${C.lime}18`, border: `1px solid ${C.lime}40`, color: C.lime, fontSize: 12, fontFamily: "inherit", fontWeight: 800, cursor: "pointer" }}>add</button>
                )}
              </div>
            </div>
          </div>

          <div className={`fadeUp s4`} style={Card({ borderLeft: `3px solid ${C.lime}`, paddingLeft: 18 })}>
            <div style={{ fontSize: 10, color: C.lime, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>⚡ this week ({roadmap.week_targets?.length || 0})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {roadmap.week_targets?.map((target: string, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 8, background: `${C.lime}18`, border: `1px solid ${C.lime}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: C.lime, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <input
                    value={target}
                    onChange={e => updateArrayItem("week_targets", i, e.target.value)}
                    placeholder="write your weekly target..."
                    style={{ flex: 1, background: "transparent", border: "none", borderBottom: `1.5px dashed ${C.dim}`, color: C.text, fontSize: 14, fontFamily: "inherit", fontWeight: 600, padding: "5px 0", outline: "none" }}
                  />
                  <button onClick={() => removeArrayItem("week_targets", i)} style={{ width: 26, height: 26, borderRadius: "50%", background: C.surface, border: `1px solid ${C.border}`, color: C.muted, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, lineHeight: 1, fontFamily: "inherit" }}>×</button>
                </div>
              ))}

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                <div style={{ width: 24, height: 24, borderRadius: 8, background: `${C.lime}18`, border: `1px dashed ${C.lime}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: C.lime, flexShrink: 0 }}>+</div>
                <input
                  value={newWeekTarget}
                  onChange={e => setNewWeekTarget(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addWeekTarget()}
                  placeholder="add weekly target... (press Enter)"
                  style={{ flex: 1, background: "transparent", border: "none", borderBottom: `1.5px dashed ${C.dim}`, color: C.text, fontSize: 14, fontFamily: "inherit", fontWeight: 600, padding: "5px 0", outline: "none" }}
                />
                {newWeekTarget.trim() && (
                  <button onClick={addWeekTarget} style={{ padding: "5px 12px", borderRadius: 100, background: `${C.lime}18`, border: `1px solid ${C.lime}40`, color: C.lime, fontSize: 12, fontFamily: "inherit", fontWeight: 800, cursor: "pointer" }}>add</button>
                )}
              </div>
            </div>
          </div>

          <div className="fadeUp s5" style={Card({ borderLeft: `3px solid ${C.pink}`, paddingLeft: 18 })}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: C.pink, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5 }}>🔥 daily targets</div>
              <Pill color={C.pink}>{roadmap.daily_targets?.length || 0} tasks</Pill>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {roadmap.daily_targets?.map((task: string, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 8, background: `${C.pink}18`, border: `1px solid ${C.pink}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: C.pink, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <input
                    value={task}
                    onChange={e => updateArrayItem("daily_targets", i, e.target.value)}
                    placeholder="write your target..."
                    style={{ flex: 1, background: "transparent", border: "none", borderBottom: `1.5px dashed ${C.dim}`, color: C.text, fontSize: 14, fontFamily: "inherit", fontWeight: 600, padding: "5px 0", outline: "none" }}
                  />
                  <button onClick={() => removeArrayItem("daily_targets", i)} style={{ width: 26, height: 26, borderRadius: "50%", background: C.surface, border: `1px solid ${C.border}`, color: C.muted, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, lineHeight: 1, fontFamily: "inherit" }}>×</button>
                </div>
              ))}

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                <div style={{ width: 24, height: 24, borderRadius: 8, background: `${C.lime}18`, border: `1px dashed ${C.lime}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: C.lime, flexShrink: 0 }}>+</div>
                <input
                  value={newDailyTarget}
                  onChange={e => setNewDailyTarget(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addDailyTarget()}
                  placeholder="add daily target... (press Enter)"
                  style={{ flex: 1, background: "transparent", border: "none", borderBottom: `1.5px dashed ${C.dim}`, color: C.text, fontSize: 14, fontFamily: "inherit", fontWeight: 600, padding: "5px 0", outline: "none" }}
                />
                {newDailyTarget.trim() && (
                  <button onClick={addDailyTarget} style={{ padding: "5px 12px", borderRadius: 100, background: `${C.lime}18`, border: `1px solid ${C.lime}40`, color: C.lime, fontSize: 12, fontFamily: "inherit", fontWeight: 800, cursor: "pointer" }}>add</button>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button onClick={onRegenerate} style={Ghost({ flex: 1 })}>↺ redo AI</button>
            <button onClick={onApprove} style={Lime({ flex: 2, fontSize: 15 })}>lock it in 🔒</button>
          </div>
          <p style={{ textAlign: "center", fontSize: 12, color: C.dim, fontWeight: 600, marginTop: 2 }}>
            this becomes your daily accountability track
          </p>
        </div>
      ) : null}
    </div>
  );
}

function SettingsScreen({ user, onBack, bgMode, toggleBgMode, notificationsEnabled, sendTestNotification, onLogoClick, notificationTime, setNotificationTime, notificationEnabled: notificationScheduleEnabled, toggleNotificationSchedule, scheduleDailyReminder }: { user: { name: string; email: string; whatsapp: string }; onBack: () => void; bgMode: "white" | "black"; toggleBgMode: () => void; notificationsEnabled: boolean; sendTestNotification: () => void; onLogoClick: () => void; notificationTime: string; setNotificationTime: (time: string) => void; notificationEnabled: boolean; toggleNotificationSchedule: (enabled: boolean) => void; scheduleDailyReminder: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Please fill all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("New passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setMessage(error.message || "Failed to update password");
    }
    setIsChangingPassword(false);
  };

  return (
    <div style={page}>
      <TopNav onLogoClick={onLogoClick} right={<button onClick={onBack} style={Ghost({ padding: "9px 18px", fontSize: 13 })}>← back</button>} />
      <div className="fadeUp" style={{ paddingTop: 16 }}>
        <h2 style={H(24, { marginBottom: 6 })}>settings</h2>
        <p style={{ color: C.muted, fontSize: 14, fontWeight: 600, marginBottom: 32 }}>manage your account and preferences</p>

        <div style={Card({ marginBottom: 20 })}>
          <div style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800, marginBottom: 16 }}>👤 profile</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>name</label>
              <div style={{ padding: "12px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14 }}>{user.name}</div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>email</label>
              <div style={{ padding: "12px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14 }}>{user.email}</div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>whatsapp</label>
              <div style={{ padding: "12px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14 }}>{user.whatsapp || "Not set"}</div>
            </div>
          </div>
        </div>

        <div style={Card({ marginBottom: 20 })}>
          <div style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800, marginBottom: 16 }}>🔒 change password</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input type="password" placeholder="Current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={Input()} />
            <input type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={Input()} />
            <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={Input()} />
            {message && (
              <div style={{ padding: "10px 12px", background: message.includes("success") ? `${C.green}10` : `${C.pink}10`, border: `1px solid ${message.includes("success") ? C.green : C.pink}30`, borderRadius: 8, fontSize: 13, color: message.includes("success") ? C.green : C.pink }}>
                {message}
              </div>
            )}
            <button onClick={handlePasswordChange} disabled={isChangingPassword} style={Lime({ width: "100%", opacity: isChangingPassword ? 0.6 : 1 })}>
              {isChangingPassword ? "updating..." : "update password"}
            </button>
          </div>
        </div>

        <div style={Card({ marginBottom: 20 })}>
          <div style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800, marginBottom: 16 }}>⚙️ preferences</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Theme</div>
              <div style={{ fontSize: 12, color: C.muted }}>Choose your preferred theme</div>
            </div>
            <button onClick={toggleBgMode} style={Ghost({ padding: "10px 16px" })}>
              {bgMode === "black" ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>
        </div>

        <div style={Card()}>
          <div style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800, marginBottom: 16 }}>🔔 notifications</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Browser reminders</div>
                <div style={{ fontSize: 12, color: C.muted }}>Get daily reminders in your browser</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 44, height: 24, borderRadius: 12, background: notificationsEnabled ? C.lime : C.border, position: "relative", cursor: "pointer" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: notificationsEnabled ? 22 : 2, transition: "all .2s" }} />
                </div>
                {notificationsEnabled && <Pill color={C.green}>enabled</Pill>}
              </div>
            </div>

            {notificationsEnabled && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Daily reminders</div>
                    <div style={{ fontSize: 12, color: C.muted }}>Schedule automatic reminders</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div 
                      onClick={() => toggleNotificationSchedule(!notificationScheduleEnabled)}
                      style={{ width: 44, height: 24, borderRadius: 12, background: notificationScheduleEnabled ? C.cyan : C.border, position: "relative", cursor: "pointer" }}
                    >
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: notificationScheduleEnabled ? 22 : 2, transition: "all .2s" }} />
                    </div>
                    {notificationScheduleEnabled && <Pill color={C.cyan}>scheduled</Pill>}
                  </div>
                </div>

                {notificationScheduleEnabled && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.muted }}>Time:</div>
                    <input
                      type="time"
                      value={notificationTime}
                      onChange={(e) => {
                        setNotificationTime(e.target.value);
                        // Reschedule with new time
                        setTimeout(() => scheduleDailyReminder(), 100);
                      }}
                      style={{
                        padding: "8px 12px",
                        border: `1px solid ${C.border}`,
                        borderRadius: 6,
                        background: C.bg,
                        color: C.text,
                        fontSize: 14,
                        flex: 1
                      }}
                    />
                  </div>
                )}

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={sendTestNotification} style={Ghost({ flex: 1, fontSize: 13 })}>
                    test notification
                  </button>
                  {notificationScheduleEnabled && (
                    <div style={{ padding: "10px 14px", background: `${C.cyan}10`, border: `1px solid ${C.cyan}30`, borderRadius: 8, fontSize: 12, color: C.cyan, flex: 2 }}>
                      Daily at {notificationTime}
                    </div>
                  )}
                </div>
              </>
            )}

            {!notificationsEnabled && (
              <div style={{ padding: "10px 12px", background: `${C.amber}10`, border: `1px solid ${C.amber}30`, borderRadius: 8, fontSize: 13, color: C.amber }}>
                Enable browser notifications to get daily reminders.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardScreen(props: DashboardScreenProps & { onLogoClick: () => void }) {
  const { user, goal, allGoals, currentGoalId, switchGoal, roadmap, tasks, setTasks, onTaskUpdate, onCreateGoal, onEditGoal, bgMode, toggleBgMode, dbConnected, analytics, onSettings, onLogoClick } = props;
  const [activeTab, setActiveTab] = useState("today");
  const [showGoalMenu, setShowGoalMenu] = useState(false);
  const done = tasks.filter(Boolean).length;
  const total = tasks.length;
  const xp = total ? Math.round((done / total) * 100) : 0;
  const firstName = user.name?.split(" ")[0] || "there";
  const dailyTasks: string[] = roadmap?.daily_targets || ["plan your week", "take one action", "log your progress"];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const mobileGrid = window?.innerWidth < 640 ? { gridTemplateColumns: "1fr 1fr" } : {};

  // Categorize goals
  const now = new Date();
  const activeGoals = allGoals.filter(g => {
    // Goals created within last 30 days are considered active
    const createdAt = new Date(g.created_at);
    const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation <= 30;
  });
  const pastGoals = allGoals.filter(g => {
    const createdAt = new Date(g.created_at);
    const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation > 30;
  });
  const futureGoals = []; // For now, no future goals concept

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'Nunito',sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Logo onClick={onLogoClick} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={toggleBgMode} style={Ghost({ padding: "10px 12px", fontSize: 12, color: C.text, borderColor: C.muted })}>
              {bgMode === "black" ? "☀️ Light" : "🌙 Dark"}
            </button>
            <button onClick={onSettings} style={Ghost({ padding: "10px 12px", fontSize: 12, color: C.text, borderColor: C.muted })}>
              ⚙️ Settings
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", background: dbConnected ? `${C.green}10` : `${C.pink}10`, borderRadius: 8, border: `1px solid ${dbConnected ? `${C.green}30` : `${C.pink}30`}` }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: dbConnected ? C.green : C.pink }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: dbConnected ? C.green : C.pink }}>
                {dbConnected === null ? "checking db…" : dbConnected ? "DB connected" : "DB offline"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Goal Selector */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
          <button 
            onClick={() => setShowGoalMenu(!showGoalMenu)}
            style={{
              flex: 1,
              padding: "12px 14px",
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              color: C.text,
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "left",
              fontSize: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{goal.title?.substring(0, 30) || "Select Goal"}</span>
            <span style={{ fontSize: 12 }}>▼</span>
          </button>
          
          <button 
            onClick={() => onEditGoal(goal)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: `${C.violet}15`,
              border: `1px solid ${C.violet}30`,
              color: C.violet,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700
            }}
            title="Edit Goal"
          >
            ✏️
          </button>
          
          {showGoalMenu && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              marginTop: 4,
              boxShadow: `0 4px 12px ${C.shadow}`,
              zIndex: 10,
              maxHeight: 200,
              overflowY: "auto"
            }}>
              {allGoals.map(g => (
                <button
                  key={g.id}
                  onClick={() => { switchGoal(g.id); setShowGoalMenu(false); }}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "none",
                    background: currentGoalId === g.id ? `${C.violet}10` : "transparent",
                    color: C.text,
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 13,
                    fontWeight: currentGoalId === g.id ? 700 : 500,
                    borderBottom: `1px solid ${C.border}`,
                    transition: "all .2s",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>{g.title?.substring(0, 35)}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>📅 {g.duration}</div>
                  </div>
                  {currentGoalId === g.id && <div style={{ fontSize: 12, color: C.violet }}>✓</div>}
                </button>
              ))}
              
              <button
                onClick={() => { onCreateGoal(); setShowGoalMenu(false); }}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "none",
                  background: `${C.lime}15`,
                  color: C.lime,
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                <span>+ New Goal</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, padding: "0 18px", borderBottom: `1px solid ${C.border}`, background: C.bg }}>
        {[{ id: "today", label: "⚡ Today" }, { id: "goals", label: "🎯 Goals" }, { id: "progress", label: "📊 Progress" }, { id: "whatsapp", label: "💬 WhatsApp" }].map(t => (
          <button 
            key={t.id} 
            onClick={() => setActiveTab(t.id)} 
            style={{ 
              flex: 1,
              padding: "12px 0", 
              background: activeTab === t.id ? C.card : "transparent",
              border: "none",
              color: activeTab === t.id ? C.lime : C.muted, 
              fontFamily: "inherit", 
              fontSize: 13, 
              fontWeight: 700, 
              cursor: "pointer",
              borderBottom: activeTab === t.id ? `3px solid ${C.lime}` : "3px solid transparent",
              transition: "all .2s"
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "18px 18px 110px", display: "flex", flexDirection: "column", gap: 12 }}>
        {activeTab === "goals" && (<>
          <div className="fadeUp">
            <h2 style={H(22, { marginBottom: 4 })}>your goals</h2>
            <p style={{ color: C.muted, fontSize: 14, fontWeight: 600 }}>track your journey, create new ones</p>
          </div>

          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div className="fadeUp s1">
              <div style={{ fontSize: 12, color: C.lime, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800, marginBottom: 12 }}>🔥 active goals</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {activeGoals.map(g => (
                  <div key={g.id} style={Card({ cursor: "pointer", borderLeft: currentGoalId === g.id ? `3px solid ${C.lime}` : `3px solid ${C.border}` })} onClick={() => switchGoal(g.id)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: currentGoalId === g.id ? C.lime : C.text }}>{g.title}</div>
                        <div style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}>{g.motivation?.substring(0, 60)}...</div>
                      </div>
                      {currentGoalId === g.id && <Pill color={C.lime}>current</Pill>}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Pill color={C.violet}>{g.category}</Pill>
                        <Pill color={C.cyan}>{g.duration}</Pill>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); onEditGoal(g); }} style={Ghost({ padding: "6px 12px", fontSize: 12 })}>
                        edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Goals */}
          {pastGoals.length > 0 && (
            <div className="fadeUp s2">
              <div style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800, marginBottom: 12 }}>📚 past goals</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pastGoals.slice(0, 3).map(g => (
                  <div key={g.id} style={Card({ opacity: 0.7 })}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{g.title}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{g.motivation?.substring(0, 50)}...</div>
                      </div>
                      <Pill color={C.green}>completed</Pill>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Pill color={C.violet} style={{ opacity: 0.6 }}>{g.category}</Pill>
                      <Pill color={C.cyan} style={{ opacity: 0.6 }}>{g.duration}</Pill>
                    </div>
                  </div>
                ))}
                {pastGoals.length > 3 && (
                  <div style={{ textAlign: "center", padding: "12px", color: C.muted, fontSize: 13 }}>
                    +{pastGoals.length - 3} more completed goals
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Create New Goal */}
          <div className="fadeUp s3" style={Card({ background: `${C.lime}0D`, border: `1.5px solid ${C.lime}30`, cursor: "pointer" })} onClick={onCreateGoal}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: C.lime, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>✨</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.lime, marginBottom: 2 }}>create new goal</div>
                <div style={{ fontSize: 13, color: C.muted }}>start your next big win</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="fadeUp s4" style={Card()}>
            <div style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800, marginBottom: 16 }}>📈 your stats</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ textAlign: "center", padding: "16px 12px", background: `${C.violet}10`, borderRadius: 12, border: `1px solid ${C.violet}25` }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: C.violet, marginBottom: 4 }}>{allGoals.length}</div>
                <div style={{ fontSize: 12, color: C.muted, fontWeight: 700 }}>total goals</div>
              </div>
              <div style={{ textAlign: "center", padding: "16px 12px", background: `${C.green}10`, borderRadius: 12, border: `1px solid ${C.green}25` }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: C.green, marginBottom: 4 }}>{pastGoals.length}</div>
                <div style={{ fontSize: 12, color: C.muted, fontWeight: 700 }}>completed</div>
              </div>
            </div>
          </div>
        </>)}

        {activeTab === "today" && (<>
          <div className="fadeUp">
            <div style={{ fontSize: 13, color: C.muted, fontWeight: 600, marginBottom: 2 }}>hey {firstName} 👋</div>
            <h2 style={H(22, { marginBottom: 0 })}>here's your day</h2>
          </div>

          <div className="fadeUp s1" style={Card({ padding: "16px" })}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: C.lime, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800, marginBottom: 2 }}>today's XP</div>
                <div style={H(20)}>{done}/{total} moves done</div>
              </div>
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: `${C.lime}15`, border: `3px solid ${xp === 100 ? C.lime : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: C.lime, transition: "border-color .4s" }}>
                {xp}%
              </div>
            </div>
            <div style={{ height: 6, background: C.surface, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ width: `${xp}%`, height: "100%", background: `linear-gradient(90deg,${C.violet},${C.lime})`, borderRadius: 99, transition: "width .5s cubic-bezier(.34,1.56,.64,1)" }} />
            </div>
          </div>

          <div className="fadeUp s2" style={Card({ borderLeft: `3px solid ${C.violet}`, paddingLeft: 16, padding: "14px 14px 14px 16px" })}>
            <div style={{ fontSize: 10, color: C.violet, textTransform: "uppercase", letterSpacing: 2, fontWeight: 800, marginBottom: 6 }}>⚡ this week ({roadmap?.week_targets?.length || 0} targets)</div>
            {roadmap?.week_targets?.slice(0, 2).map((target: string, i: number) => (
              <p key={i} style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.6, margin: 0, color: C.muted, marginBottom: i === 0 ? 8 : 0 }}>{target}</p>
            ))}
            {(roadmap?.week_targets?.length || 0) > 2 && <p style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>...and {(roadmap?.week_targets?.length || 0) - 2} more</p>}
          </div>

          <div className="fadeUp s3" style={Card()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800 }}>🔥 daily targets</div>
              {done === total && total > 0 && <Pill color={C.green}>all done 🎉</Pill>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {dailyTasks.map((task, i) => (
                <div
                  key={i}
                  onClick={() => { 
                    const newCompleted = !tasks[i];
                    const t = [...tasks]; 
                    t[i] = newCompleted; 
                    setTasks(t);
                    onTaskUpdate(i, newCompleted, task);
                  }}
                  style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px", borderRadius: 16, background: tasks[i] ? `${C.green}0F` : C.surface, border: `1.5px solid ${tasks[i] ? `${C.green}30` : C.border}`, cursor: "pointer", transition: "all .18s", transform: "scale(1)" }}
                  className="btn-hover"
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  <div style={{ width: 24, height: 24, borderRadius: 8, border: `2px solid ${tasks[i] ? C.green : C.border}`, background: tasks[i] ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all .2s", animation: tasks[i] ? "pop .3s ease" : "none" }}>
                    {tasks[i] && <span style={{ fontSize: 12, color: "#07070E", fontWeight: 900 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: tasks[i] ? C.muted : C.text, textDecoration: tasks[i] ? "line-through" : "none", lineHeight: 1.5, flex: 1 }}>{task}</span>
                </div>
              ))}
            </div>
            {done > 0 && (
              <div style={{ marginTop: 12, padding: "10px 13px", background: `${C.green}0F`, border: `1px solid ${C.green}25`, borderRadius: 12 }}>
                <p style={{ margin: 0, fontSize: 13, color: C.green, fontWeight: 700 }}>
                  {done === total ? "🎉 all targets done! excellent work." : `✅ ${done} target${done > 1 ? "s" : ""} done. keep going!`}
                </p>
              </div>
            )}
          </div>

          <div className="fadeUp s4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, ...mobileGrid }}>
            {[
              { icon: "🔥", label: "current streak", val: `${analytics.streak} day${analytics.streak !== 1 ? 's' : ''}`, color: C.amber },
              { icon: "🏆", label: "best streak", val: `${analytics.bestStreak} day${analytics.bestStreak !== 1 ? 's' : ''}`, color: C.amber },
              { icon: "📅", label: "week", val: `week ${analytics.currentWeek}`, color: C.cyan },
              { icon: "✅", label: "total completed", val: analytics.totalCompleted.toString(), color: C.green },
              { icon: "📊", label: "completion rate", val: `${analytics.completionRate}%`, color: C.cyan },
              { icon: "🎯", label: "daily average", val: analytics.averageDaily.toString(), color: C.violet }
            ].map(s => (
              <div key={s.label} style={Card({ textAlign: "center", padding: "14px 10px" })} className="card-hover">
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: s.color, marginBottom: 2 }}>{s.val}</div>
                <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, lineHeight: 1.2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </>)}

        {activeTab === "progress" && (<>
          <div className="fadeUp">
            <h2 style={H(22, { marginBottom: 4 })}>your progress</h2>
            <p style={{ color: C.muted, fontSize: 14, fontWeight: 600 }}>week {analytics.currentWeek} · {goal.duration} goal</p>
          </div>

          <div className="fadeUp s1" style={Card()}>
            <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 2, fontWeight: 800, marginBottom: 16 }}>📊 weekly trend</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
              {analytics.weeklyTrend.map((h, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%" }}>
                  <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                    <div style={{ width: "100%", height: `${Math.max(h, 0)}%`, minHeight: h > 0 ? 4 : 0, background: i === 0 ? `linear-gradient(180deg,${C.violet},${C.lime})` : h > 60 ? `${C.lime}40` : h > 0 ? C.border : "transparent", borderRadius: "5px 5px 0 0" }} />
                  </div>
                  <span style={{ fontSize: 10, color: i === 0 ? C.lime : C.dim, fontWeight: 700 }}>{days[i]}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: C.muted, textAlign: "center" }}>
              Weekly completion: {analytics.weeklyProgress}%
            </div>
          </div>

          <div className="fadeUp s2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={Card()}>
              <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>🎯 goal progress</div>
              <div style={{ position: "relative", height: 8, background: C.surface, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${analytics.goalProgress}%`, height: "100%", background: `linear-gradient(90deg,${C.cyan},${C.violet})`, borderRadius: 4 }} />
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: C.muted, textAlign: "center" }}>
                {analytics.goalProgress}% complete
              </div>
            </div>

            <div style={Card()}>
              <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>📈 monthly progress</div>
              <div style={{ position: "relative", height: 8, background: C.surface, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${analytics.monthlyProgress}%`, height: "100%", background: `linear-gradient(90deg,${C.green},${C.lime})`, borderRadius: 4 }} />
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: C.muted, textAlign: "center" }}>
                {analytics.monthlyProgress}% this month
              </div>
            </div>
          </div>

          <div className={`fadeUp s2`} style={Card({ borderLeft: `3px solid ${C.amber}`, paddingLeft: 16, padding: "14px 14px 14px 16px" })}>
            <div style={{ fontSize: 10, color: C.amber, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>🌟 year goal</div>
            <p style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.6, margin: 0, color: C.muted }}>{roadmap?.year_target || "—"}</p>
          </div>

          <div className={`fadeUp s3`} style={Card({ borderLeft: `3px solid ${C.violet}`, paddingLeft: 16, padding: "14px 14px 14px 16px" })}>
            <div style={{ fontSize: 10, color: C.violet, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>🎯 3-month mark</div>
            <p style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.6, margin: 0, color: C.muted }}>{roadmap?.quarter_target || "—"}</p>
          </div>

          <div className={`fadeUp s4`} style={Card({ borderLeft: `3px solid ${C.cyan}`, paddingLeft: 16, padding: "14px 14px 14px 16px" })}>
            <div style={{ fontSize: 10, color: C.cyan, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>📅 this month ({roadmap?.month_targets?.length || 0} targets)</div>
            {roadmap?.month_targets?.slice(0, 2).map((target: string, i: number) => (
              <p key={i} style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.6, margin: 0, color: C.muted, marginBottom: i === 0 ? 8 : 0 }}>{target}</p>
            ))}
            {(roadmap?.month_targets?.length || 0) > 2 && <p style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>...and {(roadmap?.month_targets?.length || 0) - 2} more</p>}
          </div>

          <div className={`fadeUp s5`} style={Card({ borderLeft: `3px solid ${C.lime}`, paddingLeft: 16, padding: "14px 14px 14px 16px" })}>
            <div style={{ fontSize: 10, color: C.lime, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>⚡ this week ({roadmap?.week_targets?.length || 0} targets)</div>
            {roadmap?.week_targets?.slice(0, 2).map((target: string, i: number) => (
              <p key={i} style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.6, margin: 0, color: C.muted, marginBottom: i === 0 ? 8 : 0 }}>{target}</p>
            ))}
            {(roadmap?.week_targets?.length || 0) > 2 && <p style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>...and {(roadmap?.week_targets?.length || 0) - 2} more</p>}
          </div>
        </>)}

        {activeTab === "whatsapp" && (<>
          <div className="fadeUp">
            <h2 style={H(22, { marginBottom: 4 })}>whatsapp setup</h2>
            <p style={{ color: C.muted, fontSize: 14, fontWeight: 600 }}>daily accountability, no extra apps</p>
          </div>

          <div className="fadeUp s1" style={Card()}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17, color: "#fff" }}>S</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, fontFamily: "'Syne',sans-serif" }}>SabiTrack Bot</div>
                <div style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>🟢 active</div>
              </div>
              <Pill color={C.green} style={{ marginLeft: "auto" }}>connected</Pill>
            </div>
            <div style={{ background: "#0B1622", borderRadius: 14, padding: "14px", fontFamily: "monospace", fontSize: 12, lineHeight: 1.9, color: "#C8D8E4" }}>
              <div style={{ color: "#4B6A7A", fontSize: 11, marginBottom: 6 }}>7:00 AM · daily message</div>
              <div>Good morning {firstName} 👋</div>
              <div><span style={{ color: "#4B6A7A" }}>Goal:</span> {goal.title?.substring(0, 38)}...</div>
              <div><span style={{ color: "#4B6A7A" }}>Week:</span> {roadmap?.week_targets?.[0]?.substring(0, 38)}...</div>
              <div style={{ marginTop: 5 }}>Today's Targets:</div>
              {dailyTasks.slice(0, 3).map((t, i) => <div key={i}>  {i + 1}. {t?.substring(0, 40)}</div>)}
              <div style={{ marginTop: 5, color: "#4B6A7A" }}>Reply: DONE / MOVE / SKIP / HELP</div>
              <div style={{ color: "#22C55E" }}>make today count ✅</div>
            </div>
          </div>

          <div className="fadeUp s2" style={Card()}>
            <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>quick reply commands</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { cmd: "DONE", desc: "mark tasks complete", color: C.green },
                { cmd: "MOVE", desc: "push to tomorrow", color: C.amber },
                { cmd: "SKIP", desc: "can't today — log it", color: C.muted },
                { cmd: "HELP", desc: "get your why back", color: C.violet },
                { cmd: "REPLAN", desc: "trigger weekly replan", color: C.pink },
              ].map(r => (
                <div key={r.cmd} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: `${r.color}10`, border: `1px solid ${r.color}25`, borderRadius: 12 }}>
                  <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: r.color, minWidth: 58 }}>{r.cmd}</span>
                  <span style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>{r.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="fadeUp s3" style={Card({ background: `${C.lime}0D`, border: `1.5px solid ${C.lime}25`, borderRadius: 18, padding: "14px 16px" })}>
            <p style={{ fontSize: 13, color: C.lime, fontWeight: 700, lineHeight: 1.6, margin: 0 }}>
              📱 number on file: <strong>{user.whatsapp || "+234 ..."}</strong><br />
              <span style={{ color: C.muted, fontWeight: 600 }}>evening check-in at 8 PM daily</span>
            </p>
          </div>
        </>)}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: C.card, borderTop: `1.5px solid ${C.border}`, padding: "10px 18px 28px", display: "flex", justifyContent: "space-around", zIndex: 100 }}>
        {[{ id: "today", icon: "⚡", label: "today" }, { id: "goals", icon: "🎯", label: "goals" }, { id: "progress", icon: "📊", label: "progress" }, { id: "whatsapp", icon: "💬", label: "whatsapp" }].map(n => (
          <button key={n.id} onClick={() => setActiveTab(n.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: activeTab === n.id ? `${C.lime}12` : "none", border: "none", cursor: "pointer", padding: "7px 22px", borderRadius: 14 }}>
            <span style={{ fontSize: 20 }}>{n.icon}</span>
            <span style={{ fontSize: 11, fontFamily: "inherit", fontWeight: 800, color: activeTab === n.id ? C.lime : C.muted }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SabiTrack() {
  const supabase = useMemo(() => createClient(), []);
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState({ name: "", email: "", whatsapp: "", password: "", username: "" });
  const [goal, setGoal] = useState({ id: "", title: "", duration: "6 months", motivation: "", category: "", created_at: "" } as any);
  const [allGoals, setAllGoals] = useState<any[]>([]);
  const [currentGoalId, setCurrentGoalId] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<boolean[]>([false, false, false]);
  const [userId, setUserId] = useState<string | null>(null);
  const [bgMode, setBgMode] = useState<"white" | "black">("black");
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [analytics, setAnalytics] = useState({
    streak: 0,
    currentWeek: 1,
    weeklyTrend: [0, 0, 0, 0, 0, 0, 0],
    totalCompleted: 0,
    completionRate: 0,
    bestStreak: 0,
    averageDaily: 0,
    goalProgress: 0,
    weeklyProgress: 0,
    monthlyProgress: 0
  });
  const [notificationTime, setNotificationTime] = useState("09:00");
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const notificationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scheduleDailyReminder = () => {
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
    }

    if (!notificationEnabled || !notificationsEnabled) return;

    const [hours, minutes] = notificationTime.split(':').map(Number);
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    // Schedule the first reminder
    setTimeout(() => {
      sendReminderNotification();
      
      // Then schedule daily reminders every 24 hours
      notificationIntervalRef.current = setInterval(() => {
        sendReminderNotification();
      }, 24 * 60 * 60 * 1000); // 24 hours
    }, timeUntilReminder);
  };

  const toggleNotificationSchedule = (enabled: boolean) => {
    setNotificationEnabled(enabled);
    if (enabled) {
      scheduleDailyReminder();
    } else {
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
        notificationIntervalRef.current = null;
      }
    }
  };
  const [isManualMode, setIsManualMode] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIosInstall, setIsIosInstall] = useState(false);

  useEffect(() => {
    Object.assign(C, bgMode === "black" ? darkPalette : lightPalette);
  }, [bgMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      setNotificationsEnabled(true);
      return;
    }

    if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        setNotificationsEnabled(permission === "granted");
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isiOS = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;

    if (isiOS && !isStandalone) {
      setIsIosInstall(true);
      setShowInstallPrompt(true);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setDeferredInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const sendTestNotification = () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    new Notification("Sabi Track Reminder", {
      body: "You've got a daily target waiting. Open the app and crush it!",
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      tag: "sabi-track-reminder",
      requireInteraction: false,
      silent: false
    });
  };

  const sendCompletionNotification = (taskText: string, isAllCompleted: boolean = false) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const messages = [
      `Great job! You've completed: "${taskText}"`,
      `Well done! Task "${taskText}" is now complete!`,
      `Excellent work! "${taskText}" has been ticked off!`,
      `Awesome! You've accomplished: "${taskText}"`,
      `Fantastic! Task completed: "${taskText}"`
    ];

    const allCompletedMessages = [
      "🎉 All daily targets completed! You're on fire!",
      "🏆 Amazing! All tasks done for today!",
      "⭐ Perfect! You've conquered all your goals today!",
      "💪 Incredible! Daily targets achieved!"
    ];

    const message = isAllCompleted
      ? allCompletedMessages[Math.floor(Math.random() * allCompletedMessages.length)]
      : messages[Math.floor(Math.random() * messages.length)];

    new Notification("Task Completed! 🎉", {
      body: message,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      tag: "sabi-track-completion",
      requireInteraction: false,
      silent: false
    });
  };

  const sendReminderNotification = () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const reminders = [
      "Don't forget your daily targets! Open Sabi Track to check them off.",
      "Your goals are waiting! Time to make progress on your journey.",
      "Stay on track! You've got targets to complete today.",
      "Remember your goals! Open the app and keep the momentum going.",
      "Daily reminder: Your targets are waiting for you!"
    ];

    const message = reminders[Math.floor(Math.random() * reminders.length)];

    new Notification("Daily Reminder 🔔", {
      body: message,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      tag: "sabi-track-reminder",
      requireInteraction: false,
      silent: false
    });
  };

  const sendStreakNotification = (streak: number) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    if (streak > 0 && streak % 7 === 0) { // Weekly milestone
      new Notification("Weekly Milestone! 🎊", {
        body: `Incredible! You've maintained a ${streak}-day streak! Keep it up!`,
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        tag: "sabi-track-streak",
        requireInteraction: true,
        silent: false
      });
    }
  };

  const handleInstallApp = async () => {
    if (!deferredInstallPrompt) return;

    deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowInstallPrompt(false);
      setDeferredInstallPrompt(null);
    } else {
      setShowInstallPrompt(false);
    }
  };

  const handleIosInstallHelp = () => {
    if (typeof window === "undefined") return;
    window.alert("In Safari, tap the Share button and choose Add to Home Screen to install SabiTrack.");
  };

  // Load user and their data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUserId(session.user.id);
          
          // Check database connectivity quickly.
          const { error: dbError } = await supabase
            .from("users")
            .select("id")
            .limit(1);
          setDbConnected(!dbError);
          
          // Load user profile
          const { data: profile } = await supabase
            .from("users")
            .select("name, email, whatsapp, username")
            .eq("id", session.user.id)
            .single();
          
          if (profile) {
            setUser({ ...profile, password: "", username: profile.username || "" });
          }
          
          // Load all goals
          const { data: goalsData } = await supabase
            .from("goals")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false });
          
          if (goalsData && goalsData.length > 0) {
            setAllGoals(goalsData);
            const latestGoal = goalsData[0];
            setCurrentGoalId(latestGoal.id);
            setGoal(latestGoal);
            
            // Load roadmap for latest goal
            const { data: roadmapData } = await supabase
              .from("roadmaps")
              .select("*")
              .eq("user_id", session.user.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .single();
            
            if (roadmapData) {
              setRoadmap(roadmapData);
              
              // Load tasks
              const { data: tasksData } = await supabase
                .from("tasks")
                .select("completed")
                .eq("roadmap_id", roadmapData.id)
                .order("task_order", { ascending: true });
              
              if (tasksData) {
                setTasks(tasksData.map(t => t.completed));
                // Calculate analytics after loading tasks
                setTimeout(() => calculateAnalytics(), 100);
              }
            }
            
            setScreen("dashboard");
          } else {
            setScreen("signup");
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setDbConnected(false);
      }
    };
    
    loadUserData();
  }, [supabase]);

  const switchGoal = async (goalId: string) => {
    setCurrentGoalId(goalId);
    const selectedGoal = allGoals.find(g => g.id === goalId);
    if (selectedGoal) {
      setGoal(selectedGoal);
      
      // Load roadmap for selected goal
      const { data: roadmapData } = await supabase
        .from("roadmaps")
        .select("*")
        .eq("user_id", userId)
        .eq("goal_id", goalId)
        .single();
      
      if (roadmapData) {
        setRoadmap(roadmapData);
        
        const { data: tasksData } = await supabase
          .from("tasks")
          .select("completed")
          .eq("roadmap_id", roadmapData.id)
          .order("task_order", { ascending: true });
        
        if (tasksData) {
          setTasks(tasksData.map(t => t.completed));
          // Calculate analytics after loading tasks
          setTimeout(() => calculateAnalytics(true), 100);
        }
      }
    }
  };

  const handleSignin = async (identifier: string, password: string) => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: identifier,
        password: password,
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        setUserId(authData.user.id);
        setScreen("dashboard");
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const saveUserSignup = async (userData: typeof user) => {
    setLoading(true);
    try {
      // Create auth account with email and password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        setUserId(authData.user.id);
        setUser({ ...userData, password: "" });
        
        // Save user profile with username
        await supabase.from("users").insert({
          id: authData.user.id,
          name: userData.name,
          email: userData.email,
          username: userData.username,
          whatsapp: userData.whatsapp,
        });

        setScreen("dashboard");
      }
    } catch (error: any) {
      console.error("Error saving user:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const saveGoal = async (goalData: typeof goal) => {
    try {
      if (!userId) return;
      
      if (goalData.id) {
        // Update existing goal
        await supabase
          .from("goals")
          .update({
            title: goalData.title,
            duration: goalData.duration,
            motivation: goalData.motivation,
            category: goalData.category,
          })
          .eq("id", goalData.id);
        
        setGoal(goalData);
      } else {
        // Create new goal
        const { data } = await supabase
          .from("goals")
          .insert({
            user_id: userId,
            title: goalData.title,
            duration: goalData.duration,
            motivation: goalData.motivation,
            category: goalData.category,
          })
          .select()
          .single();
        
        if (data) {
          setGoal({ ...goalData, id: data.id });
          setAllGoals([data, ...allGoals]);
          setCurrentGoalId(data.id);
        }
      }
    } catch (error) {
      console.error("Error saving goal:", error);
    }
  };

  const saveRoadmap = async (roadmapData: Record<string, any>) => {
    try {
      if (!userId || !currentGoalId) return;
      
      const { data } = await supabase
        .from("roadmaps")
        .insert({
          user_id: userId,
          goal_id: currentGoalId,
          year_target: roadmapData.year_target,
          quarter_target: roadmapData.quarter_target,
          month_targets: roadmapData.month_targets,
          week_targets: roadmapData.week_targets,
        })
        .select()
        .single();
      
      if (data) {
        // Save tasks
        const taskPromises = roadmapData.daily_targets.map((task: string, idx: number) =>
          supabase.from("tasks").insert({
            roadmap_id: data.id,
            task_text: task,
            task_order: idx,
            completed: false,
          })
        );
        
        await Promise.all(taskPromises);
        setRoadmap(data);
      }
    } catch (error) {
      console.error("Error saving roadmap:", error);
    }
  };

  const [analyticsCache, setAnalyticsCache] = useState<{ data: any; timestamp: number } | null>(null);
  const ANALYTICS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const calculateAnalytics = useCallback(async (force = false) => {
    if (!roadmap || !goal.created_at) return;

    // Check cache first
    const now = Date.now();
    if (!force && analyticsCache && (now - analyticsCache.timestamp) < ANALYTICS_CACHE_DURATION) {
      setAnalytics(analyticsCache.data);
      return;
    }

    try {
      // Get all tasks with their completion status and update times
      const { data: tasksData } = await supabase
        .from("tasks")
        .select("completed, updated_at, task_order")
        .eq("roadmap_id", roadmap.id)
        .order("updated_at", { ascending: false });

      if (!tasksData) return;

      const goalCreatedDate = new Date(goal.created_at);
      const nowDate = new Date();
      const dailyTasksCount = roadmap.daily_targets?.length || 3;
      
      // Calculate current week
      const weeksSinceCreation = Math.floor((nowDate.getTime() - goalCreatedDate.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1;
      
      // Group tasks by completion date
      const tasksByDate: Record<string, any[]> = {};
      const allCompletedTasks: any[] = [];
      
      tasksData.forEach(task => {
        const date = new Date(task.updated_at).toDateString();
        if (!tasksByDate[date]) tasksByDate[date] = [];
        tasksByDate[date].push(task);
        if (task.completed) {
          allCompletedTasks.push(task);
        }
      });

      // Calculate streak - consecutive days where all tasks were completed
      let streak = 0;
      let bestStreak = 0;
      let currentStreak = 0;
      
      for (let i = 0; i < 365; i++) { // Max 365 days back
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toDateString();
        
        const completedTasks = tasksByDate[dateStr] || [];
        const completedCount = completedTasks.length;
        
        if (completedCount >= dailyTasksCount) {
          currentStreak++;
          bestStreak = Math.max(bestStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
        
        // Current streak (from today backwards)
        if (i === 0 && completedCount >= dailyTasksCount) {
          streak = currentStreak;
        }
      }

      // Calculate weekly trend - completion % for last 7 days
      const weeklyTrend = [];
      let weeklyCompleted = 0;
      let weeklyTotal = 0;
      
      for (let i = 6; i >= 0; i--) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toDateString();
        
        const completedTasks = tasksByDate[dateStr] || [];
        const completionPercent = dailyTasksCount > 0 ? Math.round((completedTasks.length / dailyTasksCount) * 100) : 0;
        weeklyTrend.push(completionPercent);
        
        weeklyCompleted += completedTasks.length;
        weeklyTotal += dailyTasksCount;
      }

      // Calculate monthly progress (last 30 days)
      let monthlyCompleted = 0;
      let monthlyTotal = 0;
      
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toDateString();
        
        const completedTasks = tasksByDate[dateStr] || [];
        monthlyCompleted += completedTasks.length;
        monthlyTotal += dailyTasksCount;
      }

      // Calculate overall metrics
      const totalCompleted = allCompletedTasks.length;
      const totalPossibleTasks = Object.keys(tasksByDate).length * dailyTasksCount;
      const completionRate = totalPossibleTasks > 0 ? Math.round((totalCompleted / totalPossibleTasks) * 100) : 0;
      
      // Average daily completion
      const daysTracked = Object.keys(tasksByDate).length;
      const averageDaily = daysTracked > 0 ? Math.round((totalCompleted / daysTracked) * 10) / 10 : 0;
      
      // Goal progress (simplified - could be enhanced based on goal duration)
      const goalDurationDays = goal.duration === "6 months" ? 180 : goal.duration === "3 months" ? 90 : 30;
      const daysIntoGoal = Math.min(Math.floor((nowDate.getTime() - goalCreatedDate.getTime()) / (1000 * 60 * 60 * 24)), goalDurationDays);
      const goalProgress = goalDurationDays > 0 ? Math.round((daysIntoGoal / goalDurationDays) * 100) : 0;
      
      // Weekly and monthly progress percentages
      const weeklyProgress = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;
      const monthlyProgress = monthlyTotal > 0 ? Math.round((monthlyCompleted / monthlyTotal) * 100) : 0;

      const newAnalytics = {
        streak,
        currentWeek: weeksSinceCreation,
        weeklyTrend,
        totalCompleted,
        completionRate,
        bestStreak,
        averageDaily,
        goalProgress,
        weeklyProgress,
        monthlyProgress
      };

      // Cache the results
      setAnalyticsCache({ data: newAnalytics, timestamp: now });
      setAnalytics(newAnalytics);
    } catch (error) {
      console.error("Error calculating analytics:", error);
    }
  }, [roadmap, goal.created_at, supabase, analyticsCache]);

  const updateTaskStatus = async (taskIndex: number, completed: boolean, taskText?: string) => {
    try {
      if (!roadmap || !userId) return;
      
      const { data: tasksData } = await supabase
        .from("tasks")
        .select("id")
        .eq("roadmap_id", roadmap.id)
        .order("task_order", { ascending: true });
      
      if (tasksData && tasksData[taskIndex]) {
        await supabase
          .from("tasks")
          .update({ completed })
          .eq("id", tasksData[taskIndex].id);
        
        // Show notification when task is completed
        if (completed && "Notification" in window) {
          const taskTextToShow = taskText || "a daily target";
          
          // Check if all daily tasks are now completed
          const { data: allTasks } = await supabase
            .from("tasks")
            .select("completed")
            .eq("roadmap_id", roadmap.id);
          
          const dailyTasksCount = roadmap.daily_targets?.length || 3;
          const completedTasksToday = allTasks?.filter(task => task.completed).length || 0;
          const isAllCompleted = completedTasksToday >= dailyTasksCount;
          
          sendCompletionNotification(taskTextToShow, isAllCompleted);
          
          // Send streak notification if applicable
          if (isAllCompleted) {
            setTimeout(() => {
              calculateAnalytics(true).then(() => {
                sendStreakNotification(analytics.streak);
              });
            }, 200);
          }
        }
      }
      
      // Recalculate analytics after task update
      setTimeout(() => calculateAnalytics(true), 100);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleManualRoadmapSave = async (roadmapData: any) => {
    try {
      setLoading(true);
      
      // For editing, delete existing roadmap and tasks first
      if (goal.id && roadmap) {
        await supabase.from("tasks").delete().eq("roadmap_id", roadmap.id);
        await supabase.from("roadmaps").delete().eq("id", roadmap.id);
      }
      
      await saveRoadmap(roadmapData);
      setTasks(new Array(roadmapData.daily_tasks.length).fill(false));
      setIsManualMode(false);
      setScreen("dashboard");
    } catch (error) {
      console.error("Error saving manual roadmap:", error);
      alert("Failed to save roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateRoadmap = async () => {
    await saveGoal(goal);
    
    setLoading(true);
    setScreen("roadmap");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are a strategic execution planner. Return ONLY valid JSON. No markdown, no backticks, no preamble.",
          messages: [{
            role: "user",
            content: `Create a practical accountability roadmap:\nGoal: ${goal.title}\nDuration: ${goal.duration}\nWhy: ${goal.motivation}\nCategory: ${goal.category}\n\nReturn exactly: {"year_target":"one motivating sentence","quarter_target":"one sentence","month_target":"one sentence","week_target":"one sentence","daily_tasks":["concrete task 1","concrete task 2","concrete task 3"]}`
          }]
        })
      });
      const data = await res.json();
      const text = data.content[0].text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);
      
      // For editing, delete existing roadmap and tasks first
      if (goal.id && roadmap) {
        await supabase.from("tasks").delete().eq("roadmap_id", roadmap.id);
        await supabase.from("roadmaps").delete().eq("id", roadmap.id);
      }
      
      await saveRoadmap(parsed);
      setTasks(new Array(parsed.daily_tasks.length).fill(false));
      setIsManualMode(false);
    } catch (error) {
      console.error("AI generation failed, switching to manual mode:", error);
      // Switch to manual mode for user to enter roadmap
      setIsManualMode(true);
      setRoadmap(null);
    }
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: C.bg, color: C.text, fontFamily: "'Nunito',sans-serif", minHeight: "100vh" }}>
      {screen === "landing" && <LandingScreen onStart={() => setScreen("signin")} bgMode={bgMode} toggleBgMode={() => setBgMode(prev => (prev === "black" ? "white" : "black"))} onLogoClick={() => setScreen("landing")} />}
      {screen === "signup" && <SignupScreen user={user} setUser={setUser} onNext={saveUserSignup} onSignin={() => setScreen("signin")} isLoading={loading} onLogoClick={() => setScreen("landing")} />}
      {screen === "signin" && <SigninScreen onNext={(email, password) => handleSignin(email, password)} onSignup={() => { setUser({ name: "", email: "", whatsapp: "", password: "", username: "" }); setScreen("signup"); }} isLoading={loading} onLogoClick={() => setScreen("landing")} />}
      {screen === "wizard" && <WizardScreen goal={goal} setGoal={setGoal} onGenerate={generateRoadmap} isEditing={!!goal.id} onLogoClick={() => setScreen("dashboard")} />}
      {screen === "roadmap" && isManualMode ? <ManualRoadmapForm goal={goal} onSave={handleManualRoadmapSave} isLoading={loading} onLogoClick={() => setScreen("dashboard")} /> : screen === "roadmap" && <RoadmapScreen roadmap={roadmap} setRoadmap={setRoadmap} loading={loading} goal={goal} onApprove={() => setScreen("dashboard")} onRegenerate={generateRoadmap} onLogoClick={() => setScreen("dashboard")} />}
      {screen === "settings" && <SettingsScreen user={user} onBack={() => setScreen("dashboard")} bgMode={bgMode} toggleBgMode={() => setBgMode(prev => (prev === "black" ? "white" : "black"))} notificationsEnabled={notificationsEnabled} sendTestNotification={sendTestNotification} onLogoClick={() => setScreen("dashboard")} notificationTime={notificationTime} setNotificationTime={setNotificationTime} notificationEnabled={notificationEnabled} toggleNotificationSchedule={toggleNotificationSchedule} scheduleDailyReminder={scheduleDailyReminder} />}
      {screen === "dashboard" && (
        <>
          <InstallPrompt
            visible={showInstallPrompt && (deferredInstallPrompt !== null || isIosInstall)}
            promptEvent={deferredInstallPrompt}
            isIos={isIosInstall}
            onInstall={handleInstallApp}
            onHelp={handleIosInstallHelp}
            onDismiss={() => setShowInstallPrompt(false)}
          />
          <DashboardScreen user={user} goal={goal} allGoals={allGoals} currentGoalId={currentGoalId} switchGoal={switchGoal} roadmap={roadmap} tasks={tasks} setTasks={(newTasks) => { setTasks(newTasks); }} onTaskUpdate={(taskIndex, completed, taskText) => updateTaskStatus(taskIndex, completed, taskText)} onCreateGoal={() => { setGoal({ id: "", title: "", duration: "6 months", motivation: "", category: "" }); setScreen("wizard"); }} onEditGoal={(goalToEdit) => { setGoal(goalToEdit); setScreen("wizard"); }} bgMode={bgMode} toggleBgMode={() => setBgMode(prev => (prev === "black" ? "white" : "black"))} dbConnected={dbConnected} analytics={analytics} onSettings={() => setScreen("settings")} onLogoClick={() => setScreen("dashboard")} />
        </>
      )}
    </div>
  );
}