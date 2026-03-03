"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
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
  Sparkles,
  Loader2,
  Scale,
  User,
  Activity,
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
// Types
// ---------------------------------------------------------------------------
export interface RecoveryData {
  age?: number;
  bmi?: number;
  sleepQuality?: number;
  stressLevel?: number;
  restingHeartRate?: number;
  hydrationLevel?: number;
  trainingIntensity?: number;
}

interface ApiResult {
  status: string;
  ai_recovery_score: number;
  injury_risk: string;
  injury_probability?: number;
}

interface RecoveryTabProps {
  data: RecoveryData;
  onDataChange: (data: RecoveryData) => void;
}

// ---------------------------------------------------------------------------
// Chart Helpers
// ---------------------------------------------------------------------------
function generateInjuryHistory(currentProb: number, status: string) {
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  let trend = 0;

  if (status === "High Risk of Injury")
    trend = -12; // Risk has been climbing
  else if (status === "Elevated Risk (Caution)") trend = -5;
  else trend = 0; // Flat/Safe

  return months.map((month, index) => {
    const noise = Math.random() * 8 - 4;
    const historicalProb = currentProb + trend * (5 - index) + noise;
    return {
      month,
      probability: Math.max(2, Math.min(99, Math.round(historicalProb))),
    };
  });
}

function calculateInjuryDrivers(data: RecoveryData) {
  const drivers = [];
  const sleep = data.sleepQuality ?? 7;
  const stress = data.stressLevel ?? 5;
  const intensity = data.trainingIntensity ?? 5;
  const hydration = data.hydrationLevel ?? 70;

  // Calculate deviation from optimal recovery states
  if (sleep < 7)
    drivers.push({
      name: "Sleep Deficit",
      value: (7 - sleep) * 15,
      color: "#f97316",
    });
  if (stress > 5)
    drivers.push({
      name: "Systemic Stress",
      value: (stress - 5) * 12,
      color: "#ef4444",
    });
  if (intensity > 7)
    drivers.push({
      name: "High CNS Load",
      value: (intensity - 7) * 10,
      color: "#eab308",
    });
  if (hydration < 60)
    drivers.push({
      name: "Dehydration",
      value: (60 - hydration) * 0.8,
      color: "#3b82f6",
    });

  drivers.sort((a, b) => b.value - a.value);

  if (drivers.length === 0 || drivers[0].value < 5) {
    return [{ name: "Optimal Readiness", value: 100, color: "#22c55e" }];
  }

  return drivers.slice(0, 4);
}

// ---------------------------------------------------------------------------
// Logic Helpers
// ---------------------------------------------------------------------------
function getRecoveryColor(score: number) {
  if (score >= 70) return "clinical-safe";
  if (score >= 40) return "clinical-warning";
  return "clinical-danger";
}

function getRecoveryLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  if (score >= 30) return "Poor";
  return "Critical";
}

function getCoachRecommendations(
  data: RecoveryData,
  recoveryScore: number,
  injuryRiskStatus: string,
): string[] {
  const recs: string[] = [];

  if ((data.sleepQuality || 0) <= 4)
    recs.push(
      "Your sleep quality is critically low. Prioritize 8+ hours of sleep tonight.",
    );
  else if ((data.sleepQuality || 0) <= 6)
    recs.push(
      "Sleep quality is below optimal. Try implementing a consistent sleep schedule.",
    );
  if ((data.stressLevel || 0) >= 8)
    recs.push(
      "Stress levels are very high. Consider reducing training volume by 30% today.",
    );
  if ((data.restingHeartRate || 0) > 80)
    recs.push(
      "Resting heart rate is elevated. Consider an active recovery day instead of high-intensity work.",
    );
  if ((data.hydrationLevel || 0) < 40)
    recs.push(
      "Hydration is critically low. Drink at least 500ml of water with electrolytes immediately.",
    );
  if ((data.trainingIntensity || 0) >= 9 && recoveryScore < 60)
    recs.push(
      "Training intensity is very high relative to your recovery state. Scale back to 60–70% effort today.",
    );

  if (injuryRiskStatus === "High Risk of Injury")
    recs.push(
      "⚠️ High Injury Risk Detected. Focus on technique-based drills at low intensity. Avoid heavy loads.",
    );
  else if (injuryRiskStatus === "Elevated Risk (Caution)")
    recs.push(
      "⚠️ Elevated Injury Risk. Warm up thoroughly and cap your training intensity at a moderate level.",
    );
  else if (recoveryScore >= 80)
    recs.push(
      "Recovery score is excellent. You are cleared for high-intensity training!",
    );

  if (recs.length === 0)
    recs.push(
      "All metrics are within healthy ranges. Listen to your body and adjust as needed.",
    );

  return recs;
}

