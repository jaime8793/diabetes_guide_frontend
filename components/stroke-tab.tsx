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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BrainCircuit,
  Activity,
  Loader2,
  User,
  Scale,
  Droplets,
  Footprints,
  Moon,
  GlassWater,
  Brain,
  Cigarette,
  AlertCircle,
  HeartPulse,
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
export interface StrokeTabProps {
  vitals: {
    // Clinical
    age: number;
    glucose: number;
    hypertension: number; // 0 or 1
    heartDisease: number; // 0 or 1
    // Lifestyle
    bmi: number;
    dailySteps: number;
    sleepHours: number;
    hydrationLiters: number;
    stressLevel: number;
    smokingStatus: string;
    // (Other properties exist in the global state but aren't used in this model)
  };
  onVitalsChange: (vitals: any) => void;
}

// ---------------------------------------------------------------------------
// Chart Helpers
// ---------------------------------------------------------------------------
function generateStrokeHistory(currentScore: number, category: string) {
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  let trend = 0;

  if (category === "High Risk") trend = -12;
  else if (category === "Moderate Risk") trend = -5;
  else trend = 0;

  return months.map((month, index) => {
    const noise = Math.random() * 5 - 2.5;
    const historicalScore = currentScore + trend * (5 - index) + noise;
    return {
      month,
      score: Math.max(0.1, Math.min(99, Math.round(historicalScore))),
    };
  });
}

