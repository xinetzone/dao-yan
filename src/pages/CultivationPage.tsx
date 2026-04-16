import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCultivation } from "@/hooks/useCultivation";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { SEO } from "@/components/SEO";
import {
  ArrowLeft, Flame, Star, Calendar, TrendingUp,
  ChevronRight, Sparkles, Loader2, BookOpen, Award, CloudOff, Cloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AI_CHAT_ENDPOINT, SUPABASE_ANON_KEY } from "@/config";

/** Stream-read an SSE response and collect all text deltas */
async function streamAIGuidance(
  prompt: string,
  system: string,
  locale: string,
  signal: AbortSignal
): Promise<string> {
  const response = await fetch(AI_CHAT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
      model: "anthropic/claude-sonnet-4.5",
      system,
      locale,
    }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`HTTP ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullGuidance = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const dataStr = line.slice(5).trim();
        if (!dataStr || dataStr === "[DONE]") continue;
        try {
          const data = JSON.parse(dataStr);
          if (data.type === "content_block_delta" && data.delta?.text) {
            fullGuidance += data.delta.text;
          }
        } catch { /* skip malformed events */ }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullGuidance;
}

type SubView = "home" | "checkin" | "result" | "records" | "tutorial";
type ActiveTab = "checkin" | "guide";

export default function CultivationPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const {
    state, moods, realms, getCurrentRealm, getNextRealm,
    canCheckInToday, checkIn, completeTutorial, getTutorialCompleted, isSyncing,
  } = useCultivation(user?.id);

  const [activeTab, setActiveTab] = useState<ActiveTab>("checkin");
  const [view, setView] = useState<SubView>("home");
  const [tutorialStep, setTutorialStep] = useState(0);
  const [selectedMood, setSelectedMood] = useState("");
  const [wuWeiScore, setWuWeiScore] = useState(0);
  const [daoFieldActive, setDaoFieldActive] = useState(false);
  const [insight, setInsight] = useState("");
  const [aiGuidance, setAiGuidance] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [previousRealm, setPreviousRealm] = useState(getCurrentRealm().id);
  const [fromTutorial, setFromTutorial] = useState(false);

  const currentRealm = getCurrentRealm();
  const nextRealm = getNextRealm();
  const canCheckIn = canCheckInToday();
  const isZh = i18n.language === "zh-CN";

  const TUTORIAL_STEPS = [
    { icon: "sparkles", title: t("cultivation.tutorial.welcome"), content: t("cultivation.tutorial.welcomeContent") },
    { icon: "flame", title: t("cultivation.tutorial.realms"), content: t("cultivation.tutorial.realmsContent"), showRealms: true },
    { icon: "star", title: t("cultivation.tutorial.moods"), content: t("cultivation.tutorial.moodsContent"), showMoods: true },
    { icon: "checkin", title: t("cultivation.tutorial.firstCheckIn"), content: t("cultivation.tutorial.firstCheckInContent"), action: "startCheckIn" },
    { icon: "award", title: t("cultivation.tutorial.gift"), content: t("cultivation.tutorial.giftContent"), showReward: true, rewardPoints: 50 },
  ];

  const currentTutorialStep = TUTORIAL_STEPS[tutorialStep] || TUTORIAL_STEPS[0];
  const progressPercent = nextRealm
    ? ((state.enlightenmentPoints - currentRealm.minEP) / (nextRealm.minEP - currentRealm.minEP)) * 100
    : 100;

  useEffect(() => {
    if (searchParams.get("tutorial") === "true" && !getTutorialCompleted()) {
      setView("tutorial");
      setTutorialStep(0);
      setSearchParams({});
    }
  }, [searchParams, getTutorialCompleted, setSearchParams]);

  const handleCheckInStart = () => {
    setSelectedMood("");
    setWuWeiScore(0);
    setDaoFieldActive(false);
    setInsight("");
    setView("checkin");
  };

  const handleSubmitCheckIn = useCallback(async () => {
    if (!selectedMood) return;
    setIsLoadingAI(true);
    setPreviousRealm(currentRealm.id);

    const moodInfo = moods.find((m) => m.id === selectedMood);
    const prompt = `${t("cultivation.promptPrefix")}${isZh ? moodInfo?.name : moodInfo?.nameEn}${t("cultivation.promptWuWei")}${wuWeiScore}/5${t("cultivation.promptDaoField")}${daoFieldActive ? t("cultivation.promptFieldOpen") : t("cultivation.promptFieldClosed")}${t("cultivation.promptInsight")}${insight || t("cultivation.promptNone")}`;

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 30000);

    const systemPrompt = t("cultivation.systemPrompt") + (isZh ? "" : t("cultivation.systemPromptEn"));

    try {
      const fullGuidance = await streamAIGuidance(prompt, systemPrompt, i18n.language, abortController.signal);
      clearTimeout(timeoutId);
      const points = await checkIn(selectedMood, wuWeiScore, daoFieldActive, insight, fullGuidance);
      setEarnedPoints(points);
      setAiGuidance(fullGuidance);
      if (fromTutorial) { setView("tutorial"); setTutorialStep(4); setFromTutorial(false); }
      else setView("result");
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("AI guidance failed:", error);
      const fallback = t("cultivation.fallbackGuidance");
      const points = await checkIn(selectedMood, wuWeiScore, daoFieldActive, insight, fallback);
      setEarnedPoints(points);
      setAiGuidance(fallback);
      if (fromTutorial) { setView("tutorial"); setTutorialStep(4); setFromTutorial(false); }
      else setView("result");
    } finally {
      setIsLoadingAI(false);
    }
  }, [selectedMood, wuWeiScore, daoFieldActive, insight, checkIn, currentRealm.id, moods, isZh, fromTutorial, i18n.language, t]);

  const hasLeveledUp = getCurrentRealm().id > previousRealm;

  const handleTutorialNext = async () => {
    if (tutorialStep === 3) { setFromTutorial(true); handleCheckInStart(); }
    else if (tutorialStep === 4) { await completeTutorial(); setView("home"); }
    else if (tutorialStep < TUTORIAL_STEPS.length - 1) setTutorialStep(tutorialStep + 1);
  };

  const iconMap: Record<string, React.ReactNode> = {
    sparkles: <Sparkles className="h-10 w-10" />,
    flame: <Flame className="h-10 w-10" />,
    star: <Star className="h-10 w-10" />,
    checkin: <BookOpen className="h-10 w-10" />,
    award: <Award className="h-10 w-10" />,
  };

  // Whether to show back-to-home in header (inside checkin sub-views)
  const showSubViewBack = view === "checkin" || view === "result" || view === "records";

  return (
    <>
      <SEO 
        title={t("cultivation.title")}
        description="道衍修行打卡系统，基于帛书《道德经》与佛家直心观，结合 AI 智慧引导，帮助你记录修行状态、获取个性化修行建议。追踪无为指数、境界提升，开启智慧修行之旅。"
        keywords="修行打卡,道德经,帛书,老子,佛家,直心观,AI修行指导,无为,境界,打卡系统"
        url="https://dao-yan.enter.pro/cultivate"
      />
      <div className="min-h-screen bg-background text-foreground">
      {/* Login banner */}
      {!user && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/40 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <CloudOff className="h-4 w-4 shrink-0" />
            {isZh ? "未登录，数据仅保存在本设备" : "Not signed in — data saved locally only"}
          </span>
          <Button variant="link" size="sm" className="h-auto p-0 text-sm" onClick={() => setAuthOpen(true)}>
            {isZh ? "登录以同步云端" : "Sign in to sync"}
          </Button>
        </div>
      )}
      {user && isSyncing && (
        <div className="flex items-center gap-2 px-4 py-1.5 text-xs text-muted-foreground bg-muted/30 border-b border-border">
          <Loader2 className="h-3 w-3 animate-spin" />
          <Cloud className="h-3 w-3" />
          {isZh ? "正在同步修炼数据..." : "Syncing cultivation data..."}
        </div>
      )}
      <div className="relative max-w-2xl mx-auto px-4 py-4 sm:py-6 pb-12">
        {/* Floating decoration */}
        <div className="dao-float-square dao-float-1 hidden sm:block" />
        <div className="dao-float-square dao-float-2 hidden sm:block" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (showSubViewBack) { setView("home"); }
              else navigate("/");
            }}
            className="text-muted-foreground hover:text-foreground gap-1.5 px-2.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">
              {showSubViewBack ? t("cultivation.home") : t("cultivation.back")}
            </span>
          </Button>
          <h1 className="text-base sm:text-lg font-bold tracking-wider text-center flex-1 mx-2">
            {t("cultivation.title")}
          </h1>
          <div className="w-16" />
        </div>

        {/* ========== TAB BAR (shown when not in sub-views) ========== */}
        {!showSubViewBack && view !== "tutorial" && (
          <div className="flex rounded-xl border border-border bg-muted/40 p-1 mb-6 gap-1">
            {(["checkin", "guide"] as ActiveTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                style={
                  activeTab === tab
                    ? {
                        background: `linear-gradient(135deg, ${currentRealm.color}cc, ${currentRealm.color}88)`,
                        color: "#fff",
                        boxShadow: `0 2px 8px ${currentRealm.color}30`,
                      }
                    : { color: "hsl(var(--muted-foreground))" }
                }
              >
                {tab === "checkin"
                  ? t("cultivation.checkIn")
                  : t("cultivation.guideTab")}
              </button>
            ))}
          </div>
        )}

        {/* ========== TUTORIAL VIEW (triggered by URL param) ========== */}
        {view === "tutorial" && (
          <div className="space-y-5 animate-in fade-in duration-500">
            <div className="flex justify-center gap-2">
              {TUTORIAL_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: idx === tutorialStep ? 32 : 8,
                    backgroundColor: idx <= tutorialStep ? currentRealm.color : "hsl(var(--border))",
                    opacity: idx <= tutorialStep ? 1 : 0.5,
                  }}
                />
              ))}
            </div>

            <div className="cult-card-glow p-6 sm:p-8 space-y-6">
              <div className="flex justify-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center border-2"
                  style={{
                    borderColor: `${currentRealm.color}30`,
                    background: `radial-gradient(circle, ${currentRealm.color}15, transparent)`,
                    color: currentRealm.color,
                  }}
                >
                  {iconMap[currentTutorialStep.icon] || <Sparkles className="h-10 w-10" />}
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-center">{currentTutorialStep.title}</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-center text-sm px-2">
                {currentTutorialStep.content}
              </p>

              {currentTutorialStep.showRealms && (
                <div className="grid grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                  {realms.map((realm) => (
                    <div key={realm.id} className="cult-mood-card" style={{ borderColor: `${realm.color}25` }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Flame className="h-4 w-4" style={{ color: realm.color }} />
                        <span className="font-bold text-sm" style={{ color: realm.color }}>
                          {isZh ? realm.name : realm.nameEn}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">{isZh ? realm.description : realm.descriptionEn}</div>
                      <div className="text-[11px] text-muted-foreground/60 mt-1">{realm.minEP.toLocaleString()} EP</div>
                    </div>
                  ))}
                </div>
              )}

              {currentTutorialStep.showMoods && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {moods.map((mood) => (
                    <div key={mood.id} className="cult-mood-card">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="h-4 w-4" style={{ color: currentRealm.color }} />
                        <span className="font-bold text-sm">{isZh ? mood.name : mood.nameEn}</span>
                        <span className="ml-auto text-[11px] font-medium" style={{ color: currentRealm.color }}>
                          +{mood.points}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">{isZh ? mood.description : mood.descriptionEn}</div>
                    </div>
                  ))}
                </div>
              )}

              {currentTutorialStep.showReward && (
                <div className="text-center space-y-4 py-4">
                  <div className="text-5xl font-bold animate-in zoom-in duration-500 tabular-nums" style={{ color: currentRealm.color }}>
                    +{currentTutorialStep.rewardPoints}
                  </div>
                  <div className="text-base text-muted-foreground">
                    {t("cultivation.tutorial.pointsGifted", { points: currentTutorialStep.rewardPoints })}
                  </div>
                  <Award className="h-14 w-14 mx-auto animate-pulse" style={{ color: currentRealm.color }} />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {tutorialStep > 0 && tutorialStep < 4 && (
                  <button
                    onClick={() => setTutorialStep(tutorialStep - 1)}
                    className="flex-1 h-11 text-sm border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all"
                  >
                    {t("cultivation.tutorial.previous")}
                  </button>
                )}
                <button
                  onClick={handleTutorialNext}
                  className="cult-btn-glow flex-1 h-11 text-sm font-medium rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${currentRealm.color}, ${currentRealm.color}cc)`,
                    color: "#fff",
                  }}
                >
                  {tutorialStep === 4
                    ? t("cultivation.tutorial.complete")
                    : currentTutorialStep.action === "startCheckIn"
                      ? t("cultivation.tutorial.startCheckIn")
                      : t("cultivation.tutorial.next")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========== CHECK-IN TAB ========== */}
        {activeTab === "checkin" && view !== "tutorial" && (
          <div>
            {/* --- HOME SUB-VIEW --- */}
            {view === "home" && (
              <div className="space-y-7 animate-in fade-in duration-500">
                <div className="flex flex-col items-center space-y-5">
                  <div
                    className="spirit-orb relative w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center border-2"
                    style={{
                      borderColor: `${currentRealm.color}40`,
                      background: `radial-gradient(circle, ${currentRealm.color}15, ${currentRealm.color}05, transparent)`,
                      boxShadow: `0 0 40px ${currentRealm.color}15`,
                    }}
                  >
                    <Flame className="h-16 w-16 sm:h-20 sm:w-20" style={{ color: currentRealm.color }} />
                  </div>
                  <div className="text-center space-y-1.5">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-widest" style={{ color: currentRealm.color }}>
                      {isZh ? currentRealm.name : currentRealm.nameEn}
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground tracking-wide">
                      {isZh ? currentRealm.description : currentRealm.descriptionEn}
                    </p>
                  </div>
                </div>

                <div className="cult-card-glow p-5 sm:p-6 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      {t("cultivation.enlightenment")}
                    </span>
                    <span className="text-2xl font-bold tabular-nums" style={{ color: currentRealm.color }}>
                      {state.enlightenmentPoints.toLocaleString()}
                    </span>
                  </div>
                  {nextRealm && (
                    <>
                      <div className="cult-progress-track">
                        <div
                          className="cult-progress-fill"
                          style={{
                            width: `${Math.min(progressPercent, 100)}%`,
                            background: `linear-gradient(90deg, ${currentRealm.color}cc, ${currentRealm.color})`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{t("cultivation.current")}: {currentRealm.minEP.toLocaleString()}</span>
                        <span>{t("cultivation.next")}: {nextRealm.minEP.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Calendar, value: state.totalCheckIns, label: t("cultivation.total") },
                    { icon: TrendingUp, value: state.checkInStreak, label: t("cultivation.streak") },
                    { icon: Sparkles, value: state.enlightenmentPoints, label: t("cultivation.ep") },
                  ].map((s) => (
                    <div key={s.label} className="cult-stat">
                      <s.icon className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
                      <div className="text-xl font-bold tabular-nums">{s.value}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <button
                    className="cult-btn-glow w-full h-14 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: canCheckIn
                        ? `linear-gradient(135deg, ${currentRealm.color}, ${currentRealm.color}cc)`
                        : "hsl(var(--muted))",
                      color: canCheckIn ? "#fff" : "hsl(var(--muted-foreground))",
                    }}
                    onClick={handleCheckInStart}
                    disabled={!canCheckIn}
                  >
                    <Flame className="h-5 w-5" />
                    {canCheckIn ? t("cultivation.checkInToday") : t("cultivation.completedToday")}
                  </button>
                  <button
                    className="w-full h-12 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border hover:border-foreground/20 rounded-lg transition-all"
                    onClick={() => setView("records")}
                  >
                    {t("cultivation.records")}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* --- CHECK-IN FORM SUB-VIEW --- */}
            {view === "checkin" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="cult-card-glow p-5 sm:p-7 space-y-7">
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold">
                      {t("cultivation.todayMood")}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {moods.map((mood) => (
                        <button
                          key={mood.id}
                          onClick={() => setSelectedMood(mood.id)}
                          className={`cult-mood-card text-left ${selectedMood === mood.id ? "selected" : ""}`}
                          style={
                            selectedMood === mood.id
                              ? { borderColor: currentRealm.color, boxShadow: `0 0 16px ${currentRealm.color}15` }
                              : undefined
                          }
                        >
                          <div className="font-semibold text-sm">{isZh ? mood.name : mood.nameEn}</div>
                          <div className="text-xs text-muted-foreground mt-1">{isZh ? mood.description : mood.descriptionEn}</div>
                          <div className="text-[11px] mt-2 font-medium" style={{ color: currentRealm.color }}>+{mood.points} EP</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-base font-semibold">
                      {t("cultivation.wuWeiIndex")}
                    </h3>
                    <div className="flex justify-center gap-3">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          onClick={() => setWuWeiScore(score)}
                          className="transition-all hover:scale-110"
                          style={{ opacity: wuWeiScore >= score ? 1 : 0.25 }}
                        >
                          <Star
                            className="h-9 w-9 sm:h-10 sm:w-10"
                            fill={wuWeiScore >= score ? currentRealm.color : "none"}
                            color={currentRealm.color}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-center text-xs text-muted-foreground">
                      {t("cultivation.wuWeiDesc")}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-base font-semibold">
                      {t("cultivation.daoField")}
                    </h3>
                    <div className="flex justify-center">
                      <button
                        onClick={() => setDaoFieldActive(!daoFieldActive)}
                        className="px-8 py-3 rounded-lg border transition-all text-sm font-medium"
                        style={{
                          borderColor: daoFieldActive ? currentRealm.color : "hsl(var(--border))",
                          background: daoFieldActive ? `${currentRealm.color}12` : "hsl(var(--card))",
                          color: daoFieldActive ? currentRealm.color : "hsl(var(--muted-foreground))",
                          boxShadow: daoFieldActive ? `0 0 20px ${currentRealm.color}15` : "none",
                        }}
                      >
                        {daoFieldActive ? t("cultivation.daoFieldActive") : t("cultivation.daoFieldTap")}
                      </button>
                    </div>
                    <p className="text-center text-xs text-muted-foreground">
                      {t("cultivation.daoFieldDesc")}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-base font-semibold">
                      {t("cultivation.innerReflection")}
                    </h3>
                    <Textarea
                      value={insight}
                      onChange={(e) => setInsight(e.target.value)}
                      placeholder={t("cultivation.insightPlaceholder")}
                      className="bg-card border-border text-foreground placeholder:text-muted-foreground min-h-24 rounded-lg focus:border-foreground/25 focus:ring-0 resize-none"
                    />
                  </div>

                  <button
                    className="cult-btn-glow w-full h-13 py-3.5 text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg"
                    style={{
                      background: selectedMood
                        ? `linear-gradient(135deg, ${currentRealm.color}, ${currentRealm.color}cc)`
                        : "hsl(var(--muted))",
                      color: selectedMood ? "#fff" : "hsl(var(--muted-foreground))",
                    }}
                    onClick={handleSubmitCheckIn}
                    disabled={!selectedMood || isLoadingAI}
                  >
                    {isLoadingAI ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {t("cultivation.sensing")}
                      </>
                    ) : (
                      t("cultivation.submit")
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* --- RESULT SUB-VIEW --- */}
            {view === "result" && (
              <div className="space-y-5 animate-in fade-in duration-700">
                <div className={`cult-card-glow p-8 text-center space-y-4 ${hasLeveledUp ? "cult-level-up" : ""}`}>
                  <div
                    className="text-5xl sm:text-6xl font-bold animate-in zoom-in duration-500 tabular-nums"
                    style={{ color: currentRealm.color }}
                  >
                    +{earnedPoints}
                  </div>
                  <div className="text-base text-muted-foreground">{t("cultivation.enlightenmentPoints")}</div>
                  {hasLeveledUp && (
                    <div className="animate-in slide-in-from-bottom duration-700 pt-2">
                      <Badge
                        className="text-base px-5 py-2 font-bold border-0"
                        style={{ background: currentRealm.color, color: "#fff" }}
                      >
                        {t("cultivation.breakthrough")} {isZh ? currentRealm.name : currentRealm.nameEn}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="cult-card-glow p-5 sm:p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" style={{ color: currentRealm.color }} />
                    <h3 className="text-sm font-semibold text-muted-foreground">{t("cultivation.daoReflection")}</h3>
                  </div>
                  <MarkdownRenderer content={aiGuidance} />
                </div>

                <button
                  className="cult-btn-glow w-full h-12 text-sm font-medium flex items-center justify-center gap-2 rounded-lg"
                  style={{ background: `linear-gradient(135deg, ${currentRealm.color}cc, ${currentRealm.color}88)`, color: "#fff" }}
                  onClick={() => setView("home")}
                >
                  {t("cultivation.returnHome")}
                </button>
              </div>
            )}

            {/* --- RECORDS SUB-VIEW --- */}
            {view === "records" && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <h2 className="text-xl font-bold mb-2">{t("cultivation.records")}</h2>
                {state.records.length === 0 ? (
                  <div className="cult-card-glow p-8 text-center text-muted-foreground text-sm">
                    {t("cultivation.noRecords")}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {state.records.slice(0, 30).map((record, index) => {
                      const mood = moods.find((m) => m.id === record.mood);
                      return (
                        <div key={index} className="cult-record space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">
                                {new Date(record.date).toLocaleDateString()}
                              </div>
                              <Badge variant="outline" className="text-[11px]">
                                {isZh ? mood?.name : mood?.nameEn}
                              </Badge>
                            </div>
                            <div className="text-lg font-bold tabular-nums" style={{ color: currentRealm.color }}>
                              +{record.pointsEarned}
                            </div>
                          </div>
                          {record.aiGuidance && (
                            <details className="text-xs text-muted-foreground group">
                              <summary className="cursor-pointer hover:text-foreground transition-colors">
                                {t("cultivation.viewReflection")}
                              </summary>
                              <div className="mt-2 pl-3 border-l-2 border-dashed border-border">
                                <MarkdownRenderer content={record.aiGuidance} className="text-xs" />
                              </div>
                            </details>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========== GUIDE TAB ========== */}
        {activeTab === "guide" && view !== "tutorial" && view !== "checkin" && view !== "result" && view !== "records" && (
          <div className="space-y-6 animate-in fade-in duration-500">

            {/* Overview */}
            <div className="cult-card-glow p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-5 w-5" style={{ color: currentRealm.color }} />
                <h2 className="text-base font-bold">{t("cultivation.systemOverview")}</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {t("cultivation.tutorial.welcomeContent")}
              </p>
            </div>

            {/* Realms */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5" style={{ color: currentRealm.color }} />
                <h2 className="text-base font-bold">{t("cultivation.realmSystem")}</h2>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {realms.map((realm) => (
                  <div
                    key={realm.id}
                    className="cult-mood-card"
                    style={{
                      borderColor: realm.id === currentRealm.id ? `${realm.color}60` : `${realm.color}20`,
                      background: realm.id === currentRealm.id ? `${realm.color}08` : undefined,
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Flame className="h-4 w-4 shrink-0" style={{ color: realm.color }} />
                      <span className="font-bold text-sm" style={{ color: realm.color }}>
                        {isZh ? realm.name : realm.nameEn}
                      </span>
                      {realm.id === currentRealm.id && (
                        <Badge className="ml-auto text-[10px] px-1.5 py-0 border-0 shrink-0" style={{ background: `${realm.color}20`, color: realm.color }}>
                          {t("cultivation.now")}
                        </Badge>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{isZh ? realm.description : realm.descriptionEn}</div>
                    <div className="text-[11px] text-muted-foreground/50 mt-1.5 tabular-nums">{realm.minEP.toLocaleString()} EP</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Moods & Points */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" style={{ color: currentRealm.color }} />
                <h2 className="text-base font-bold">{t("cultivation.moodPoints")}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {moods.map((mood) => (
                  <div key={mood.id} className="cult-mood-card">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="h-4 w-4 shrink-0" style={{ color: currentRealm.color }} />
                      <span className="font-bold text-sm">{isZh ? mood.name : mood.nameEn}</span>
                      <span className="ml-auto text-sm font-bold tabular-nums shrink-0" style={{ color: currentRealm.color }}>
                        +{mood.points}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">{isZh ? mood.description : mood.descriptionEn}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scoring Rules */}
            <div className="cult-card-glow p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" style={{ color: currentRealm.color }} />
                <h2 className="text-base font-bold">{t("cultivation.scoringRules")}</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex justify-between border-b border-border pb-2">
                  <span>{t("cultivation.moodBase")}</span>
                  <span className="font-medium text-foreground">10–50 EP</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span>{t("cultivation.wuWeiPerStar")}</span>
                  <span className="font-medium text-foreground">+5 EP</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span>{t("cultivation.daoFieldBonus")}</span>
                  <span className="font-medium text-foreground">+10 EP</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span>{t("cultivation.reflectionBonus")}</span>
                  <span className="font-medium text-foreground">+5 EP</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("cultivation.streakBonus")}</span>
                  <span className="font-medium text-foreground">×1.1 – ×1.5</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
    <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
