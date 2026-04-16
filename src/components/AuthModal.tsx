import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "@/contexts/AuthContext";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type Mode = "login" | "signup" | "forgot" | "forgot_verify" | "forgot_newpw";

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === "zh-CN";
  const { signIn, signUp, sendPasswordResetOTP, verifyPasswordResetOTP, updatePassword } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setEmail(""); setPassword(""); setOtp(""); setNewPw("");
    setError(null); setLoading(false); setShowPw(false);
    setMode("login");
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const goBack = () => {
    setError(null);
    if (mode === "forgot_newpw" || mode === "forgot_verify") setMode("forgot");
    else setMode("login");
  };

  // ── Step 1: send OTP ──
  const handleForgotSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError(isZh ? "请输入邮箱" : "Please enter your email"); return; }
    setLoading(true); setError(null);
    const { error: err } = await sendPasswordResetOTP(email);
    setLoading(false);
    if (err) {
      setError(isZh ? "发送失败，请确认邮箱已注册" : "Failed. Make sure this email is registered.");
    } else {
      setMode("forgot_verify");
    }
  };

  // ── Step 2: verify OTP ──
  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) { setError(isZh ? "请输入6位验证码" : "Enter the 6-digit code"); return; }
    setLoading(true); setError(null);
    const { error: err } = await verifyPasswordResetOTP(email, otp);
    setLoading(false);
    if (err) {
      setError(isZh ? "验证码错误或已过期，请重新发送" : "Invalid or expired code. Please resend.");
    } else {
      setMode("forgot_newpw");
    }
  };

  // ── Step 3: set new password ──
  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 6) { setError(isZh ? "密码至少需要6位字符" : "Password must be at least 6 characters"); return; }
    setLoading(true); setError(null);
    const { error: err } = await updatePassword(newPw);
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      reset();
      onOpenChange(false);
      onSuccess?.();
    }
  };

  // ── Login / Signup ──
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError(isZh ? "请填写邮箱和密码" : "Please fill in email and password"); return; }
    setLoading(true); setError(null);
    const fn = mode === "login" ? signIn : signUp;
    const { error: authError } = await fn(email, password);
    setLoading(false);
    if (authError) {
      const msg = authError.message;
      if (msg.includes("Invalid login credentials")) setError(isZh ? "邮箱或密码错误" : "Invalid email or password");
      else if (msg.includes("User already registered")) setError(isZh ? "该邮箱已注册，请直接登录" : "Email already registered, please sign in");
      else if (msg.includes("Password should be")) setError(isZh ? "密码至少需要6位字符" : "Password must be at least 6 characters");
      else setError(msg);
      return;
    }
    reset();
    onOpenChange(false);
    onSuccess?.();
  };

  const isForgotFlow = mode === "forgot" || mode === "forgot_verify" || mode === "forgot_newpw";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {isForgotFlow
              ? (isZh ? "重置密码" : "Reset Password")
              : (isZh ? "道衍" : "DaoYan")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isZh ? "登录或注册道衍账号" : "Sign in or create your DaoYan account"}
          </DialogDescription>
        </DialogHeader>

        {/* ── Back button for forgot flow ── */}
        {isForgotFlow && (
          <button
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors -mt-1"
            onClick={goBack}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {isZh ? "返回登录" : "Back to sign in"}
          </button>
        )}

        {/* ────────────── FORGOT: Step 1 — enter email ────────────── */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotSend} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isZh
                ? "输入注册邮箱，我们将发送6位验证码"
                : "Enter your email to receive a 6-digit verification code"}
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="forgot-email">{isZh ? "邮箱" : "Email"}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="forgot-email" type="email" placeholder="your@email.com" className="pl-9"
                  value={email} onChange={e => setEmail(e.target.value)} disabled={loading} autoComplete="email" autoFocus />
              </div>
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isZh ? "发送验证码" : "Send Code"}
            </Button>
          </form>
        )}

        {/* ────────────── FORGOT: Step 2 — enter OTP ────────────── */}
        {mode === "forgot_verify" && (
          <form onSubmit={handleOTPVerify} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isZh
                ? `验证码已发送至 ${email}，请查收邮件（含垃圾邮件）并输入6位数字验证码`
                : `A 6-digit code was sent to ${email}. Check your inbox (including spam).`}
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="otp-code">{isZh ? "6位验证码" : "6-digit Code"}</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="otp-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="123456"
                  className="pl-9 text-center tracking-[0.3em] text-lg font-mono"
                  value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g, "")); setError(null); }}
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || otp.length < 6}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isZh ? "验证" : "Verify"}
            </Button>
            <button type="button" className="w-full text-xs text-muted-foreground hover:text-primary transition-colors"
              onClick={() => { setMode("forgot"); setOtp(""); setError(null); }}>
              {isZh ? "没收到？重新发送" : "Didn't receive it? Resend"}
            </button>
          </form>
        )}

        {/* ────────────── FORGOT: Step 3 — set new password ────────────── */}
        {mode === "forgot_newpw" && (
          <form onSubmit={handleNewPassword} className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-2 rounded-md">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{isZh ? "身份已验证，请设置新密码" : "Identity verified. Set your new password."}</span>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">{isZh ? "新密码" : "New Password"}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-password"
                  type={showPw ? "text" : "password"}
                  placeholder={isZh ? "至少6位字符" : "At least 6 characters"}
                  className="pl-9 pr-9"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                  autoFocus
                />
                <button type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isZh ? "保存新密码并登录" : "Save & Sign In"}
            </Button>
          </form>
        )}

        {/* ────────────── LOGIN / SIGNUP ────────────── */}
        {(mode === "login" || mode === "signup") && (
          <>
            <div className="flex rounded-lg border border-border overflow-hidden mb-2">
              <button className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "login" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:text-foreground"}`}
                onClick={() => { setMode("login"); setError(null); }}>
                {isZh ? "登录" : "Sign In"}
              </button>
              <button className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "signup" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:text-foreground"}`}
                onClick={() => { setMode("signup"); setError(null); }}>
                {isZh ? "注册" : "Sign Up"}
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">{isZh ? "邮箱" : "Email"}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="your@email.com" className="pl-9"
                    value={email} onChange={e => setEmail(e.target.value)} disabled={loading} autoComplete="email" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{isZh ? "密码" : "Password"}</Label>
                  {mode === "login" && (
                    <button type="button"
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => { setMode("forgot"); setError(null); }}>
                      {isZh ? "忘记密码？" : "Forgot password?"}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type={showPw ? "text" : "password"}
                    placeholder={isZh ? "至少6位字符" : "At least 6 characters"}
                    className="pl-9 pr-9"
                    value={password} onChange={e => setPassword(e.target.value)}
                    disabled={loading} autoComplete={mode === "login" ? "current-password" : "new-password"} />
                  <button type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {mode === "login" ? (isZh ? "登录" : "Sign In") : (isZh ? "注册账号" : "Create Account")}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground pt-1">
              {isZh ? "登录即可无限使用道衍 AI 对话" : "Sign in to unlock unlimited AI conversations"}
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
