"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  BrainCircuit,
  Dumbbell,
  Loader2,
  Heart,
  ShieldCheck,
  ShieldAlert,
  Lightbulb,
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
}

export function MasterTab({ vitals }: MasterTabProps) {
  const [results, setResults] = useState({
    metabolic: { score: 0, status: "Analyzing...", insights: [] as string[] },
    stroke: { score: 0, status: "Analyzing...", insights: [] as string[] },
    recovery: { score: 0, status: "Analyzing...", insights: [] as string[] },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchAllData = async () => {
      setLoading(true);
        const apiUrl = "http://localhost:8000" || process.env.NEXT_PUBLIC_API_URL;

      try {
        // Fire all 3 API requests simultaneously
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
          setResults({
            metabolic: {
              score: metabolicData.vitalsguard_score || 0,
              status: metabolicData.predicted_category || "Unknown",
              insights: metabolicData.actionable_insights || [],
            },
            stroke: {
              score: strokeData.vitalsguard_score || 0,
              status: strokeData.risk_level || "Unknown",
              insights: strokeData.actionable_insights || [],
            },
            recovery: {
              score: recoveryData.injury_probability || 0,
              status: recoveryData.injury_risk || "Unknown",
              insights: recoveryData.actionable_insights || [],
            },
          });
        }
      } catch (err) {
        console.error("Failed to fetch master data", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const timeout = setTimeout(fetchAllData, 600);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [vitals]);

  // Aggregate Insights (Take top 2 from each category to avoid overwhelming the user)
  const unifiedInsights = [
    ...results.metabolic.insights
      .slice(0, 2)
      .map((i) => ({ text: i, type: "Metabolic", color: "bg-blue-500" })),
    ...results.stroke.insights
      .slice(0, 2)
      .map((i) => ({ text: i, type: "Vascular", color: "bg-red-500" })),
    ...results.recovery.insights
      .slice(0, 2)
      .map((i) => ({ text: i, type: "Recovery", color: "bg-yellow-500" })),
  ];

  // Radar Chart Data mapped to Risk (Higher = Worse)
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
      subject: "Lifestyle Deficit",
      A: Math.max(
        0,
        100 - ((vitals.sleepHours / 8) * 50 + (vitals.dailySteps / 10000) * 50),
      ),
      fullMark: 100,
    },
  ];

  const getStatusColor = (score: number) => {
    if (score >= 60) return "text-red-600 bg-red-50 border-red-200";
    if (score >= 30) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Row: The Three Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Metabolic Health",
            icon: Activity,
            data: results.metabolic,
          },
          {
            title: "Cerebrovascular",
            icon: BrainCircuit,
            data: results.stroke,
          },
          {
            title: "Physical Recovery",
            icon: Dumbbell,
            data: results.recovery,
          },
        ].map((pillar, idx) => (
          <Card
            key={idx}
            className={`border-2 transition-all duration-500 relative overflow-hidden ${getStatusColor(pillar.data.score)}`}
          >
            {loading && (
              <div className="absolute inset-0 bg-white/40 z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-500" />
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wider flex items-center gap-2">
                <pillar.icon className="h-4 w-4" /> {pillar.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-bold font-mono">
                    {pillar.data.score.toFixed(1)}%
                  </div>
                  <div className="text-xs font-semibold uppercase mt-1 opacity-80">
                    Risk Score
                  </div>
                </div>
                <Badge className="bg-white/80 text-current hover:bg-white border-current">
                  {pillar.data.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Row: Radar & Unified Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-indigo-600" /> Holistic
              Vulnerability Map
            </CardTitle>
            <CardDescription>
              Visualizing systemic risk across all parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#64748b", fontSize: 12 }}
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

        {/* Unified Insights Master List */}
        <Card className="lg:col-span-7 bg-slate-900 text-white border-none">
          <CardHeader className="pb-3 pt-6">
            <CardTitle className="text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-400" /> Master Engine
              Insights
            </CardTitle>
            <CardDescription className="text-slate-500">
              Prioritized interventions based on your complete unified profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-3 text-slate-400 py-4">
                <Loader2 className="h-5 w-5 animate-spin" /> Synthesizing
                holistic plan...
              </div>
            ) : unifiedInsights.length > 0 ? (
              <ul className="space-y-4">
                {unifiedInsights.map((insight, i) => (
                  <li
                    key={i}
                    className="flex gap-4 items-start bg-slate-800/50 p-3 rounded-lg border border-slate-700/50"
                  >
                    <span
                      className={`mt-1 flex h-2 w-2 shrink-0 rounded-full ${insight.color}`}
                    />
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {insight.type} Model
                      </span>
                      <span className="text-sm leading-relaxed text-slate-200">
                        {insight.text}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                <ShieldCheck className="h-10 w-10 text-green-500" />
                <p className="text-slate-300 font-medium">
                  All systems are heavily optimized.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
