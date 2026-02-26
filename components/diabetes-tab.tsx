"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Heart,
  TrendingUp,
  Footprints,
  Clock,
  Droplets,
  Brain,
} from "lucide-react";

interface DiabetesTabProps {
  vitals: {
    age: number;
    bmi: number;
    fastingGlucose: number;
    insulin: number;
    dailySteps: number;
    sedentaryMinutes: number;
  };
  onVitalsChange: (vitals: DiabetesTabProps["vitals"]) => void;
}

function computeRisk(vitals: DiabetesTabProps["vitals"]) {
  const glucoseScore = Math.min(vitals.fastingGlucose / 200, 1) * 35;
  const bmiScore = Math.min(Math.max(vitals.bmi - 18.5, 0) / 21.5, 1) * 20;
  const insulinScore = Math.min(vitals.insulin / 50, 1) * 15;
  const ageScore = Math.min(vitals.age / 80, 1) * 10;
  const stepsScore = (1 - Math.min(vitals.dailySteps / 12000, 1)) * 10;
  const sedentaryScore = Math.min(vitals.sedentaryMinutes / 600, 1) * 10;

  const totalRisk =
    glucoseScore +
    bmiScore +
    insulinScore +
    ageScore +
    stepsScore +
    sedentaryScore;
  const medicalRisk = glucoseScore + insulinScore + bmiScore;
  const behavioralRisk = stepsScore + sedentaryScore;

  let category: string;
  let color: string;

  if (totalRisk < 25) {
    category = "Low Risk";
    color = "clinical-safe";
  } else if (totalRisk < 50) {
    if (behavioralRisk > medicalRisk * 0.5) {
      category = "Elevated (Behavioral)";
      color = "clinical-warning";
    } else {
      category = "Moderate (Medical)";
      color = "clinical-warning";
    }
  } else if (totalRisk < 75) {
    category = "High Risk";
    color = "clinical-danger";
  } else {
    category = "Critical";
    color = "clinical-danger";
  }

  return { totalRisk: Math.round(totalRisk), category, color };
}

function getRecommendation(
  vitals: DiabetesTabProps["vitals"],
  risk: ReturnType<typeof computeRisk>,
) {
  const recs: string[] = [];
  if (vitals.fastingGlucose > 100)
    recs.push(
      "Fasting glucose is elevated. Consider HbA1c testing and dietary review.",
    );
  if (vitals.bmi > 30)
    recs.push(
      "BMI indicates obesity. Recommend structured weight management program.",
    );
  if (vitals.dailySteps < 5000)
    recs.push("Step count is low. Aim for at least 7,000-10,000 steps daily.");
  if (vitals.sedentaryMinutes > 360)
    recs.push(
      "Excessive sedentary time detected. Consider hourly movement breaks.",
    );
  if (vitals.insulin > 25)
    recs.push(
      "Insulin levels suggest possible insulin resistance. Further assessment recommended.",
    );
  if (recs.length === 0)
    recs.push(
      "All metabolic markers within healthy range. Continue current lifestyle.",
    );
  if (risk.totalRisk < 25)
    recs.push("Maintain regular check-ups every 6 months.");
  return recs;
}

export function DiabetesTab({ vitals, onVitalsChange }: DiabetesTabProps) {
  const risk = useMemo(() => computeRisk(vitals), [vitals]);
  const recommendations = useMemo(
    () => getRecommendation(vitals, risk),
    [vitals, risk],
  );

  const sliderConfigs = [
    {
      key: "age" as const,
      label: "Age",
      icon: Clock,
      min: 18,
      max: 90,
      unit: "years",
    },
    {
      key: "bmi" as const,
      label: "BMI",
      icon: TrendingUp,
      min: 15,
      max: 45,
      unit: "kg/m\u00B2",
      step: 0.1,
    },
    {
      key: "fastingGlucose" as const,
      label: "Fasting Glucose",
      icon: Droplets,
      min: 60,
      max: 200,
      unit: "mg/dL",
    },
    {
      key: "insulin" as const,
      label: "Insulin",
      icon: Heart,
      min: 0,
      max: 50,
      unit: "\u00B5IU/mL",
    },
    {
      key: "dailySteps" as const,
      label: "Daily Steps",
      icon: Footprints,
      min: 0,
      max: 20000,
      unit: "steps",
      step: 100,
    },
    {
      key: "sedentaryMinutes" as const,
      label: "Sedentary Minutes",
      icon: Clock,
      min: 0,
      max: 600,
      unit: "min",
      step: 10,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left: Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Heart className="h-5 w-5 text-primary" />
            Log Vitals
          </CardTitle>
          <CardDescription>
            Adjust patient metabolic and behavioral metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {sliderConfigs.map(
            ({ key, label, icon: Icon, min, max, unit, step }) => (
              <div key={key} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {label}
                  </label>
                  <span className="text-sm font-mono font-semibold text-primary">
                    {typeof vitals[key] === "number" && vitals[key] % 1 !== 0
                      ? vitals[key].toFixed(1)
                      : vitals[key]}{" "}
                    <span className="text-xs text-muted-foreground font-normal">
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

      {/* Right: Outputs */}
      <div className="flex flex-col gap-6">
        {/* Risk Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Brain className="h-5 w-5 text-primary" />
              Integrated Risk Category
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <Badge
                className={`px-3 py-1.5 text-sm font-semibold ${
                  risk.color === "clinical-safe"
                    ? "bg-clinical-safe text-white"
                    : risk.color === "clinical-warning"
                      ? "bg-clinical-warning text-foreground"
                      : "bg-clinical-danger text-white"
                }`}
              >
                {risk.category}
              </Badge>
              <span className="text-2xl font-bold font-mono text-card-foreground">
                {risk.totalRisk}%
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span>
                <span>Moderate</span>
                <span>High</span>
                <span>Critical</span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    risk.totalRisk < 25
                      ? "bg-clinical-safe"
                      : risk.totalRisk < 50
                        ? "bg-clinical-warning"
                        : "bg-clinical-danger"
                  }`}
                  style={{ width: `${risk.totalRisk}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-card-foreground">
              AI Recommendation
            </CardTitle>
            <CardDescription>
              Based on current vitals and risk assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {recommendations.map((rec, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-card-foreground leading-relaxed"
                >
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
