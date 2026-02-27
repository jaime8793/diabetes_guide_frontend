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
  HeartPulse,
  Loader2,
  User,
  Scale,
  Droplets,
  Footprints,
  LineChart as LineChartIcon,
  BarChart3,
  Stethoscope,
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
// Types (Exported so page.tsx can use it)
// ---------------------------------------------------------------------------
export interface StrokeData {
  age: number;
  avgGlucose: number;
  bmi: number;
  hypertension: boolean;
  heartDisease: boolean;
  smokingStatus: string;
  dailySteps?: number;
}

interface StrokeTabProps {
  data: StrokeData;
  onDataChange: (data: StrokeData) => void;
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
      score: Math.max(2, Math.min(99, Math.round(historicalScore))),
    };
  });
}

function calculateStrokeDrivers(data: StrokeData) {
  const drivers = [];

  if (data.hypertension)
    drivers.push({ name: "Hypertension", value: 30, color: "#ef4444" });
  if (data.heartDisease)
    drivers.push({ name: "Prior Heart Disease", value: 40, color: "#dc2626" });
  if (data.smokingStatus === "smokes")
    drivers.push({ name: "Active Smoking", value: 25, color: "#f97316" });
  if (data.avgGlucose > 140)
    drivers.push({
      name: "Elevated Glucose",
      value: (data.avgGlucose - 140) * 0.5,
      color: "#f59e0b",
    });
  if (data.bmi > 30)
    drivers.push({
      name: "High BMI",
      value: (data.bmi - 30) * 2,
      color: "#eab308",
    });

  const steps = data.dailySteps ?? 5000;
  if (steps < 4000)
    drivers.push({
      name: "Sedentary (Vascular Risk)",
      value: 20,
      color: "#8b5cf6",
    });

  drivers.sort((a, b) => b.value - a.value);

  if (drivers.length === 0)
    return [{ name: "Optimal Vascular Flow", value: 100, color: "#22c55e" }];
  return drivers.slice(0, 4);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function StrokeTab({ data, onDataChange }: StrokeTabProps) {
  const [prediction, setPrediction] = useState({
    mlBaseProbability: 0,
    vitalsScore: 0,
    riskLevel: "Analyzing...",
    recommendation: "",
    loading: false,
  });

  const [error, setError] = useState<string | null>(null);

  // Safety fallback for steps
  const dailySteps = data.dailySteps ?? 5000;

  useEffect(() => {
    let cancelled = false;

    const fetchPrediction = async () => {
      setPrediction((prev) => ({ ...prev, loading: true }));
      setError(null);

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const response = await fetch(`${apiUrl}/predict/stroke`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            age: data.age,
            hypertension: data.hypertension ? 1 : 0,
            heart_disease: data.heartDisease ? 1 : 0,
            avg_glucose_level: data.avgGlucose,
            bmi: data.bmi,
            ever_married: 1,
            work_type: "Private",
            Residence_type: "Urban",
            smoking_status: data.smokingStatus,
            daily_steps: dailySteps,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (!cancelled) {
            setPrediction({
              mlBaseProbability: result.ml_base_probability,
              vitalsScore: result.vitalsguard_score,
              riskLevel: result.risk_level,
              recommendation: result.recommendation,
              loading: false,
            });
          }
        } else {
          if (!cancelled) setError("FastAPI Validation Error");
        }
      } catch (err) {
        if (!cancelled) setError("FastAPI unreachable.");
      } finally {
        if (!cancelled) setPrediction((prev) => ({ ...prev, loading: false }));
      }
    };

    const timeout = setTimeout(fetchPrediction, 500);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [data, dailySteps]);

  // Derived Logic for UI
  const { vitalsScore, riskLevel, mlBaseProbability, recommendation } =
    prediction;
  const historyData = useMemo(
    () => generateStrokeHistory(vitalsScore, riskLevel),
    [vitalsScore, riskLevel],
  );
  const riskDrivers = useMemo(
    () => calculateStrokeDrivers({ ...data, dailySteps }),
    [data, dailySteps],
  );

  let riskColorClass = "bg-slate-100 border-slate-200";
  let badgeColorClass = "bg-slate-500 text-white";

  if (riskLevel === "Low Risk") {
    riskColorClass = "bg-green-50 border-green-200";
    badgeColorClass = "bg-green-500 text-white";
  } else if (riskLevel === "Moderate Risk") {
    riskColorClass = "bg-yellow-50 border-yellow-300";
    badgeColorClass = "bg-yellow-500 text-white";
  } else if (riskLevel === "High Risk") {
    riskColorClass = "bg-red-50 border-red-300";
    badgeColorClass = "bg-red-600 text-white";
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* LEFT COLUMN: Inputs (5 cols) */}
      <Card className="lg:col-span-5 h-fit shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <BrainCircuit className="h-5 w-5 text-indigo-600" />
            Cerebrovascular Profile
          </CardTitle>
          <CardDescription>
            Adjust clinical markers to see real-time risk impact
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Continuous Sliders */}
          {[
            {
              key: "age",
              label: "Age",
              icon: User,
              min: 18,
              max: 95,
              val: data.age,
              unit: "yrs",
            },
            {
              key: "avgGlucose",
              label: "Avg Glucose Level",
              icon: Droplets,
              min: 50,
              max: 280,
              val: data.avgGlucose,
              unit: "mg/dL",
            },
            {
              key: "bmi",
              label: "BMI",
              icon: Scale,
              min: 15,
              max: 45,
              val: data.bmi,
              unit: "",
              step: 0.1,
            },
          ].map((slider) => (
            <div key={slider.key} className="space-y-3">
              <div className="flex justify-between text-sm">
                <label className="font-medium flex items-center gap-2 text-slate-700">
                  <slider.icon className="h-4 w-4 text-slate-400" />{" "}
                  {slider.label}
                </label>
                <span className="text-indigo-600 font-bold">
                  {slider.val} {slider.unit}
                </span>
              </div>
              <Slider
                min={slider.min}
                max={slider.max}
                step={slider.step || 1}
                value={[slider.val]}
                onValueChange={([v]) =>
                  onDataChange({ ...data, [slider.key]: v })
                }
              />
            </div>
          ))}

          {/* New Steps Slider */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <label className="font-medium flex items-center gap-2 text-slate-700">
                <Footprints className="h-4 w-4 text-slate-400" /> Daily Steps
              </label>
              <span className="text-indigo-600 font-bold">
                {dailySteps} steps
              </span>
            </div>
            <Slider
              min={1000}
              max={20000}
              step={500}
              value={[dailySteps]}
              onValueChange={([v]) => onDataChange({ ...data, dailySteps: v })}
            />
          </div>

          <div className="h-px w-full bg-slate-100" />

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex flex-col gap-2 p-3 rounded-lg border bg-slate-50">
              <span className="text-sm font-medium">Hypertension</span>
              <Switch
                checked={data.hypertension}
                onCheckedChange={(v) =>
                  onDataChange({ ...data, hypertension: v })
                }
              />
            </div>
            <div className="flex flex-col gap-2 p-3 rounded-lg border bg-slate-50">
              <span className="text-sm font-medium">Heart Disease</span>
              <Switch
                checked={data.heartDisease}
                onCheckedChange={(v) =>
                  onDataChange({ ...data, heartDisease: v })
                }
              />
            </div>
          </div>

          {/* Smoking Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Smoking Status
            </label>
            <Select
              value={data.smokingStatus}
              onValueChange={(v) => onDataChange({ ...data, smokingStatus: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never smoked">Never Smoked</SelectItem>
                <SelectItem value="formerly smoked">Formerly Smoked</SelectItem>
                <SelectItem value="smokes">Currently Smokes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* RIGHT COLUMN: Outputs (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* 1. Integrated Score Card */}
        <Card
          className={`border-2 transition-colors duration-500 ${riskColorClass} relative overflow-hidden`}
        >
          {prediction.loading && (
            <div className="absolute inset-0 bg-white/40 z-10 flex items-center justify-center backdrop-blur-[1px]">
              <Loader2 className="animate-spin text-indigo-600" />
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
                      {vitalsScore.toFixed(1)}
                    </span>
                    <span className="text-xs uppercase tracking-wider font-semibold opacity-70">
                      VitalsGuard Index
                    </span>
                  </div>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/50">
                  <div
                    className={`h-full transition-all duration-1000 ease-out ${badgeColorClass}`}
                    style={{ width: `${vitalsScore}%` }}
                  />
                </div>

                <p className="text-sm text-slate-600 font-medium">
                  <strong>ML Base Probability:</strong> {mlBaseProbability}%{" "}
                  <br />
                  <em>
                    The VitalsGuard index adjusts this raw probability using
                    your daily step activity and known clinical risk factors.
                  </em>
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* 2. Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time Series */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <LineChartIcon className="h-4 w-4" />
                6-Month Trajectory
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
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* XAI Risk Drivers */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Vascular Stress Drivers
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

        {/* 3. Clinical Recommendation */}
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="pt-5 pb-5 flex gap-4 items-start">
            <Stethoscope className="h-6 w-6 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                AI Clinical Recommendation
              </span>
              <p className="text-slate-800 font-medium text-sm leading-relaxed">
                {recommendation || "Waiting for patient data profile..."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
