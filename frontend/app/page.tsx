"use client";

import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";

import {
  Activity,
  ArrowRight,
  Bell,
  Bot,
  CalendarDays,
  ChevronRight,
  Droplets,
  FileText,
  HeartPulse,
  Home,
  MessageCircle,
  MoreVertical,
  Pill,
  Send,
  ShieldAlert,
  Sparkles,
  UserRound,
  LogIn,
  UserPlus,
  X,
} from "lucide-react";

export default function HomePage() {
  /* ================================================= */
  /* AI CHAT STATE */
  /* ================================================= */

  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<
    {
      role: "ai" | "user";
      text: string;
    }[]
  >([
    {
      role: "ai",
      text: "Hi Vaibhav 👋 I'm SumanCare AI. I can help you understand your health data, medicines, trends, and daily health habits.",
    },
  ]);

  /* ================================================= */
  /* MENU STATE */
  /* ================================================= */

  const [menuOpen, setMenuOpen] = useState(false);

  /* ================================================= */
  /* LIVE DATE */
  /* ================================================= */

  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();

      const formattedDate = now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });

      setCurrentDate(formattedDate);
    };

    updateDate();

    // Update automatically every minute
    const interval = setInterval(updateDate, 60000);

    return () => clearInterval(interval);
  }, []);

  /* ================================================= */
  /* SCROLL REVEAL */
  /* ================================================= */

  useEffect(() => {
    const elements = document.querySelectorAll(".reveal-on-scroll");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  /* ================================================= */
  /* AI CHAT RESPONSE */
  /* ================================================= */

  const handleSend = (text: string) => {
    const cleanText = text.trim();

    if (!cleanText) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: cleanText,
      },
    ]);

    setInput("");

    setTimeout(() => {
      let response =
        "I can help you understand your health patterns. Based on the information currently available in SumanCare, your AI-assisted health risk score is 28/100 and currently appears stable.";

      const lowerText = cleanText.toLowerCase();

      if (
        lowerText.includes("risk") ||
        lowerText.includes("score")
      ) {
        response =
          "Your current AI-assisted health risk score is 28/100, shown as low and stable in this demo. Recent activity and medication adherence are contributing positively. This is an informational health insight, not a medical diagnosis.";
      } else if (
        lowerText.includes("medicine") ||
        lowerText.includes("medication") ||
        lowerText.includes("tablet")
      ) {
        response =
          "Your medicine schedule currently shows today's medicines and their adherence status. Keeping your prescribed schedule consistent is important. If you miss a dose, follow your healthcare professional's instructions rather than changing the dose yourself.";
      } else if (
        lowerText.includes("water") ||
        lowerText.includes("hydration")
      ) {
        response =
          "Your dashboard currently shows 1.8 L of water against a 2.5 L daily goal. Staying adequately hydrated supports general wellbeing, although your ideal intake can vary depending on your health and your doctor's advice.";
      } else if (
        lowerText.includes("health today") ||
        lowerText.includes("today")
      ) {
        response =
          "Today's demo snapshot looks stable: blood pressure 118/76 mmHg, heart rate 72 BPM, 6,420 steps, and 1.8 L water. Your AI-assisted health risk score is 28/100.";
      } else if (
        lowerText.includes("improve") ||
        lowerText.includes("better")
      ) {
        response =
          "You can focus on consistent sleep, regular physical activity, hydration, medication adherence, and recording your daily health measurements. SumanCare can track these patterns over time.";
      } else if (lowerText.includes("sleep")) {
        response =
          "Sleep is one of the lifestyle factors SumanCare can monitor. Consistent sleep patterns can support overall wellbeing. Your future health trend analysis can compare sleep with activity and other recorded health measurements.";
      } else if (
        lowerText.includes("glucose") ||
        lowerText.includes("sugar")
      ) {
        response =
          "Your current demo glucose reading is 102 mg/dL. SumanCare can help you track glucose patterns over time rather than relying on a single reading. Your personal targets should be based on your healthcare professional's advice.";
      } else if (
        lowerText.includes("blood pressure") ||
        lowerText.includes("bp")
      ) {
        response =
          "Your current demo blood pressure is 118/76 mmHg. SumanCare can track readings over time to help you notice changes and discuss them with your healthcare professional.";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: response,
        },
      ]);
    }, 700);
  };

  return (
    <main className="min-h-screen bg-[#eef7f4] pb-24 text-[#14201d] sm:pb-0">

      {/* ================================================= */}
      {/* PREMIUM BACKGROUND */}
      {/* ================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#d9f3e9]/70 blur-[100px]" />

        <div className="absolute -right-40 top-[18%] h-[500px] w-[500px] rounded-full bg-[#dff5f1]/80 blur-[110px]" />

        <div className="absolute bottom-[-220px] left-[25%] h-[450px] w-[450px] rounded-full bg-[#e5f6f0]/70 blur-[100px]" />

        <div className="absolute left-[45%] top-[15%] h-[300px] w-[300px] rounded-full bg-white/80 blur-[120px]" />

      </div>

      {/* ================================================= */}
      {/* APP CONTAINER */}
      {/* ================================================= */}

      <div className="relative mx-auto min-h-screen max-w-[1500px] px-3 py-3 sm:px-5 sm:py-5 lg:px-8">

        <div className="min-h-[calc(100vh-24px)] overflow-hidden rounded-[34px] border border-white/90 bg-white/72 shadow-[0_30px_100px_rgba(20,70,60,0.10)] backdrop-blur-2xl">

          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <header className="relative flex items-center justify-between px-5 py-5 sm:px-8 lg:px-10">

            {/* LEFT SIDE */}

            <div className="flex items-center gap-3">

              {/* HAMBURGER */}

              <div className="relative">

                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  aria-label="Open menu"
                  aria-expanded={menuOpen}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white bg-white/90 text-slate-600 shadow-[0_5px_20px_rgba(20,60,50,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(20,60,50,0.10)]"
                >
                  <span className="text-xl leading-none">
                    ☰
                  </span>
                </button>

                {/* ================================================= */}
                {/* PROFILE / AUTH MENU */}
                {/* ================================================= */}

                {menuOpen && (

                  <div className="absolute left-0 top-14 z-[80] w-52 overflow-hidden rounded-[22px] border border-white/90 bg-white/95 p-2 shadow-[0_20px_60px_rgba(20,60,50,0.15)] backdrop-blur-2xl">

                    <div className="px-3 pb-2 pt-2">

                      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
                        Account
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        SumanCare
                      </p>

                    </div>

                    {/* PROFILE */}

                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                    >

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <UserRound size={17} />
                      </div>

                      <div>
                        <p className="font-medium">
                          Profile
                        </p>

                        <p className="text-[9px] text-slate-400">
                          Your health profile
                        </p>
                      </div>

                    </Link>

                    {/* LOGIN */}

                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                    >

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <LogIn size={17} />
                      </div>

                      <div>
                        <p className="font-medium">
                          Login
                        </p>

                        <p className="text-[9px] text-slate-400">
                          Access your account
                        </p>
                      </div>

                    </Link>

                    {/* SIGN UP */}

                    <Link
                      href="/signup"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-600 transition hover:bg-purple-50 hover:text-purple-700"
                    >

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                        <UserPlus size={17} />
                      </div>

                      <div>
                        <p className="font-medium">
                          Sign Up
                        </p>

                        <p className="text-[9px] text-slate-400">
                          Create your account
                        </p>
                      </div>

                    </Link>

                  </div>

                )}

              </div>

              {/* BRAND */}

              <div className="hidden sm:block">

                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Health intelligence
                </p>

                <div className="mt-0.5 flex items-center gap-2">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-700 text-white shadow-sm">
                    <HeartPulse size={14} strokeWidth={2.2} />
                  </div>

                  <h1 className="text-lg font-semibold tracking-tight text-slate-800">
                    SumanCare
                  </h1>

                </div>

              </div>

              <div className="sm:hidden">

                <p className="text-base font-semibold tracking-tight text-slate-800">
                  SumanCare
                </p>

                <p className="text-[9px] uppercase tracking-[0.15em] text-slate-400">
                  Health intelligence
                </p>

              </div>

            </div>

            {/* RIGHT SIDE */}

            <div className="flex items-center gap-2">

              <button
                type="button"
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white bg-white/90 text-slate-600 shadow-[0_5px_20px_rgba(20,60,50,0.06)] transition-all duration-300 hover:-translate-y-0.5"
              >

                <Bell
                  size={18}
                  strokeWidth={1.8}
                />

                <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />

              </button>

              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white bg-white/90 text-slate-600 shadow-[0_5px_20px_rgba(20,60,50,0.06)] transition-all duration-300 hover:-translate-y-0.5"
              >
                <MoreVertical
                  size={18}
                  strokeWidth={1.8}
                />
              </button>

            </div>

          </header>

          {/* ================================================= */}
          {/* HERO */}
          {/* ================================================= */}

          <section className="px-5 pb-10 pt-5 sm:px-8 lg:px-12">

            <Reveal>

              <div className="mx-auto max-w-5xl text-center">

                {/* LIVE DATE */}

                <p className="mb-3 text-xs font-medium tracking-wide text-slate-400">
                  {currentDate || "Loading date..."}
                </p>

                <h2 className="text-3xl font-medium tracking-[-0.04em] text-slate-800 sm:text-5xl">
                  Hey, Vaibhav!
                </h2>

                <p className="mt-2 text-lg font-light text-slate-400 sm:text-xl">
                  How can I help you{" "}
                  <span className="font-medium text-emerald-600">
                    today?
                  </span>
                </p>

                {/* ================================================= */}
                {/* CLICKABLE AI ORB */}
                {/* ================================================= */}

                <button
                  type="button"
                  onClick={() => setChatOpen(true)}
                  aria-label="Open SumanCare AI"
                  className="ai-orb group relative mx-auto mt-8 flex h-40 w-40 cursor-pointer items-center justify-center rounded-full outline-none sm:h-48 sm:w-48"
                >

                  <div className="absolute inset-[-25px] rounded-full bg-emerald-200/35 blur-3xl transition-all duration-500 group-hover:bg-emerald-200/50" />

                  <div className="absolute inset-[-10px] rounded-full border border-emerald-200/30 transition-all duration-500 group-hover:scale-105 group-hover:border-emerald-300/50" />

                  <div className="absolute inset-[-18px] rounded-full border border-white/70 transition-all duration-500 group-hover:scale-110" />

                  <div className="absolute h-36 w-36 rounded-full bg-emerald-300/20 blur-xl transition-all duration-500 group-hover:scale-110 sm:h-44 sm:w-44" />

                  <div className="absolute h-28 w-28 rounded-full bg-gradient-to-br from-[#b9f8df] via-[#19b986] to-[#03483b] shadow-[0_20px_55px_rgba(7,120,92,0.30)] transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_25px_70px_rgba(7,120,92,0.42)] sm:h-36 sm:w-36" />

                  <div className="absolute h-24 w-24 rounded-full bg-[radial-gradient(circle_at_35%_25%,#dffff2_0%,#35d3a1_24%,#08785c_56%,#063f35_100%)] shadow-inner sm:h-32 sm:w-32" />

                  <div className="absolute h-14 w-14 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffff,#72edc0_35%,#08785c_82%)] blur-[1px] transition-transform duration-500 group-hover:scale-110 sm:h-20 sm:w-20" />

                  <Sparkles
                    className="relative z-10 text-white/95 drop-shadow-sm transition-transform duration-500 group-hover:scale-110"
                    size={26}
                    strokeWidth={1.5}
                  />

                </button>

                {/* AI STATUS */}

                <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-white/70 px-3 py-1.5 shadow-[0_5px_20px_rgba(20,80,60,0.04)] backdrop-blur">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_7px_rgba(16,185,129,0.6)]" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                    AI health monitoring active
                  </span>

                </div>

                <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-400">
                  Your personal health intelligence companion. Understand your
                  health patterns before they become problems.
                </p>

              </div>

            </Reveal>

            {/* ================================================= */}
            {/* QUICK ACCESS */}
            {/* ================================================= */}

            <Reveal delay={100}>

              <div className="mx-auto mt-10 max-w-5xl">

                <div className="mb-4 flex items-center justify-between">

                  <div>

                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                      Your health
                    </p>

                    <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-800">
                      Quick access
                    </h3>

                  </div>

                  <span className="text-[11px] text-slate-400">
                    Explore
                  </span>

                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

                  <Reveal delay={100}>
                    <FeatureCard
                      icon={<ShieldAlert size={21} />}
                      title="AI Health Risk"
                      subtitle="Smart insight"
                      value="28"
                      suffix="/100"
                      accent="emerald"
                      href="/health-risk"
                    />
                  </Reveal>

                  <Reveal delay={160}>
                    <FeatureCard
                      icon={<Pill size={21} />}
                      title="Medicine"
                      subtitle="Today's schedule"
                      value="1/3"
                      suffix="taken"
                      accent="blue"
                      href="/medicines"
                    />
                  </Reveal>

                  <Reveal delay={220}>
                    <FeatureCard
                      icon={<Activity size={21} />}
                      title="Daily Health"
                      subtitle="Performance"
                      value="+4.2"
                      suffix="%"
                      accent="purple"
                      href="/health"
                    />
                  </Reveal>

                  <Reveal delay={280}>
                    <FeatureCard
                      icon={<Droplets size={21} />}
                      title="Diabetes & Glucose"
                      subtitle="Glucose tracking"
                      value="102"
                      suffix=" mg/dL"
                      accent="green"
                      href="/diabetes"
                    />
                  </Reveal>

                  <Reveal delay={340}>
                    <FeatureCard
                      icon={<ShieldAlert size={21} />}
                      title="Emergency"
                      subtitle="Ready when needed"
                      value="Card"
                      suffix=""
                      accent="rose"
                      href="/emergency"
                    />
                  </Reveal>

                </div>

              </div>

            </Reveal>

          </section>

          {/* ================================================= */}
          {/* HEALTH SNAPSHOT */}
          {/* ================================================= */}

          <section className="border-y border-[#e6f0ec] bg-white/45 px-5 py-9 sm:px-8 lg:px-12">

            <Reveal>

              <div className="mx-auto max-w-5xl">

                <div className="mb-5 flex items-end justify-between">

                  <div>

                    <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-emerald-600">
                      Today's snapshot
                    </p>

                    <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-800">
                      Your health at a glance
                    </h3>

                  </div>

                  <Link
                    href="/health-risk"
                    className="hidden items-center gap-1 rounded-full border border-white bg-white/80 px-3 py-2 text-xs font-medium text-slate-400 shadow-sm transition hover:text-emerald-600 sm:flex"
                  >
                    View details
                    <ChevronRight size={15} />
                  </Link>

                </div>

                <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">

                  <Reveal delay={100}>

                    <Link
                      href="/health-risk"
                      className="group relative block h-full overflow-hidden rounded-[28px] border border-white/90 bg-gradient-to-br from-[#e5f6ef] via-[#edf9f5] to-[#f5fbf9] p-6 shadow-[0_18px_55px_rgba(20,100,75,0.07)] ring-1 ring-emerald-100/70 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_22px_65px_rgba(20,100,75,0.10)] sm:p-7"
                    >

                      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-200/30 blur-3xl" />

                      <div className="relative">

                        <div className="flex items-start justify-between">

                          <div>

                            <div className="flex items-center gap-2">

                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white bg-white/80 text-emerald-600 shadow-sm">
                                <HeartPulse size={18} />
                              </div>

                              <div>

                                <span className="block text-sm font-semibold text-slate-600">
                                  AI Health Risk
                                </span>

                                <span className="text-[10px] text-slate-400">
                                  Latest analysis
                                </span>

                              </div>

                            </div>

                            <div className="mt-6 flex items-end gap-2">

                              <span className="text-6xl font-semibold tracking-[-0.07em] text-slate-800">
                                28
                              </span>

                              <span className="mb-2 text-sm text-slate-400">
                                / 100
                              </span>

                            </div>

                            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1.5 shadow-sm">

                              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_7px_rgba(16,185,129,0.5)]" />

                              <span className="text-xs font-semibold text-emerald-700">
                                Low risk
                              </span>

                            </div>

                          </div>

                          <div className="hidden h-24 w-24 items-center justify-center rounded-full border-[8px] border-emerald-200/70 bg-white/30 sm:flex">

                            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white bg-white shadow-sm">

                              <span className="text-xs font-bold text-emerald-700">
                                28%
                              </span>

                            </div>

                          </div>

                        </div>

                        <div className="mt-7">

                          <div className="mb-2 flex justify-between text-[10px] font-medium text-slate-400">

                            <span>
                              Current risk level
                            </span>

                            <span>
                              Stable
                            </span>

                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-white/80 shadow-inner">

                            <div className="h-full w-[28%] rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.25)]" />

                          </div>

                        </div>

                        <div className="mt-6 flex items-center justify-between">

                          <span className="text-sm font-semibold text-emerald-700">
                            Why did my score change?
                          </span>

                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-emerald-600 shadow-sm transition group-hover:translate-x-1">
                            <ArrowRight size={15} />
                          </div>

                        </div>

                      </div>

                    </Link>

                  </Reveal>

                  <div className="grid grid-cols-2 gap-4">

                    <Reveal delay={150}>
                      <MetricCard
                        icon={<HeartPulse size={18} />}
                        label="Blood Pressure"
                        value="118/76"
                        unit="mmHg"
                        trend="Normal"
                      />
                    </Reveal>

                    <Reveal delay={200}>
                      <MetricCard
                        icon={<Activity size={18} />}
                        label="Heart Rate"
                        value="72"
                        unit="BPM"
                        trend="Normal"
                      />
                    </Reveal>

                    <Reveal delay={250}>
                      <MetricCard
                        icon={<Droplets size={18} />}
                        label="Water"
                        value="1.8"
                        unit="/ 2.5 L"
                        trend="72%"
                      />
                    </Reveal>

                    <Reveal delay={300}>
                      <MetricCard
                        icon={<TrendingUpIcon />}
                        label="Activity"
                        value="6,420"
                        unit="steps"
                        trend="+8%"
                      />
                    </Reveal>

                  </div>

                </div>

              </div>

            </Reveal>

          </section>

          {/* ================================================= */}
          {/* STAY ON TRACK */}
          {/* ================================================= */}

          <section className="px-5 pb-10 pt-9 sm:px-8 lg:px-12">

            <div className="mx-auto max-w-5xl">

              <Reveal>

                <div className="mb-5">

                  <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-emerald-600">
                    Your care
                  </p>

                  <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-800">
                    Stay on track
                  </h3>

                </div>

              </Reveal>

              <div className="grid gap-4 md:grid-cols-3">

                {/* AI INSIGHT */}

                <Reveal delay={100}>

                  <Link
                    href="/health-risk"
                    className="group block rounded-[26px] border border-white/90 bg-white/95 p-5 shadow-[0_10px_40px_rgba(20,50,45,0.045)] ring-1 ring-[#e8f1ee] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(20,50,45,0.08)]"
                  >

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <Sparkles size={18} />
                      </div>

                      <div>

                        <p className="text-sm font-semibold text-slate-800">
                          AI Insight
                        </p>

                        <p className="text-[10px] text-slate-400">
                          Just for you
                        </p>

                      </div>

                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-500">
                      Your activity is improving this week. Keeping your sleep
                      consistent could help maintain your current risk level.
                    </p>

                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600">

                      View insight

                      <ArrowRight
                        size={14}
                        className="transition group-hover:translate-x-1"
                      />

                    </div>

                  </Link>

                </Reveal>

                {/* APPOINTMENT */}

                <Reveal delay={180}>

                  <Link
                    href="/appointments"
                    className="group block rounded-[26px] border border-white/90 bg-white/95 p-5 shadow-[0_10px_40px_rgba(20,50,45,0.045)] ring-1 ring-[#e8f1ee] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(20,50,45,0.08)]"
                  >

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <CalendarDays size={18} />
                      </div>

                      <div className="flex-1">

                        <p className="text-sm font-semibold text-slate-800">
                          Next appointment
                        </p>

                        <p className="text-[10px] text-slate-400">
                          Upcoming
                        </p>

                      </div>

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                        <ChevronRight size={15} />
                      </div>

                    </div>

                    <div className="mt-5 flex items-center justify-between">

                      <div>

                        <p className="text-sm font-semibold text-slate-800">
                          Dr. Ananya Sharma
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          General Physician
                        </p>

                      </div>

                      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-3 py-2 text-center">

                        <p className="text-[9px] font-semibold text-blue-500">
                          SEP
                        </p>

                        <p className="text-lg font-bold text-slate-800">
                          18
                        </p>

                      </div>

                    </div>

                  </Link>

                </Reveal>

                {/* REPORTS */}

                <Reveal delay={260}>

                  <Link
                    href="/reports"
                    className="group block rounded-[26px] border border-white/90 bg-white/95 p-5 shadow-[0_10px_40px_rgba(20,50,45,0.045)] ring-1 ring-[#e8f1ee] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(20,50,45,0.08)]"
                  >

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <FileText size={18} />
                      </div>

                      <div className="flex-1">

                        <p className="text-sm font-semibold text-slate-800">
                          Health Reports
                        </p>

                        <p className="text-[10px] text-slate-400">
                          Medical records & reports
                        </p>

                      </div>

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition group-hover:bg-emerald-50 group-hover:text-emerald-600">
                        <ChevronRight size={15} />
                      </div>

                    </div>

                    <div className="mt-5 flex items-center justify-between">

                      <div>

                        <p className="text-sm font-semibold text-slate-800">
                          3 Reports
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          Latest: HbA1c Report
                        </p>

                      </div>

                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-center">

                        <p className="text-[9px] font-semibold text-emerald-600">
                          LATEST
                        </p>

                        <p className="text-sm font-bold text-slate-800">
                          13 Sep
                        </p>

                      </div>

                    </div>

                  </Link>

                </Reveal>

              </div>

              {/* EMERGENCY */}

              <Reveal delay={340}>

                <Link
                  href="/emergency"
                  className="group mt-4 flex items-center justify-between rounded-[26px] border border-red-100/70 bg-gradient-to-r from-[#fff6f5] via-[#fffafa] to-white p-5 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(220,38,38,0.07)]"
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm">
                      <ShieldAlert size={19} />
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-slate-800">
                        Emergency Health Card
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Your critical information, available instantly.
                      </p>

                    </div>

                  </div>

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-red-300 shadow-sm transition group-hover:translate-x-1 group-hover:text-red-500">
                    <ArrowRight size={16} />
                  </div>

                </Link>

              </Reveal>

            </div>

          </section>

        </div>

      </div>

      {/* ================================================= */}
      {/* FIXED MOBILE NAVIGATION */}
      {/* ================================================= */}

      <nav className="fixed bottom-0 left-0 right-0 z-[70] border-t border-white/80 bg-white/95 px-4 py-2.5 shadow-[0_-10px_35px_rgba(20,70,60,0.08)] backdrop-blur-2xl sm:hidden">

        <div className="mx-auto flex max-w-md items-center justify-around">

          <BottomNavItem
            icon={<Home size={20} />}
            label="Home"
            active
          />

          <BottomNavItem
            icon={<Activity size={20} />}
            label="Health"
            href="/health"
          />

          {/* AI BUTTON */}

          <button
            type="button"
            onClick={() => setChatOpen(true)}
            aria-label="Open SumanCare AI"
            className="group flex flex-col items-center gap-1 text-[10px] font-semibold text-emerald-600"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-[0_6px_18px_rgba(16,185,129,0.25)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_8px_25px_rgba(16,185,129,0.35)] group-active:scale-95">

              <MessageCircle size={20} />

            </div>

            <span>
              AI
            </span>

          </button>

          <BottomNavItem
            icon={<Pill size={20} />}
            label="Medicine"
            href="/medicines"
          />

          <BottomNavItem
            icon={<UserRound size={20} />}
            label="Profile"
            href="/profile"
          />

        </div>

      </nav>

      {/* ================================================= */}
      {/* AI CHAT MODAL */}
      {/* ================================================= */}

      {chatOpen && (

        <div className="fixed inset-0 z-[100]">

          {/* BACKDROP */}

          <button
            type="button"
            aria-label="Close SumanCare AI"
            onClick={() => setChatOpen(false)}
            className="absolute inset-0 cursor-default bg-slate-900/20 backdrop-blur-[3px]"
          />

          {/* CHAT WINDOW */}

          <div className="chat-window absolute bottom-4 left-4 right-4 mx-auto flex h-[min(680px,calc(100vh-32px))] max-w-[430px] flex-col overflow-hidden rounded-[30px] border border-white/80 bg-white/95 shadow-[0_30px_100px_rgba(10,50,40,0.20)] backdrop-blur-2xl sm:bottom-6 sm:left-auto sm:right-6">

            {/* CHAT HEADER */}

            <div className="relative border-b border-slate-100 bg-gradient-to-br from-[#e8f8f2] via-white to-[#f6fbf9] px-5 py-4">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 text-white shadow-[0_8px_25px_rgba(16,185,129,0.25)]">

                    <Bot size={21} />

                    <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />

                  </div>

                  <div>

                    <p className="text-sm font-semibold text-slate-800">
                      SumanCare AI
                    </p>

                    <div className="mt-0.5 flex items-center gap-1.5">

                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                      <span className="text-[10px] text-slate-400">
                        Health assistant
                      </span>

                    </div>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() => setChatOpen(false)}
                  aria-label="Close chat"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition hover:text-slate-700"
                >
                  <X size={18} />
                </button>

              </div>

              <p className="mt-4 text-[11px] leading-5 text-slate-400">
                Ask about your health data, daily habits, medicines, or health
                trends.
              </p>

            </div>

            {/* CHAT MESSAGES */}

            <div className="flex-1 space-y-4 overflow-y-auto bg-[#fbfdfc] px-4 py-5">

              {messages.map((message, index) => (

                <div
                  key={index}
                  className={`flex ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-[82%] rounded-[20px] px-4 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "rounded-br-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_6px_20px_rgba(16,185,129,0.18)]"
                        : "rounded-bl-md border border-slate-100 bg-white text-slate-600 shadow-[0_5px_20px_rgba(20,50,45,0.04)]"
                    }`}
                  >
                    {message.text}
                  </div>

                </div>

              ))}

            </div>

            {/* SUGGESTED QUESTIONS */}

            {messages.length === 1 && (

              <div className="border-t border-slate-100 bg-white px-4 py-3">

                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Try asking
                </p>

                <div className="flex gap-2 overflow-x-auto pb-1">

                  {[
                    "How is my health today?",
                    "Why is my risk score 28?",
                    "What should I improve?",
                  ].map((question) => (

                    <button
                      key={question}
                      type="button"
                      onClick={() => handleSend(question)}
                      className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-[10px] font-medium text-emerald-700 transition hover:bg-emerald-100"
                    >
                      {question}
                    </button>

                  ))}

                </div>

              </div>

            )}

            {/* CHAT INPUT */}

            <form
              onSubmit={(e) => {
                e.preventDefault();

                if (input.trim()) {
                  handleSend(input);
                }
              }}
              className="border-t border-slate-100 bg-white p-3"
            >

              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-emerald-300 focus-within:bg-white">

                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask SumanCare AI..."
                  className="min-w-0 flex-1 bg-transparent px-1 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />

                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Send message"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send size={16} />
                </button>

              </div>

              <p className="mt-2 text-center text-[9px] text-slate-400">
                SumanCare AI provides health insights, not medical diagnosis.
              </p>

            </form>

          </div>

        </div>

      )}

      {/* ================================================= */}
      {/* ANIMATION STYLES */}
      {/* ================================================= */}

      <style jsx global>{`

        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(28px);

          transition:
            opacity 800ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 800ms cubic-bezier(0.22, 1, 0.36, 1);

          transition-delay: var(--delay, 0ms);
        }

        .reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .ai-orb {
          animation: premiumFloat 5s ease-in-out infinite;
          will-change: transform;
        }

        @keyframes premiumFloat {

          0%,
          100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-8px);
          }

        }

        .chat-window {
          animation: chatAppear 350ms cubic-bezier(0.22, 1, 0.36, 1);
          transform-origin: bottom right;
        }

        @keyframes chatAppear {

          from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }

        }

        @media (prefers-reduced-motion: reduce) {

          .reveal-on-scroll {
            opacity: 1;
            transform: none;
            transition: none;
          }

          .ai-orb {
            animation: none;
          }

          .chat-window {
            animation: none;
          }

        }

      `}</style>

    </main>
  );
}

