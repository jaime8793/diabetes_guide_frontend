"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Footprints,
  Droplets,
  Activity,
  User,
  Scale,
  Baby,
  HeartPulse,
  Layers,
  Dna,
  LineChart as LineChartIcon,
  BarChart3,
  Moon,
  GlassWater,
  Brain,
  Lightbulb,
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

// 1. Updated Props to include universal lifestyle variables
interface MetabolicTabProps {
  vitals: {
    age: number;
    pregnancies: number;
    glucose: number;
    bloodPressure: number;
    skinThickness: number;
    insulin: number;
    diabetesPedigree: number;
    // Universal Lifestyle Variables
    bmi: number;
    dailySteps: number;
    sleepHours: number;
    hydrationLiters: number;
    stressLevel: number;
  };
  onVitalsChange: (vitals: MetabolicTabProps["vitals"]) => void;
}

// Helpers
function generateHistory(currentScore: number, category: string) {
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  let trend = 0;
  if (category.includes("Critical")) trend = -15;
  else if (category.includes("Moderate")) trend = -8;
  else if (category.includes("Elevated")) trend = -4;

  return months.map((month, index) => {
    const noise = Math.random() * 4 - 2;
    const historicalScore = currentScore + trend * (5 - index) + noise;
    return {
      month,
      score: Math.max(5, Math.min(99, Math.round(historicalScore))),
    };
  });
}

function calculateRiskDrivers(vitals: MetabolicTabProps["vitals"]) {
  const drivers = [];
  if (vitals.glucose >= 100)
    drivers.push({
      name: vitals.glucose >= 126 ? "Diabetic Glucose" : "Elevated Glucose",
      value: (vitals.glucose - 99) * 2,
      color: vitals.glucose >= 126 ? "#dc2626" : "#f97316",
    });
  if (vitals.bmi >= 25)
    drivers.push({
      name: vitals.bmi >= 30 ? "Obesity" : "High BMI",
      value: (vitals.bmi - 24) * 4,
      color: vitals.bmi >= 30 ? "#dc2626" : "#eab308",
    });
  if (vitals.bloodPressure >= 80)
    drivers.push({
      name: vitals.bloodPressure >= 90 ? "Hypertension" : "Elevated BP",
      value: (vitals.bloodPressure - 79) * 1.5,
      color: "#3b82f6",
    });
  if (vitals.dailySteps < 6000)
    drivers.push({
      name: "Sedentary Penalty",
      value: (6000 - vitals.dailySteps) / 60,
      color: "#8b5cf6",
    });
  if (vitals.sleepHours < 6)
    drivers.push({
      name: "Sleep Deprivation",
      value: (7 - vitals.sleepHours) * 10,
      color: "#64748b",
    });

  drivers.sort((a, b) => b.value - a.value);
  if (drivers.length === 0)
    return [{ name: "Optimal Health", value: 100, color: "#22c55e" }];
  return drivers.slice(0, 4);
}

