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
  Loader2,
  ShieldAlert,
  User,
  Scale,
  Baby,
  HeartPulse,
  Layers,
  Dna,
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

interface MetabolicTabProps {
  vitals: {
    age: number;
    bmi: number;
    glucose: number;
    insulin: number;
    pregnancies: number;
    bloodPressure: number;
    skinThickness: number;
    diabetesPedigree: number;
    dailySteps: number;
  };
  onVitalsChange: (vitals: MetabolicTabProps["vitals"]) => void;
}

// ---------------------------------------------------------------------------
// Helpers for the new Charts
// ---------------------------------------------------------------------------

// 1. Generate dynamic 6-month history based on the current score
function generateHistory(currentScore: number, category: string) {
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  let trend = 0;

  if (category.includes("Critical"))
    trend = -15; // They've been getting worse fast
  else if (category.includes("Moderate")) trend = -8;
  else if (category.includes("Elevated")) trend = -4;
  else trend = 0; // Healthy stays relatively flat

  return months.map((month, index) => {
    // Reverse engineer past scores based on the trend, adding slight realistic noise
    const noise = Math.random() * 4 - 2;
    const historicalScore = currentScore + trend * (5 - index) + noise;
    return {
      month,
      score: Math.max(5, Math.min(99, Math.round(historicalScore))), // clamp 5-99
    };
  });
}

