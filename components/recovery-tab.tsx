"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Watch,
  Moon,
  Brain,
  HeartPulse,
  Droplets,
  Flame,
  ShieldAlert,
  ShieldCheck,
  Dumbbell,
  Activity,
  Loader2,
  Scale,
  User,
  Lightbulb,
  LineChart as LineChartIcon,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

// ---------------------------------------------------------------------------
// Types mapping to the Unified Global Profile
// ---------------------------------------------------------------------------
export interface RecoveryTabProps {
  vitals: {
    // Biometrics
    age: number;
    bmi: number;
    restingHeartRate: number;
    // Lifestyle & Training
    trainingIntensity: number;
    sleepHours: number;
    hydrationLiters: number;
    stressLevel: number;
    dailySteps: number;
    // (Other properties exist in global state but aren't needed here)
  };
  onVitalsChange: (vitals: any) => void;
}

// ---------------------------------------------------------------------------
// Chart Helpers
// ---------------------------------------------------------------------------
function generateInjuryHistory(currentProb: number, status: string) {
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  let trend = 0;

  if (status === "High Risk of Injury") trend = -12;
  else if (status === "Elevated Risk (Caution)") trend = -5;
  else trend = 0;

  return months.map((month, index) => {
    const noise = Math.random() * 8 - 4;
    const historicalProb = currentProb + trend * (5 - index) + noise;
    return {
      month,
      probability: Math.max(2, Math.min(99, Math.round(historicalProb))),
    };
  });
}