/* ================================================= */
/* REVEAL COMPONENT */
/* ================================================= */

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={`reveal-on-scroll ${className}`}
      style={
        {
          "--delay": `${delay}ms`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

/* ================================================= */
/* FEATURE CARD */
/* ================================================= */

function FeatureCard({
  icon,
  title,
  subtitle,
  value,
  suffix,
  accent,
  href,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  value: string;
  suffix: string;
  accent: "emerald" | "blue" | "purple" | "rose" | "green";
  href?: string;
}) {
  const styles = {
    emerald: "bg-[#edf9f5] text-emerald-600 border-emerald-100",
    blue: "bg-[#eff7ff] text-blue-600 border-blue-100",
    purple: "bg-[#f6f1ff] text-purple-600 border-purple-100",
    rose: "bg-[#fff2f1] text-rose-500 border-rose-100",
    green: "bg-[#edf9f5] text-emerald-600 border-emerald-100",
  };

  const cardClass =
    "group block rounded-[26px] border border-white/90 bg-gradient-to-br from-white via-white to-[#f8fcfa] p-5 text-left shadow-[0_10px_35px_rgba(20,55,48,0.045),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-[#e8f1ee]/80 transition-all duration-500 hover:-translate-y-1 hover:border-emerald-100 hover:shadow-[0_18px_50px_rgba(20,70,60,0.09)]";

  const content = (
    <>
      <div className="flex items-start justify-between">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${styles[accent]}`}
        >
          {icon}
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-300 transition-all duration-300 group-hover:bg-white group-hover:text-slate-500 group-hover:shadow-sm">
          <ChevronRight size={15} />
        </div>

      </div>

      <p className="mt-5 text-sm font-semibold text-slate-700">
        {title}
      </p>

      <p className="mt-1 text-[10px] text-slate-400">
        {subtitle}
      </p>

      <div className="mt-4">

        <span className="text-2xl font-semibold tracking-tight text-slate-800">
          {value}
        </span>

        {suffix && (
          <span className="ml-1 text-[10px] font-medium text-slate-400">
            {suffix}
          </span>
        )}

      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cardClass}>
        {content}
      </Link>
    );
  }

  return (
    <div className={cardClass}>
      {content}
    </div>
  );
}

/* ================================================= */
/* METRIC CARD */
/* ================================================= */

function MetricCard({
  icon,
  label,
  value,
  unit,
  trend,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  unit: string;
  trend: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/90 bg-gradient-to-br from-white to-[#f9fcfb] p-4 shadow-[0_10px_35px_rgba(20,50,45,0.045)] ring-1 ring-[#e8f1ee] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(20,60,50,0.07)]">

      <div className="flex items-center justify-between">

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
          {icon}
        </div>

        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600">
          {trend}
        </span>

      </div>

      <p className="mt-4 text-[10px] font-medium text-slate-400">
        {label}
      </p>

      <div className="mt-1">

        <span className="text-xl font-semibold text-slate-800">
          {value}
        </span>

        <span className="ml-1 text-[10px] text-slate-400">
          {unit}
        </span>

      </div>

    </div>
  );
}

/* ================================================= */
/* TRENDING UP ICON */
/* ================================================= */

function TrendingUpIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 17 9 11 13 15 21 7" />
      <polyline points="14 7 21 7 21 14" />
    </svg>
  );
}

/* ================================================= */
/* BOTTOM NAV ITEM */
/* ================================================= */

function BottomNavItem({
  icon,
  label,
  active = false,
  href,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  center?: boolean;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex h-9 w-9 items-center justify-center rounded-full">
        {icon}
      </div>

      <span>{label}</span>
    </>
  );

  const className = `flex flex-col items-center gap-1 text-[10px] transition-colors ${
    active
      ? "font-semibold text-emerald-600"
      : "text-slate-400 hover:text-slate-600"
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className}>
      {content}
    </button>
  );
}