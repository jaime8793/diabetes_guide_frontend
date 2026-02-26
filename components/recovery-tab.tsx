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
} from "lucide-react";

export interface RecoveryData {
  sleepQuality: number;
  stressLevel: number;
  restingHeartRate: number;
  hydrationLevel: number;
  trainingIntensity: number;
}

interface RecoveryTabProps {
  data: RecoveryData;
  onDataChange: (data: RecoveryData) => void;
}

function computeRecoveryScore(data: RecoveryData) {
  // Sleep quality (1-10): higher = better recovery. Normalized to 0-30
  const sleepScore = (data.sleepQuality / 10) * 30;

  // Stress level (1-10): lower = better recovery. Normalized to 0-25
  const stressScore = ((10 - data.stressLevel) / 9) * 25;

  // Resting heart rate (40-100 bpm): lower = better recovery. Normalized to 0-15
  const hrNormalized = Math.max(
    0,
    Math.min(1, (100 - data.restingHeartRate) / 60),
  );
  const hrScore = hrNormalized * 15;

  // Hydration level (0-100%): higher = better. Normalized to 0-15
  const hydrationScore = (data.hydrationLevel / 100) * 15;

  // Training intensity (1-10): moderate is best (5-6), extremes reduce recovery. Normalized to 0-15
  const intensityDiff = Math.abs(data.trainingIntensity - 5.5);
  const intensityScore = Math.max(0, 15 - intensityDiff * 3);

  const total = Math.round(
    sleepScore + stressScore + hrScore + hydrationScore + intensityScore,
  );
  return Math.max(0, Math.min(100, total));
}

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

function computeInjuryRisk(data: RecoveryData) {
  // Injury risk increases with: high stress, poor sleep, high training intensity, low hydration, high HR
  let risk = 0;
  risk += Math.max(0, (data.stressLevel - 5) * 8); // stress above 5 contributes
  risk += Math.max(0, (6 - data.sleepQuality) * 7); // sleep below 6 contributes
  risk += Math.max(0, (data.trainingIntensity - 7) * 10); // intensity above 7 contributes
  risk += Math.max(0, (50 - data.hydrationLevel) * 0.4); // hydration below 50% contributes
  risk += Math.max(0, (data.restingHeartRate - 75) * 0.8); // HR above 75 contributes

  return Math.max(0, Math.min(100, Math.round(risk)));
}

function getInjuryStatus(risk: number) {
  if (risk < 35) return { status: "Safe to Train", safe: true };
  if (risk < 60) return { status: "Train with Caution", safe: false };
  return { status: "High Risk of Injury", safe: false };
}

function getCoachRecommendations(
  data: RecoveryData,
  recoveryScore: number,
  injuryRisk: number,
) {
  const recs: string[] = [];

  // Sleep-based recommendations
  if (data.sleepQuality <= 4) {
    recs.push(
      "Your sleep quality is critically low. Prioritize 8+ hours of sleep tonight. Consider eliminating screens 1 hour before bed and maintaining a cool, dark sleep environment.",
    );
  } else if (data.sleepQuality <= 6) {
    recs.push(
      "Sleep quality is below optimal. Try implementing a consistent sleep schedule and avoid caffeine after 2 PM to improve recovery.",
    );
  }

  // Stress-based recommendations
  if (data.stressLevel >= 8) {
    recs.push(
      "Stress levels are very high. Incorporate 15-20 minutes of guided meditation or breathing exercises. Consider reducing training volume by 30% today.",
    );
  } else if (data.stressLevel >= 6) {
    recs.push(
      "Moderate-to-high stress detected. Light yoga, a walk in nature, or foam rolling can help lower cortisol levels before training.",
    );
  }

  // Heart rate recommendations
  if (data.restingHeartRate > 80) {
    recs.push(
      "Resting heart rate is elevated, suggesting incomplete recovery or heightened sympathetic activity. Consider an active recovery day instead of high-intensity work.",
    );
  } else if (data.restingHeartRate > 70) {
    recs.push(
      "Resting heart rate is slightly elevated. Warm up thoroughly and monitor perceived exertion during training.",
    );
  }

  // Hydration recommendations
  if (data.hydrationLevel < 40) {
    recs.push(
      "Hydration is critically low. Drink at least 500ml of water with electrolytes immediately. Avoid intense exercise until hydration levels improve.",
    );
  } else if (data.hydrationLevel < 60) {
    recs.push(
      "Hydration is below optimal. Aim for consistent water intake throughout the day. Consider adding electrolytes to your pre-workout routine.",
    );
  }

  // Training intensity recommendations
  if (data.trainingIntensity >= 9 && recoveryScore < 60) {
    recs.push(
      "Training intensity is very high relative to your recovery state. This significantly increases injury risk. Scale back to 60-70% effort today.",
    );
  } else if (data.trainingIntensity >= 8) {
    recs.push(
      "High training intensity planned. Ensure adequate warm-up (15+ minutes), and plan for extended cool-down and post-session stretching.",
    );
  }

  // Overall recovery recommendation
  if (recoveryScore >= 80) {
    recs.push(
      "Recovery score is excellent. You are cleared for high-intensity training. Push your limits today and capitalize on this recovery window.",
    );
  } else if (recoveryScore < 30) {
    recs.push(
      "Recovery score is critically low. Strongly recommend a full rest day or very light active recovery (walk, gentle swim). Prioritize sleep and nutrition.",
    );
  }

  // Injury risk summary
  if (injuryRisk >= 60) {
    recs.push(
      "Injury risk is elevated. If you must train, focus on technique-based drills at low intensity. Avoid explosive movements, heavy loads, and plyometrics.",
    );
  }

  if (recs.length === 0) {
    recs.push(
      "All metrics are within healthy ranges. You are in good shape to train at moderate-to-high intensity. Listen to your body and adjust as needed.",
    );
  }

  return recs;
}

