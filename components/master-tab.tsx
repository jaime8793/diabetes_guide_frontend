"use client";

import React, { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  BrainCircuit,
  Dumbbell,
  Loader2,
  Heart,
  Lightbulb,
  Moon,
  GlassWater,
  Brain,
  Footprints,
  ArrowRight,
  CheckCircle2,
  Scale,
  Cigarette,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface MasterTabProps {
  vitals: any;
  onVitalsChange: (vitals: any) => void;
}

interface Insight {
  text: string;
  target: string | null;
  value: any;
  type: string;
  color: string;
}

export function MasterTab({ vitals, onVitalsChange }: MasterTabProps) {
  const [results, setResults] = useState({
    metabolic: { score: 0, status: "Analyzing...", insights: [] as Insight[] },
    stroke: { score: 0, status: "Analyzing...", insights: [] as Insight[] },
    recovery: { score: 0, status: "Analyzing...", insights: [] as Insight[] },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchAllData = async () => {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      try {
        const [metabolicRes, strokeRes, recoveryRes] = await Promise.all([
          fetch(`${apiUrl}/predict/metabolic`, {
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
              bmi: vitals.bmi,
              daily_steps: vitals.dailySteps,
              sleep_hours: vitals.sleepHours,
              hydration_liters: vitals.hydrationLiters,
              stress_level: vitals.stressLevel,
            }),
          }),
          fetch(`${apiUrl}/predict/stroke`, {
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
          }),
          fetch(`${apiUrl}/predict/recovery`, {
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
          }),
        ]);

        const metabolicData = await metabolicRes.json();
        const strokeData = await strokeRes.json();
        const recoveryData = await recoveryRes.json();

        if (!cancelled) {
          // Map backend insights and inject visual types/colors
          const mapInsights = (data: any, type: string, color: string) =>
            (data.actionable_insights || []).map((i: any) => ({
              ...i,
              type,
              color,
            }));

          setResults({
            metabolic: {
              score: metabolicData.vitalsguard_score || 0,
              status: metabolicData.predicted_category || "Unknown",
              insights: mapInsights(metabolicData, "Metabolic", "bg-blue-500"),
            },
            stroke: {
              score: strokeData.vitalsguard_score || 0,
              status: strokeData.risk_level || "Unknown",
              insights: mapInsights(strokeData, "Vascular", "bg-red-500"),
            },
            recovery: {
              score: recoveryData.injury_probability || 0,
              status: recoveryData.injury_risk || "Unknown",
              insights: mapInsights(recoveryData, "Recovery", "bg-yellow-500"),
            },
          });
        }
      } catch (err) {
        console.error("Failed to fetch master data", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const timeout = setTimeout(fetchAllData, 500);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [vitals]);

  // Aggregate Insights (Take 2 from each category to build a top priority list)
  const unifiedInsights = [
    ...results.metabolic.insights.filter((i) => i.target).slice(0, 2),
    ...results.stroke.insights.filter((i) => i.target).slice(0, 2),
    ...results.recovery.insights.filter((i) => i.target).slice(0, 2),
  ];

  // Auto-Fix Handler
  const handleApplyInsight = (target: string | null, value: any) => {
    if (!target) return;
    onVitalsChange({ ...vitals, [target]: value });
  };

  const radarData = [
    { subject: "Metabolic Risk", A: results.metabolic.score, fullMark: 100 },
    { subject: "Vascular Risk", A: results.stroke.score, fullMark: 100 },
    { subject: "Injury Risk", A: results.recovery.score, fullMark: 100 },
    {
      subject: "Systemic Stress",
      A: (vitals.stressLevel / 10) * 100,
      fullMark: 100,
    },
    {
      subject: "Sedentary Deficit",
      A: Math.max(0, 100 - (vitals.dailySteps / 12000) * 100),
      fullMark: 100,
    },
  ];

  const getStatusColor = (score: number) => {
    if (score >= 60) return "text-red-600 bg-red-50 border-red-200";
    if (score >= 30) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

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
      {/* ── LEFT COLUMN: Lifestyle Simulator (5 Cols) ── */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <Card className="h-fit border-indigo-100 bg-indigo-50/30">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base text-indigo-900">
              <Activity className="h-4 w-4 text-indigo-600" /> Universal Habit
              Simulator
            </CardTitle>
            <CardDescription className="text-xs text-indigo-700/70">
              Adjusting these master metrics will recalculate all three
              biological models simultaneously.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6">
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

            {/* Continuous Sliders */}
            {lifestyleSliders.map(
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

        {/* Radar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-slate-500 uppercase tracking-wider">
              <Heart className="h-4 w-4 text-indigo-600" /> Holistic
              Vulnerability Map
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#64748b", fontSize: 10 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="Risk Profile"
                  dataKey="A"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.4}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── RIGHT COLUMN: Outputs & Interactive Engine (7 Cols) ── */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Top Row: The Three Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Metabolic Risk",
              icon: Activity,
              data: results.metabolic,
            },
            {
              title: "Ischemic Risk",
              icon: BrainCircuit,
              data: results.stroke,
            },
            { title: "Injury Risk", icon: Dumbbell, data: results.recovery },
          ].map((pillar, idx) => (
            <Card
              key={idx}
              className={`border-2 transition-all duration-500 relative overflow-hidden ${getStatusColor(
                pillar.data.score,
              )}`}
            >
              {loading && (
                <div className="absolute inset-0 bg-white/40 z-10 flex items-center justify-center backdrop-blur-[1px]">
                  <Loader2 className="animate-spin h-5 w-5 opacity-50" />
                </div>
              )}
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 opacity-80">
                  <pillar.icon className="h-3.5 w-3.5" /> {pillar.title}
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-bold font-mono">
                    {pillar.data.score.toFixed(1)}%
                  </span>
                  <Badge className="bg-white/80 text-current hover:bg-white border-current text-[10px] px-1.5 py-0">
                    {pillar.data.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Auto-Fix Interactive Engine List */}
        <Card className="bg-slate-900 text-white border-none flex-1">
          <CardHeader className="pb-3 pt-6">
            <CardTitle className="text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-400" /> Interactive
              Prescription Engine
            </CardTitle>
            <CardDescription className="text-slate-500">
              Click an optimization to automatically adjust your lifestyle
              habits and simulate the risk reduction.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-3 text-slate-400 py-4">
                <Loader2 className="h-5 w-5 animate-spin" /> Synthesizing
                holistic interventions...
              </div>
            ) : unifiedInsights.length > 0 ? (
              <ul className="space-y-3">
                {unifiedInsights.map((insight, i) => (
                  <li
                    key={i}
                    onClick={() =>
                      handleApplyInsight(insight.target, insight.value)
                    }
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition-all hover:border-indigo-500/50"
                  >
                    <div className="flex gap-4 items-start">
                      <span
                        className={`mt-1.5 flex h-2 w-2 shrink-0 rounded-full ${
                          insight.color
                        } shadow-[0_0_8px_rgba(0,0,0,0.5)] shadow-${
                          insight.color.split("-")[1]
                        }-500`}
                      />
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {insight.type} Priority
                        </span>
                        <span className="text-sm leading-relaxed text-slate-200 group-hover:text-white transition-colors">
                          {insight.text}
                        </span>
                      </div>
                    </div>
                    {insight.target && (
                      <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500 hover:text-white transition-all shrink-0 flex items-center gap-1.5 py-1">
                        Auto-Fix <ArrowRight className="h-3 w-3" />
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-3 bg-slate-800/30 rounded-xl border border-slate-800/50">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
                <div className="flex flex-col gap-1">
                  <p className="text-slate-200 font-semibold">
                    Maximum Optimization Reached
                  </p>
                  <p className="text-slate-500 text-sm">
                    Your lifestyle habits currently perfectly buffer your
                    clinical baselines.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