export function DiabetesTab({ vitals, onVitalsChange }: MetabolicTabProps) {
  const [apiResult, setApiResult] = useState<{
    status: string;
    predicted_category?: string;
    vitalsguard_score?: number;
    actionable_insights?: string[];
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchPrediction = async () => {
      try {
        setError(null);
        const apiUrl =
          // process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:8000";
        const response = await fetch(`${apiUrl}/predict/metabolic`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Pregnancies: vitals.pregnancies,
            Glucose: vitals.glucose,
            BloodPressure: vitals.bloodPressure,
            SkinThickness: vitals.skinThickness,
            Insulin: vitals.insulin,
            DiabetesPedigreeFunction: vitals.diabetesPedigree,
            Age: vitals.age,
            // Mapping universal frontend vars to backend schema
            bmi: vitals.bmi,
            daily_steps: vitals.dailySteps,
            sleep_hours: vitals.sleepHours,
            hydration_liters: vitals.hydrationLiters,
            stress_level: vitals.stressLevel,
          }),
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("API validation failed.");
        const data = await response.json();
        setApiResult(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError("Assessment engine unreachable.");
        }
      }
    };

    const timeout = setTimeout(fetchPrediction, 500);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [vitals]);

  const category = apiResult?.predicted_category || "Analyzing...";
  const confidenceScore = apiResult?.vitalsguard_score || 0;
  const insights = apiResult?.actionable_insights || [];

  const historyData = useMemo(
    () => generateHistory(confidenceScore, category),
    [confidenceScore, category],
  );
  const riskDrivers = useMemo(() => calculateRiskDrivers(vitals), [vitals]);

  let riskColorClass = "bg-slate-100 text-slate-700 border-slate-200";
  let badgeColorClass = "bg-slate-500 text-white";

  if (category === "Healthy") {
    riskColorClass = "bg-green-50 text-green-900 border-green-200";
    badgeColorClass = "bg-green-500 text-white";
  } else if (category === "Elevated (Behavioral)") {
    riskColorClass = "bg-yellow-50 text-yellow-900 border-yellow-300";
    badgeColorClass = "bg-yellow-500 text-white";
  } else if (category === "Moderate (Medical)") {
    riskColorClass = "bg-orange-50 text-orange-900 border-orange-300";
    badgeColorClass = "bg-orange-500 text-white";
  } else if (category === "Critical Risk") {
    riskColorClass = "bg-red-50 text-red-900 border-red-300";
    badgeColorClass = "bg-red-600 text-white";
  }

  // Component Configuration Arrays
  const clinicalSliders = [
    {
      key: "age" as const,
      label: "Age",
      icon: User,
      min: 18,
      max: 90,
      unit: "yrs",
    },
    {
      key: "glucose" as const,
      label: "Fasting Glucose",
      icon: Droplets,
      min: 40,
      max: 250,
      unit: "mg/dL",
    },
    {
      key: "bloodPressure" as const,
      label: "Blood Pressure",
      icon: HeartPulse,
      min: 40,
      max: 140,
      unit: "mmHg",
    },
    {
      key: "insulin" as const,
      label: "Insulin",
      icon: Activity,
      min: 0,
      max: 300,
      unit: "µIU/mL",
    },
    {
      key: "diabetesPedigree" as const,
      label: "Genetics (Pedigree)",
      icon: Dna,
      min: 0.0,
      max: 2.5,
      unit: "",
      step: 0.01,
    },
  ];

  const lifestyleSliders = [
    {
      key: "bmi" as const,
      label: "BMI",
      icon: Scale,
      min: 15,
      max: 50,
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
      {/* LEFT COLUMN: Segmented Inputs */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Card 1: Clinical Biomarkers */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-4 w-4 text-blue-600" /> Clinical Biomarkers
            </CardTitle>
            <CardDescription className="text-xs">
              Immutable factors & medical lab results
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            {clinicalSliders.map(
              ({ key, label, icon: Icon, min, max, unit, step }) => (
                <div key={key} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <Icon className="h-3 w-3 text-slate-400" /> {label}
                    </label>
                    <span className="text-xs font-mono font-semibold text-blue-600">
                      {vitals[key] % 1 !== 0
                        ? vitals[key].toFixed(2)
                        : vitals[key]}{" "}
                      <span className="font-normal text-slate-400">{unit}</span>
                    </span>
                  </div>
                  <Slider
                    min={min}
                    max={max}
                    step={step || 1}
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
          <CardContent className="grid grid-cols-1 gap-4">
            {lifestyleSliders.map(
              ({ key, label, icon: Icon, min, max, unit, step }) => (
                <div key={key} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-medium text-indigo-900">
                      <Icon className="h-3 w-3 text-indigo-400" /> {label}
                    </label>
                    <span className="text-xs font-mono font-semibold text-indigo-600">
                      {vitals[key] % 1 !== 0
                        ? vitals[key].toFixed(1)
                        : vitals[key]}{" "}
                      <span className="font-normal text-indigo-400">
                        {unit}
                      </span>
                    </span>
                  </div>
                  <Slider
                    min={min}
                    max={max}
                    step={step || 1}
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

      {/* RIGHT COLUMN: Outputs & Analytics */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Risk Score Card */}
        <Card
          className={`border-2 transition-colors duration-500 ${riskColorClass}`}
        >
          <CardContent className="flex flex-col gap-5 pt-6">
            {error ? (
              <div className="text-sm font-semibold text-red-600">{error}</div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <Badge
                    className={`px-4 py-2 text-sm font-semibold border-none ${badgeColorClass}`}
                  >
                    {category}
                  </Badge>
                  <div className="flex flex-col items-end">
                    <span className="text-4xl font-bold font-mono">
                      {apiResult ? `${confidenceScore.toFixed(1)}%` : "--"}
                    </span>
                    <span className="text-xs uppercase tracking-wider font-semibold opacity-70">
                      VITALSGUARD INDEX
                    </span>
                  </div>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/50">
                  <div
                    className={`h-full transition-all duration-1000 ease-out ${badgeColorClass}`}
                    style={{ width: `${confidenceScore}%` }}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

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
                <LineChartIcon className="h-4 w-4" /> Trajectory
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
                      category === "Healthy"
                        ? "#22c55e"
                        : category === "Critical Risk"
                          ? "#dc2626"
                          : "#f59e0b"
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
                <BarChart3 className="h-4 w-4" /> Risk Drivers
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