const sliderConfigs = [
  {
    key: "age" as const,
    label: "Age",
    icon: User,
    min: 18,
    max: 90,
    step: 1,
    unit: "yrs",
    description: "Athlete's current age",
    format: (v: number) => `${v}`,
  },
  {
    key: "bmi" as const,
    label: "BMI",
    icon: Scale,
    min: 15,
    max: 40,
    step: 0.5,
    unit: "kg/m²",
    description: "Body Mass Index",
    format: (v: number) => `${v}`,
  },
  {
    key: "sleepQuality" as const,
    label: "Sleep Quality",
    icon: Moon,
    min: 1,
    max: 10,
    step: 1,
    unit: "/ 10",
    description: "Rate your sleep quality from last night",
    format: (v: number) => `${v}`,
  },
  {
    key: "stressLevel" as const,
    label: "Stress Level",
    icon: Brain,
    min: 1,
    max: 10,
    step: 1,
    unit: "/ 10",
    description: "Current perceived stress level",
    format: (v: number) => `${v}`,
  },
  {
    key: "restingHeartRate" as const,
    label: "Resting Heart Rate",
    icon: HeartPulse,
    min: 40,
    max: 100,
    step: 1,
    unit: "bpm",
    description: "Measured upon waking",
    format: (v: number) => `${v}`,
  },
  {
    key: "hydrationLevel" as const,
    label: "Hydration Level",
    icon: Droplets,
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
    description: "Estimated daily hydration status",
    format: (v: number) => `${v}`,
  },
  {
    key: "trainingIntensity" as const,
    label: "Training Intensity",
    icon: Flame,
    min: 1,
    max: 10,
    step: 1,
    unit: "/ 10",
    description: "Planned workout intensity",
    format: (v: number) => `${v}`,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function RecoveryTab({ data, onDataChange }: RecoveryTabProps) {
  const [apiResult, setApiResult] = useState<ApiResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const age = data.age ?? 25;
  const bmi = data.bmi ?? 22.0;
  const sleepQuality = data.sleepQuality ?? 7;
  const stressLevel = data.stressLevel ?? 5;
  const restingHeartRate = data.restingHeartRate ?? 60;
  const hydrationLevel = data.hydrationLevel ?? 70;
  const trainingIntensity = data.trainingIntensity ?? 5;

  useEffect(() => {
    let cancelled = false;
    const fetchRecovery = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/predict/recovery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            age,
            bmi,
            sleep_quality: sleepQuality,
            stress_level: stressLevel,
            training_intensity: trainingIntensity,
          }),
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const result: ApiResult = await response.json();
        if (!cancelled) setApiResult(result);
      } catch (error) {
        if (!cancelled) {
          setFetchError(
            "Could not reach the prediction server. Check your Python terminal.",
          );
          console.error("Failed to fetch recovery data:", error);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchRecovery, 500);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [age, bmi, sleepQuality, stressLevel, trainingIntensity]);

  const recoveryScore = apiResult?.ai_recovery_score ?? 0;
  const injuryStatus = apiResult?.injury_risk ?? null;
  const injuryProb = apiResult?.injury_probability ?? 0;
  const hasResult = apiResult !== null;

  const isSafe = injuryStatus === "Safe to Train";
  const isWarning = injuryStatus === "Elevated Risk (Caution)";
  const isDanger = injuryStatus === "High Risk of Injury";

  const recoveryColor = getRecoveryColor(recoveryScore);
  const recoveryLabel = getRecoveryLabel(recoveryScore);

  // Memoized Chart Data
  const historyData = useMemo(
    () => generateInjuryHistory(injuryProb, injuryStatus ?? "Safe to Train"),
    [injuryProb, injuryStatus],
  );
  const riskDrivers = useMemo(
    () =>
      calculateInjuryDrivers({
        ...data,
        sleepQuality,
        stressLevel,
        trainingIntensity,
        hydrationLevel,
      }),
    [data, sleepQuality, stressLevel, trainingIntensity, hydrationLevel],
  );

  const recommendations = useMemo(
    () =>
      getCoachRecommendations(
        {
          ...data,
          age,
          bmi,
          sleepQuality,
          stressLevel,
          restingHeartRate,
          hydrationLevel,
          trainingIntensity,
        },
        recoveryScore,
        injuryStatus ?? "",
      ),
    [
      data,
      age,
      bmi,
      sleepQuality,
      stressLevel,
      restingHeartRate,
      hydrationLevel,
      trainingIntensity,
      recoveryScore,
      injuryStatus,
    ],
  );

  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset =
    circumference - (recoveryScore / 100) * circumference;
  const colorClass =
    {
      "clinical-safe": "stroke-clinical-safe text-clinical-safe",
      "clinical-warning": "stroke-clinical-warning text-clinical-warning",
      "clinical-danger": "stroke-clinical-danger text-clinical-danger",
    }[recoveryColor] || "stroke-muted text-muted-foreground";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* ── Left: inputs (5 columns) ── */}
      <Card className="lg:col-span-5 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Watch className="h-5 w-5 text-blue-600" />
            Daily Wearable Sync
          </CardTitle>
          <CardDescription>
            Sync your wearable device metrics for AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {sliderConfigs.map(
            ({
              key,
              label,
              icon: Icon,
              min,
              max,
              step,
              unit,
              description,
              format,
            }) => {
              const value =
                data[key as keyof RecoveryData] ??
                {
                  age,
                  bmi,
                  sleepQuality,
                  stressLevel,
                  restingHeartRate,
                  hydrationLevel,
                  trainingIntensity,
                }[key];
              return (
                <div key={key} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <label className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                        <Icon className="h-4 w-4 text-slate-500" />
                        {label}
                      </label>
                      <span className="text-xs text-slate-500 pl-6">
                        {description}
                      </span>
                    </div>
                    <span className="text-sm font-mono font-semibold text-blue-600 tabular-nums">
                      {format(value)}{" "}
                      <span className="text-xs text-slate-400 font-normal">
                        {unit}
                      </span>
                    </span>
                  </div>
                  <Slider
                    min={min}
                    max={max}
                    step={step}
                    value={[value]}
                    onValueChange={([val]) =>
                      onDataChange({ ...data, [key]: val })
                    }
                  />
                </div>
              );
            },
          )}

          <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-slate-500">
              Wearable data synced &mdash; Last updated: Today
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── Right: outputs (7 columns) ── */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Top Row: Gauge & Assessment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recovery Score Gauge */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Sparkles className="h-5 w-5 text-blue-600" />
                AI Recovery Score
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
                    className={`transition-all duration-700 ease-out ${colorClass.split(" ")[0]}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold font-mono text-card-foreground">
                    {hasResult ? `${Math.round(recoveryScore)}%` : "--"}
                  </span>
                  <span
                    className={`text-sm font-semibold uppercase tracking-wider mt-1 ${colorClass.split(" ")[1]}`}
                  >
                    {hasResult ? recoveryLabel : "Analyzing…"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center px-4 mt-2">
                Measures central nervous system readiness and accumulated
                fatigue.
              </p>
            </CardContent>
          </Card>

          {/* Injury Risk Assessment */}
          <Card
            className={`border-2 transition-colors duration-500 flex flex-col ${
              !hasResult
                ? "border-slate-200"
                : isSafe
                  ? "border-green-200 bg-green-50/30"
                  : isWarning
                    ? "border-yellow-300 bg-yellow-50/30"
                    : "border-red-300 bg-red-50/30"
            }`}
          >
            <CardHeader className="pb-0 pt-5 px-6">
              <CardTitle className="text-sm text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Injury Probability
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 py-4 px-6 flex-1 justify-center">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-colors duration-500 ${
                    !hasResult
                      ? "bg-slate-100"
                      : isSafe
                        ? "bg-green-100"
                        : isWarning
                          ? "bg-yellow-100"
                          : "bg-red-100"
                  }`}
                >
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-500">
                      AI Forecast
                    </span>
                    {hasResult && (
                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider">
                        {injuryProb}% RISK
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xl font-bold transition-colors duration-500 ${
                      !hasResult
                        ? "text-slate-400"
                        : isSafe
                          ? "text-green-700"
                          : isWarning
                            ? "text-yellow-700"
                            : "text-red-700"
                    }`}
                  >
                    {injuryStatus ?? "Analyzing…"}
                  </span>
                </div>
              </div>

              <p className="text-slate-600 font-medium text-xs leading-relaxed mt-2 bg-white/60 p-3 rounded border border-slate-100">
                {isSafe &&
                  "Recovery and planned intensity are perfectly balanced."}
                {isWarning &&
                  "Intensity is pushing current recovery limits. Early warning signs detected."}
                {isDanger &&
                  "Critical mismatch. High probability of acute/overuse injury based on current fatigue profile."}
                {!hasResult && "Adjust wearable metrics to calculate risk."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Middle Row: Analytics / Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 2A. Time Series Trajectory */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <LineChartIcon className="h-4 w-4" />
                6-Month Risk Trend
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

          {/* 2B. XAI Risk Drivers */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Fatigue Drivers (XAI)
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

        {/* Coach Recommendations */}
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell className="h-5 w-5 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                AI Coach Recommendations
              </span>
            </div>
            <ul className="text-sm text-slate-700 font-medium leading-relaxed space-y-2 pl-2">
              {hasResult ? (
                recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    {rec}
                  </li>
                ))
              ) : (
                <li>Waiting for metrics…</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