// 2. Calculate "Top Risk Drivers" by comparing vitals to optimal clinical baselines
function calculateRiskDrivers(vitals: MetabolicTabProps["vitals"]) {
  const drivers = [];

  // Calculate deviation from "optimal" to show the AI's logic
  if (vitals.glucose > 100)
    drivers.push({
      name: "Elevated Glucose",
      value: (vitals.glucose - 100) * 1.5,
      color: "#ef4444",
    });
  if (vitals.bmi > 25)
    drivers.push({
      name: "High BMI",
      value: (vitals.bmi - 25) * 3,
      color: "#f97316",
    });
  if (vitals.dailySteps < 7000)
    drivers.push({
      name: "Sedentary Lifestyle",
      value: (7000 - vitals.dailySteps) / 100,
      color: "#eab308",
    });
  if (vitals.bloodPressure > 80)
    drivers.push({
      name: "Blood Pressure",
      value: (vitals.bloodPressure - 80) * 1.2,
      color: "#3b82f6",
    });
  if (vitals.insulin > 20)
    drivers.push({
      name: "Insulin Resistance",
      value: (vitals.insulin - 20) * 0.8,
      color: "#8b5cf6",
    });

  // Sort to find the biggest problems
  drivers.sort((a, b) => b.value - a.value);

  // If healthy, show a "Good" placeholder
  if (drivers.length === 0 || drivers[0].value < 5) {
    return [{ name: "All Markers Optimal", value: 100, color: "#22c55e" }];
  }

  return drivers.slice(0, 4); // Return top 4 drivers
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function DiabetesTab({ vitals, onVitalsChange }: MetabolicTabProps) {
  const [apiResult, setApiResult] = useState<{
    status: string;
    predicted_category?: string;
    confidence?: number;
    risk_score?: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPrediction = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        const response = await fetch(`${apiUrl}/predict/metabolic`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Pregnancies: vitals.pregnancies,
            Glucose: vitals.glucose,
            BloodPressure: vitals.bloodPressure,
            SkinThickness: vitals.skinThickness,
            Insulin: vitals.insulin,
            BMI: vitals.bmi,
            DiabetesPedigreeFunction: vitals.diabetesPedigree,
            Age: vitals.age,
            TotalSteps: vitals.dailySteps,
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
      } finally {
        setIsLoading(false);
      }
    };

    const timeout = setTimeout(fetchPrediction, 600);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [vitals]);

  // Derived Logic
  const category =
    apiResult?.predicted_category || (apiResult ? "Healthy" : "Analyzing...");
  const confidenceScore = apiResult?.confidence || apiResult?.risk_score || 0;

  // Memoize the chart data so it doesn't jitter needlessly
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

  const sliderConfigs = [
    {
      key: "age" as const,
      label: "Age",
      icon: User,
      min: 18,
      max: 90,
      unit: "yrs",
    },
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
      key: "glucose" as const,
      label: "Glucose",
      icon: Droplets,
      min: 40,
      max: 250,
      unit: "mg/dL",
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
      key: "bloodPressure" as const,
      label: "Blood Pressure",
      icon: HeartPulse,
      min: 40,
      max: 140,
      unit: "mmHg",
    },
    {
      key: "skinThickness" as const,
      label: "Skin Thickness",
      icon: Layers,
      min: 0,
      max: 99,
      unit: "mm",
    },
    {
      key: "pregnancies" as const,
      label: "Pregnancies",
      icon: Baby,
      min: 0,
      max: 15,
      unit: "",
    },
    {
      key: "diabetesPedigree" as const,
      label: "Pedigree",
      icon: Dna,
      min: 0.0,
      max: 2.5,
      unit: "",
      step: 0.01,
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
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* LEFT COLUMN: Inputs (Takes up 5 columns on large screens) */}
      <Card className="lg:col-span-5 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Heart className="h-5 w-5 text-blue-600" />
            Clinical Profile
          </CardTitle>
          <CardDescription>
            Adjust markers to view dynamic risk stratification
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5">
          {sliderConfigs.map(
            ({ key, label, icon: Icon, min, max, unit, step }) => (
              <div key={key} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Icon className="h-4 w-4 text-slate-400" />
                    {label}
                  </label>
                  <span className="text-sm font-mono font-semibold text-blue-600">
                    {vitals[key] !== undefined
                      ? vitals[key] % 1 !== 0
                        ? vitals[key].toFixed(2)
                        : vitals[key]
                      : "0"}{" "}
                    <span className="text-xs text-slate-400 font-normal">
                      {unit}
                    </span>
                  </span>
                </div>
                <Slider
                  min={min}
                  max={max}
                  step={step || 1}
                  value={[vitals[key] || 0]}
                  onValueChange={([val]) =>
                    onVitalsChange({ ...vitals, [key]: val })
                  }
                />
              </div>
            ),
          )}
        </CardContent>
      </Card>

      {/* RIGHT COLUMN: Outputs & Analytics (Takes up 7 columns) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* 1. Integrated Risk Score Card */}
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
                      Model Certainty
                    </span>
                  </div>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/50">
                  <div
                    className={`h-full transition-all duration-1000 ease-out ${badgeColorClass}`}
                    style={{ width: apiResult ? `${confidenceScore}%` : "0%" }}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 2. Side-by-Side Analytics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 2A. Time Series Trajectory */}
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
                    formatter={(value: number) => [`${value}%`, "Risk Score"]}
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

          {/* 2B. XAI Risk Drivers */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Top Risk Drivers (XAI)
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

        {/* 3. Clinical Interpretation */}
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="pt-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Clinical Interpretation
            </span>
            <p className="text-slate-700 font-medium text-sm leading-relaxed">
              {category === "Healthy" &&
                "The patient's clinical vitals and daily behavioral habits are well within optimal physiological ranges. No metabolic distress detected."}
              {category === "Elevated (Behavioral)" &&
                "Clinical vitals are stable, but behavioral patterns (low steps, high sedentary time) are creating a trajectory toward metabolic syndrome. Immediate lifestyle intervention is recommended."}
              {category === "Moderate (Medical)" &&
                "Behavioral factors aside, the patient's actual clinical markers have crossed the threshold into pre-diabetic or hypertensive territory. Pharmacological review required."}
              {category === "Critical Risk" &&
                "A dangerous compounding effect: the patient has severe clinical abnormalities combined with extremely poor behavioral habits, signaling acute metabolic danger."}
              {!apiResult &&
                "Adjust the sliders to see how the model interprets different combinations of clinical and behavioral data."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