function calculateStrokeDrivers(vitals: StrokeTabProps["vitals"]) {
  const drivers = [];

  // Clinical Drivers
  if (vitals.hypertension === 1)
    drivers.push({ name: "Hypertension", value: 30, color: "#ef4444" });
  if (vitals.heartDisease === 1)
    drivers.push({ name: "Prior Heart Disease", value: 40, color: "#dc2626" });
  if (vitals.glucose > 150)
    drivers.push({
      name: "Elevated Glucose",
      value: (vitals.glucose - 140) * 0.5,
      color: "#f59e0b",
    });

  // Lifestyle Drivers
  if (vitals.smokingStatus === "smokes")
    drivers.push({ name: "Active Smoking", value: 35, color: "#78716c" });
  if (vitals.bmi > 25)
    drivers.push({
      name: vitals.bmi >= 30 ? "Obesity" : "High BMI",
      value: (vitals.bmi - 24) * 2,
      color: "#eab308",
    });
  if (vitals.dailySteps < 6000)
    drivers.push({ name: "Sedentary Penalty", value: 15, color: "#8b5cf6" });
  if (vitals.sleepHours < 6)
    drivers.push({ name: "Sleep Deprivation", value: 15, color: "#64748b" });
  if (vitals.hydrationLiters < 1.5)
    drivers.push({ name: "Poor Hydration", value: 15, color: "#3b82f6" });
  if (vitals.stressLevel >= 8)
    drivers.push({
      name: "Acute Vascular Stress",
      value: 15,
      color: "#f43f5e",
    });

  drivers.sort((a, b) => b.value - a.value);

  if (drivers.length === 0)
    return [{ name: "Optimal Vascular Flow", value: 100, color: "#22c55e" }];
  return drivers.slice(0, 4);
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export function StrokeTab({ vitals, onVitalsChange }: StrokeTabProps) {
  const [prediction, setPrediction] = useState<{
    status: string;
    vitalsguard_score?: number;
    risk_level?: string;
    actionable_insights?: string[];
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchPrediction = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = "http://localhost:8000" || process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/predict/stroke`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            age: vitals.age,
            hypertension: vitals.hypertension,
            heart_disease: vitals.heartDisease,
            avg_glucose_level: vitals.glucose,
            smoking_status: vitals.smokingStatus,
            bmi: vitals.bmi,
            daily_steps: vitals.dailySteps,
            sleep_hours: vitals.sleepHours,
            hydration_liters: vitals.hydrationLiters,
            stress_level: vitals.stressLevel,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (!cancelled) setPrediction(result);
        } else {
          if (!cancelled) setError("FastAPI Validation Error");
        }
      } catch (err) {
        if (!cancelled) setError("Vascular engine unreachable.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const timeout = setTimeout(fetchPrediction, 500);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [vitals]);

  // Derived Logic for UI
  const riskLevel =
    prediction?.risk_level || (prediction ? "Low Risk" : "Analyzing...");
  const vitalsScore = prediction?.vitalsguard_score || 0;
  const insights = prediction?.actionable_insights || [];

  const historyData = useMemo(
    () => generateStrokeHistory(vitalsScore, riskLevel),
    [vitalsScore, riskLevel],
  );
  const riskDrivers = useMemo(() => calculateStrokeDrivers(vitals), [vitals]);

  let riskColorClass = "bg-slate-100 border-slate-200";
  let badgeColorClass = "bg-slate-500 text-white";

  if (riskLevel === "Low Risk") {
    riskColorClass = "bg-green-50 border-green-200";
    badgeColorClass = "bg-green-500 text-white";
  } else if (riskLevel === "Moderate Risk") {
    riskColorClass = "bg-orange-50 border-orange-300";
    badgeColorClass = "bg-orange-500 text-white";
  } else if (riskLevel === "High Risk") {
    riskColorClass = "bg-red-50 border-red-300";
    badgeColorClass = "bg-red-600 text-white";
  }

  // Component Configuration Arrays
  const clinicalSliders = [
    {
      key: "age" as const,
      label: "Age",
      icon: User,
      min: 18,
      max: 95,
      unit: "yrs",
      step: 1,
    },
    {
      key: "glucose" as const,
      label: "Avg Glucose Level",
      icon: Droplets,
      min: 50,
      max: 280,
      unit: "mg/dL",
      step: 1,
    },
  ];

  const lifestyleSliders = [
    {
      key: "bmi" as const,
      label: "BMI",
      icon: Scale,
      min: 15,
      max: 45,
      unit: "kg/m²",
      step: 0.1,
    },
    {
      key: "dailySteps" as const,
      label: "Daily Steps",
      icon: Footprints,
      min: 500,
      max: 20000,
      unit: "steps",
      step: 100,
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
      icon: GlassWater,
      min: 0.5,
      max: 5.0,
      unit: "L",
      step: 0.1,
    },
    {
      key: "stressLevel" as const,
      label: "Stress Level",
      icon: Brain,
      min: 1,
      max: 10,
      unit: "/ 10",
      step: 1,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* LEFT COLUMN: Segmented Inputs (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Card 1: Clinical Biomarkers */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <HeartPulse className="h-4 w-4 text-red-600" /> Clinical
              Biomarkers
            </CardTitle>
            <CardDescription className="text-xs">
              Immutable factors & medical history
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5">
            {clinicalSliders.map(
              ({ key, label, icon: Icon, min, max, unit, step }) => (
                <div key={key} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <label className="font-medium flex items-center gap-2 text-slate-700">
                      <Icon className="h-4 w-4 text-slate-400" /> {label}
                    </label>
                    <span className="text-red-600 font-bold">
                      {vitals[key]}{" "}
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

            <div className="h-px w-full bg-slate-100 my-1" />

            {/* Medical Toggles */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 p-3 rounded-lg border bg-slate-50">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-slate-400" /> Hypertension
                </span>
                <Switch
                  checked={vitals.hypertension === 1}
                  onCheckedChange={(v) =>
                    onVitalsChange({ ...vitals, hypertension: v ? 1 : 0 })
                  }
                />
              </div>
              <div className="flex flex-col gap-2 p-3 rounded-lg border bg-slate-50">
                <span className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-slate-400" /> Heart
                  Disease
                </span>
                <Switch
                  checked={vitals.heartDisease === 1}
                  onCheckedChange={(v) =>
                    onVitalsChange({ ...vitals, heartDisease: v ? 1 : 0 })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Lifestyle Modifiers */}
        <Card className="h-fit border-indigo-100 bg-indigo-50/30">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base text-indigo-900">
              <Activity className="h-4 w-4 text-indigo-600" /> Lifestyle
              Modifiers
            </CardTitle>
            <CardDescription className="text-xs text-indigo-700/70">
              Highly actionable behavioral metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5">
            {/* Smoking Status Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-indigo-900 flex items-center gap-2">
                <Cigarette className="h-4 w-4 text-indigo-400" /> Smoking Status
              </label>
              <Select
                value={vitals.smokingStatus}
                onValueChange={(v) =>
                  onVitalsChange({ ...vitals, smokingStatus: v })
                }
              >
                <SelectTrigger className="border-indigo-200 bg-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never smoked">Never Smoked</SelectItem>
                  <SelectItem value="formerly smoked">
                    Formerly Smoked
                  </SelectItem>
                  <SelectItem value="smokes">Currently Smokes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lifestyle Sliders */}
            {lifestyleSliders.map(
              ({ key, label, icon: Icon, min, max, unit, step }) => (
                <div key={key} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <label className="font-medium flex items-center gap-2 text-indigo-900">
                      <Icon className="h-4 w-4 text-indigo-400" /> {label}
                    </label>
                    <span className="text-indigo-600 font-bold">
                      {vitals[key]}{" "}
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

      {/* RIGHT COLUMN: Outputs (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* 1. Integrated Score Card */}
        <Card
          className={`border-2 transition-colors duration-500 ${riskColorClass} relative overflow-hidden`}
        >
          {loading && (
            <div className="absolute inset-0 bg-white/40 z-10 flex items-center justify-center backdrop-blur-[1px]">
              <Loader2 className="animate-spin text-indigo-600 h-8 w-8" />
            </div>
          )}
          <CardContent className="flex flex-col gap-5 pt-6">
            {error ? (
              <div className="text-sm font-semibold text-red-600">{error}</div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <Badge
                    className={`px-4 py-2 text-sm font-semibold border-none ${badgeColorClass}`}
                  >
                    {riskLevel}
                  </Badge>
                  <div className="flex flex-col items-end">
                    <span className="text-4xl font-bold font-mono text-slate-800">
                      {prediction ? `${vitalsScore.toFixed(1)}%` : "--"}
                    </span>
                    <span className="text-xs uppercase tracking-wider font-semibold opacity-70">
                      Ischemic Risk Index
                    </span>
                  </div>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/50">
                  <div
                    className={`h-full transition-all duration-1000 ease-out ${badgeColorClass}`}
                    style={{ width: prediction ? `${vitalsScore}%` : "0%" }}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 2. Actionable Insights List */}
        <Card className="bg-slate-900 border-none text-white">
          <CardHeader className="pb-3 pt-5">
            <CardTitle className="text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" /> Vascular
              Insights
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
                    <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
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

        {/* 3. Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <LineChartIcon className="h-4 w-4" /> 6-Month Trajectory
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
                    formatter={(value: any) => [`${value}%`, "Risk Score"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={
                      riskLevel === "Low Risk"
                        ? "#22c55e"
                        : riskLevel === "High Risk"
                          ? "#dc2626"
                          : "#eab308"
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
                <BarChart3 className="h-4 w-4" /> Vascular Stress Drivers
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
                    width={120}
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