export function RecoveryTab({ data, onDataChange }: RecoveryTabProps) {
  const recoveryScore = useMemo(() => computeRecoveryScore(data), [data]);
  const recoveryColor = useMemo(
    () => getRecoveryColor(recoveryScore),
    [recoveryScore],
  );
  const recoveryLabel = useMemo(
    () => getRecoveryLabel(recoveryScore),
    [recoveryScore],
  );
  const injuryRisk = useMemo(() => computeInjuryRisk(data), [data]);
  const injuryStatus = useMemo(() => getInjuryStatus(injuryRisk), [injuryRisk]);
  const recommendations = useMemo(
    () => getCoachRecommendations(data, recoveryScore, injuryRisk),
    [data, recoveryScore, injuryRisk],
  );

  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset =
    circumference - (recoveryScore / 100) * circumference;

  const sliderConfigs = [
    {
      key: "sleepQuality" as const,
      label: "Sleep Quality",
      icon: Moon,
      min: 1,
      max: 10,
      unit: "/ 10",
      description: "Rate your sleep quality from last night",
    },
    {
      key: "stressLevel" as const,
      label: "Stress Level",
      icon: Brain,
      min: 1,
      max: 10,
      unit: "/ 10",
      description: "Current perceived stress level",
    },
    {
      key: "restingHeartRate" as const,
      label: "Resting Heart Rate",
      icon: HeartPulse,
      min: 40,
      max: 100,
      unit: "bpm",
      description: "Measured upon waking",
    },
    {
      key: "hydrationLevel" as const,
      label: "Hydration Level",
      icon: Droplets,
      min: 0,
      max: 100,
      unit: "%",
      description: "Estimated daily hydration status",
    },
    {
      key: "trainingIntensity" as const,
      label: "Training Intensity",
      icon: Flame,
      min: 1,
      max: 10,
      unit: "/ 10",
      description: "Planned workout intensity",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left: Daily Wearable Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Watch className="h-5 w-5 text-primary" />
            Daily Wearable Sync
          </CardTitle>
          <CardDescription>
            Sync your wearable device metrics for AI-powered recovery analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {sliderConfigs.map(
            ({ key, label, icon: Icon, min, max, unit, description }) => (
              <div key={key} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {label}
                    </label>
                    <span className="text-xs text-muted-foreground pl-6">
                      {description}
                    </span>
                  </div>
                  <span className="text-sm font-mono font-semibold text-primary tabular-nums">
                    {data[key]}{" "}
                    <span className="text-xs text-muted-foreground font-normal">
                      {unit}
                    </span>
                  </span>
                </div>
                <Slider
                  min={min}
                  max={max}
                  step={1}
                  value={[data[key]]}
                  onValueChange={([val]) =>
                    onDataChange({ ...data, [key]: val })
                  }
                />
              </div>
            ),
          )}

          {/* Sync status indicator */}
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-clinical-safe animate-pulse" />
            <span className="text-xs text-muted-foreground">
              Wearable data synced &mdash; Last updated: Today, 7:32 AM
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Right: Visual outputs */}
      <div className="flex flex-col gap-6">
        {/* AI Recovery Score Circle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Recovery Score
            </CardTitle>
            <CardDescription>
              Computed from sleep quality and stress metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 py-4">
            <div className="relative">
              <svg
                width="200"
                height="200"
                viewBox="0 0 200 200"
                className="-rotate-90"
              >
                {/* Background track */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  strokeWidth="14"
                  className="stroke-muted"
                />
                {/* Score arc */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className={`transition-all duration-700 ease-out ${
                    recoveryColor === "clinical-safe"
                      ? "stroke-clinical-safe"
                      : recoveryColor === "clinical-warning"
                        ? "stroke-clinical-warning"
                        : "stroke-clinical-danger"
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold font-mono text-card-foreground">
                  {recoveryScore}%
                </span>
                <span
                  className={`text-sm font-semibold ${
                    recoveryColor === "clinical-safe"
                      ? "text-clinical-safe"
                      : recoveryColor === "clinical-warning"
                        ? "text-clinical-warning"
                        : "text-clinical-danger"
                  }`}
                >
                  {recoveryLabel}
                </span>
              </div>
            </div>

            {/* Score breakdown mini badges */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Moon className="mr-1 h-3 w-3" />
                {"Sleep: "}
                {data.sleepQuality}
                {"/10"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Brain className="mr-1 h-3 w-3" />
                {"Stress: "}
                {data.stressLevel}
                {"/10"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <HeartPulse className="mr-1 h-3 w-3" />
                {"HR: "}
                {data.restingHeartRate}
                {" bpm"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Injury Risk Predictor Alert */}
        <Card
          className={`border-2 transition-colors duration-500 ${
            injuryStatus.safe
              ? "border-clinical-safe/40"
              : injuryRisk >= 60
                ? "border-clinical-danger/40"
                : "border-clinical-warning/40"
          }`}
        >
          <CardContent className="flex items-center gap-4 py-5 px-6">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-colors duration-500 ${
                injuryStatus.safe
                  ? "bg-clinical-safe/15"
                  : injuryRisk >= 60
                    ? "bg-clinical-danger/15"
                    : "bg-clinical-warning/15"
              }`}
            >
              {injuryStatus.safe ? (
                <ShieldCheck className="h-7 w-7 text-clinical-safe" />
              ) : (
                <ShieldAlert
                  className={`h-7 w-7 ${
                    injuryRisk >= 60
                      ? "text-clinical-danger"
                      : "text-clinical-warning"
                  }`}
                />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Injury Risk Predictor
                </span>
                <Badge
                  className={`text-xs ${
                    injuryStatus.safe
                      ? "bg-clinical-safe text-white"
                      : injuryRisk >= 60
                        ? "bg-clinical-danger text-white"
                        : "bg-clinical-warning text-foreground"
                  }`}
                >
                  {injuryRisk}% Risk
                </Badge>
              </div>
              <span
                className={`text-lg font-bold ${
                  injuryStatus.safe
                    ? "text-clinical-safe"
                    : injuryRisk >= 60
                      ? "text-clinical-danger"
                      : "text-clinical-warning"
                }`}
              >
                {injuryStatus.status}
              </span>
              <span className="text-xs text-muted-foreground">
                {injuryStatus.safe
                  ? "All recovery metrics support safe training today."
                  : injuryRisk >= 60
                    ? "Multiple risk factors detected. Rest or light activity recommended."
                    : "Some risk factors present. Modify training intensity accordingly."}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Coach Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Dumbbell className="h-5 w-5 text-primary" />
              Personalized Coach Recommendations
            </CardTitle>
            <CardDescription>
              AI-generated guidance based on your current metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <Textarea
                readOnly
                value={recommendations
                  .map((r, i) => `${i + 1}. ${r}`)
                  .join("\n\n")}
                className="min-h-40 resize-none border-0 bg-transparent p-0 text-sm text-card-foreground leading-relaxed shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Recommendations update dynamically as you adjust your metrics
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