function calculateInjuryDrivers(vitals: RecoveryTabProps["vitals"]) {
  const drivers = [];

  if (vitals.sleepHours < 6)
    drivers.push({
      name: "Sleep Deficit",
      value: (7 - vitals.sleepHours) * 15,
      color: "#f97316",
    });
  if (vitals.stressLevel > 6)
    drivers.push({
      name: "Systemic Stress",
      value: (vitals.stressLevel - 5) * 12,
      color: "#ef4444",
    });
  if (vitals.trainingIntensity > 7)
    drivers.push({
      name: "High CNS Load",
      value: (vitals.trainingIntensity - 7) * 10,
      color: "#eab308",
    });
  if (vitals.hydrationLiters < 2.0)
    drivers.push({
      name: "Dehydration",
      value: (2.5 - vitals.hydrationLiters) * 20,
      color: "#3b82f6",
    });
  if (vitals.restingHeartRate > 75)
    drivers.push({
      name: "Elevated RHR",
      value: (vitals.restingHeartRate - 70) * 1.5,
      color: "#d946ef",
    });

  drivers.sort((a, b) => b.value - a.value);

  if (drivers.length === 0 || drivers[0].value < 5) {
    return [{ name: "Optimal Readiness", value: 100, color: "#22c55e" }];
  }
  return drivers.slice(0, 4);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function RecoveryTab({ vitals, onVitalsChange }: RecoveryTabProps) {
  const [apiResult, setApiResult] = useState<{
    status: string;
    injury_risk?: string;
    injury_probability?: number;
    actionable_insights?: string[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchRecovery = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000" 
        const response = await fetch(`${apiUrl}/predict/recovery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            age: vitals.age,
            bmi: vitals.bmi,
            sleep_hours: vitals.sleepHours,
            stress_level: vitals.stressLevel,
            hydration_liters: vitals.hydrationLiters,
            daily_steps: vitals.dailySteps,
            training_intensity: vitals.trainingIntensity,
            heart_rate: vitals.restingHeartRate,
          }),
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const result = await response.json();
        if (!cancelled) setApiResult(result);
      } catch (err) {
        if (!cancelled) setError("Could not reach the prediction server.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchRecovery, 500);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [vitals]);

  const injuryStatus = apiResult?.injury_risk || "Analyzing...";
  const injuryProb = apiResult?.injury_probability ?? 0;
  const insights = apiResult?.actionable_insights || [];
  const hasResult = apiResult !== null;

  const isSafe = injuryStatus === "Safe to Train";
  const isWarning = injuryStatus === "Elevated Risk (Caution)";
  const isDanger = injuryStatus === "High Risk of Injury";

  // Memoized Chart Data
  const historyData = useMemo(
    () => generateInjuryHistory(injuryProb, injuryStatus),
    [injuryProb, injuryStatus],
  );
  const riskDrivers = useMemo(() => calculateInjuryDrivers(vitals), [vitals]);

  // SVG Gauge Calculations
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (injuryProb / 100) * circumference;
  const gaugeColorClass = isSafe
    ? "stroke-green-500 text-green-600"
    : isWarning
      ? "stroke-yellow-500 text-yellow-600"
      : "stroke-red-500 text-red-600";
  const cardColorClass = isSafe
    ? "border-green-200 bg-green-50/30"
    : isWarning
      ? "border-yellow-300 bg-yellow-50/30"
      : "border-red-300 bg-red-50/30";

  // Slider Configurations
  const biometricSliders = [
    {
      key: "age" as const,
      label: "Age",
      icon: User,
      min: 18,
      max: 90,
      unit: "yrs",
      step: 1,
    },
    {
      key: "bmi" as const,
      label: "BMI",
      icon: Scale,
      min: 15,
      max: 40,
      unit: "kg/m²",
      step: 0.5,
    },
    {
      key: "restingHeartRate" as const,
      label: "Resting Heart Rate",
      icon: HeartPulse,
      min: 40,
      max: 100,
      unit: "bpm",
      step: 1,
    },
  ];

  const trainingSliders = [
    {
      key: "trainingIntensity" as const,
      label: "Planned Intensity",
      icon: Flame,
      min: 1,
      max: 10,
      unit: "/ 10",
      step: 1,
    },
    {
      key: "sleepHours" as const,
      label: "Sleep Duration",
      icon: Moon,
      min: 3,
      max: 12,
      unit: "hrs",
      step: 0.5,
    },
    {
      key: "hydrationLiters" as const,
      label: "Daily Hydration",
      icon: Droplets,
      min: 0.5,
      max: 5.0,
      unit: "L",
      step: 0.1,
    },
    {
      key: "stressLevel" as const,
      label: "Systemic Stress",
      icon: Brain,
      min: 1,
      max: 10,
      unit: "/ 10",
      step: 1,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* ── LEFT COLUMN: Inputs (5 cols) ── */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Card 1: Biometrics & Wearable Data */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Watch className="h-4 w-4 text-blue-600" /> Biometrics & Wearables
            </CardTitle>
            <CardDescription className="text-xs">
              Baseline stats & morning readiness data
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5">
            {biometricSliders.map(
              ({ key, label, icon: Icon, min, max, unit, step }) => (
                <div key={key} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <label className="font-medium flex items-center gap-2 text-slate-700">
                      <Icon className="h-4 w-4 text-slate-400" /> {label}
                    </label>
                    <span className="text-blue-600 font-bold">
                      {vitals[key] % 1 !== 0
                        ? vitals[key].toFixed(1)
                        : vitals[key]}{" "}
                      <span className="text-slate-400 font-normal">{unit}</span>
                    </span>
                  </div>
                  <Slider
                    min={min}
                    max={max}
                    step={step}
                    value={[vitals[key]]}
                    onValueChange={([val]) =>
                      onVitalsChange({ ...vitals, [key]: val })
                    }
                  />
                </div>
              ),
            )}
          </CardContent>
        </Card>

        {/* Card 2: Lifestyle & Training */}
        <Card className="h-fit border-indigo-100 bg-indigo-50/30">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base text-indigo-900">
              <Activity className="h-4 w-4 text-indigo-600" /> Lifestyle &
              Training
            </CardTitle>
            <CardDescription className="text-xs text-indigo-700/70">
              Adjust behavior to test injury thresholds
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5">
            {trainingSliders.map(
              ({ key, label, icon: Icon, min, max, unit, step }) => (
                <div key={key} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <label className="font-medium flex items-center gap-2 text-indigo-900">
                      <Icon className="h-4 w-4 text-indigo-400" /> {label}
                    </label>
                    <span className="text-indigo-600 font-bold">
                      {vitals[key] % 1 !== 0
                        ? vitals[key].toFixed(1)
                        : vitals[key]}{" "}
                      <span className="text-indigo-400 font-normal">
                        {unit}
                      </span>
                    </span>
                  </div>
                  <Slider
                    min={min}
                    max={max}
                    step={step}
                    value={[vitals[key]]}
                    onValueChange={([val]) =>
                      onVitalsChange({ ...vitals, [key]: val })
                    }
                  />
                </div>
              ),
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── RIGHT COLUMN: Outputs (7 cols) ── */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Top Row: Gauge & Assessment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Injury Probability Gauge */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-card-foreground text-sm uppercase tracking-wider text-slate-500">
                <Activity className="h-4 w-4 text-blue-600" /> Injury
                Probability
                {isLoading && (
                  <Loader2 className="ml-auto h-4 w-4 animate-spin text-slate-400" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-4">
              <div className="relative">
                <svg
                  width="180"
                  height="180"
                  viewBox="0 0 200 200"
                  className="-rotate-90"
                >
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="none"
                    strokeWidth="14"
                    className="stroke-slate-100"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="none"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className={`transition-all duration-700 ease-out ${gaugeColorClass.split(" ")[0]}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold font-mono text-card-foreground">
                    {hasResult ? `${Math.round(injuryProb)}%` : "--"}
                  </span>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider mt-1 ${gaugeColorClass.split(" ")[1]}`}
                  >
                    {hasResult ? "RISK SCORE" : "Analyzing…"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Alert Card */}
          <Card
            className={`border-2 transition-colors duration-500 flex flex-col ${cardColorClass}`}
          >
            <CardContent className="flex flex-col gap-4 py-4 px-6 flex-1 justify-center relative">
              {error && (
                <p className="text-red-500 text-sm absolute top-4 left-4">
                  {error}
                </p>
              )}
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  {!hasResult ? (
                    <Loader2 className="h-7 w-7 text-slate-400 animate-spin" />
                  ) : isSafe ? (
                    <ShieldCheck className="h-7 w-7 text-green-600" />
                  ) : isWarning ? (
                    <ShieldAlert className="h-7 w-7 text-yellow-600" />
                  ) : (
                    <ShieldAlert className="h-7 w-7 text-red-600" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-slate-600">
                    AI Assessment
                  </span>
                  <span
                    className={`text-xl font-bold transition-colors duration-500 ${isSafe ? "text-green-700" : isWarning ? "text-yellow-700" : "text-red-700"}`}
                  >
                    {injuryStatus}
                  </span>
                </div>
              </div>
              <p className="text-slate-700 font-medium text-sm leading-relaxed mt-2 bg-white/60 p-3 rounded border border-slate-100">
                {isSafe && "Recovery and planned intensity are balanced."}
                {isWarning &&
                  "Intensity is pushing current recovery limits. Early warning signs detected."}
                {isDanger &&
                  "Critical mismatch. High probability of acute/overuse injury based on current fatigue profile."}
                {!hasResult && "Adjust wearable metrics to calculate risk."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actionable Insights List */}
        <Card className="bg-slate-900 border-none text-white">
          <CardHeader className="pb-3 pt-5">
            <CardTitle className="text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" /> Engine Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.length > 0 ? (
              <ul className="space-y-3">
                {insights.map((insight, i) => (
                  <li
                    key={i}
                    className="text-sm leading-relaxed text-slate-200 flex items-start gap-3"
                  >
                    <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    {insight}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">
                Adjust clinical or lifestyle sliders to generate insights.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <LineChartIcon className="h-4 w-4" /> 6-Month Risk Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: any) => [
                      `${value}%`,
                      "Injury Probability",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="probability"
                    stroke={
                      isSafe ? "#22c55e" : isDanger ? "#dc2626" : "#eab308"
                    }
                    strokeWidth={3}
                    dot={{ strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Fatigue Drivers (XAI)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={riskDrivers}
                  layout="vertical"
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#475569" }}
                    width={110}
                  />
                  <Tooltip
                    cursor={{ fill: "#f1f5f9" }}
                    contentStyle={{ borderRadius: "8px" }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {riskDrivers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
