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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BrainCircuit,
  HeartPulse,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface StrokeTabProps {
  data: {
    age: number;
    avgGlucose: number;
    bmi: number;
    hypertension: boolean;
    heartDisease: boolean;
    smokingStatus: string;
  };
  onDataChange: (data: StrokeTabProps["data"]) => void;
}

function computeStrokeRisk(data: StrokeTabProps["data"]) {
  let risk = 0;
  risk += Math.min(data.age / 80, 1) * 20;
  risk += Math.min(data.avgGlucose / 300, 1) * 25;
  risk += Math.min(Math.max(data.bmi - 18.5, 0) / 21.5, 1) * 10;
  if (data.hypertension) risk += 15;
  if (data.heartDisease) risk += 15;
  if (data.smokingStatus === "smokes") risk += 12;
  else if (data.smokingStatus === "formerly_smoked") risk += 6;
  return Math.min(Math.round(risk * 10) / 10, 99);
}

function getVitalsGuardScore(probability: number) {
  if (probability < 10)
    return { score: "A", label: "Excellent", color: "clinical-safe" };
  if (probability < 25)
    return { score: "B", label: "Good", color: "clinical-safe" };
  if (probability < 45)
    return { score: "C", label: "Fair", color: "clinical-warning" };
  if (probability < 65)
    return { score: "D", label: "At Risk", color: "clinical-danger" };
  return { score: "F", label: "Critical", color: "clinical-danger" };
}

function getActionItems(data: StrokeTabProps["data"], probability: number) {
  const items: { label: string; checked: boolean }[] = [];
  items.push({
    label: "Annual comprehensive blood panel",
    checked: probability < 30,
  });
  items.push({
    label: "Blood pressure monitoring (bi-weekly)",
    checked: !data.hypertension,
  });
  items.push({
    label: "Cardiac stress test",
    checked: !data.heartDisease && probability < 40,
  });
  items.push({
    label: "Smoking cessation program referral",
    checked: data.smokingStatus === "never_smoked",
  });
  items.push({ label: "Lipid profile assessment", checked: probability < 20 });
  items.push({ label: "Carotid artery ultrasound", checked: probability < 15 });
  return items;
}

export function StrokeTab({ data, onDataChange }: StrokeTabProps) {
  const probability = useMemo(() => computeStrokeRisk(data), [data]);
  const vgScore = useMemo(
    () => getVitalsGuardScore(probability),
    [probability],
  );
  const actionItems = useMemo(
    () => getActionItems(data, probability),
    [data, probability],
  );

  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (probability / 100) * circumference;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left: Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <BrainCircuit className="h-5 w-5 text-primary" />
            Stroke Risk Inputs
          </CardTitle>
          <CardDescription>Enter cardiovascular risk factors</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Age */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-card-foreground">
                Age
              </label>
              <span className="text-sm font-mono font-semibold text-primary">
                {data.age}{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  years
                </span>
              </span>
            </div>
            <Slider
              min={18}
              max={90}
              value={[data.age]}
              onValueChange={([val]) => onDataChange({ ...data, age: val })}
            />
          </div>

          {/* Average Glucose */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-card-foreground">
                Average Glucose Level
              </label>
              <span className="text-sm font-mono font-semibold text-primary">
                {data.avgGlucose}{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  mg/dL
                </span>
              </span>
            </div>
            <Slider
              min={50}
              max={300}
              value={[data.avgGlucose]}
              onValueChange={([val]) =>
                onDataChange({ ...data, avgGlucose: val })
              }
            />
          </div>

          {/* BMI */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-card-foreground">
                BMI
              </label>
              <span className="text-sm font-mono font-semibold text-primary">
                {data.bmi.toFixed(1)}{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  {"kg/m\u00B2"}
                </span>
              </span>
            </div>
            <Slider
              min={15}
              max={45}
              step={0.1}
              value={[data.bmi]}
              onValueChange={([val]) => onDataChange({ ...data, bmi: val })}
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-card-foreground">
                Hypertension
              </label>
              <Switch
                checked={data.hypertension}
                onCheckedChange={(checked) =>
                  onDataChange({ ...data, hypertension: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-card-foreground">
                Heart Disease
              </label>
              <Switch
                checked={data.heartDisease}
                onCheckedChange={(checked) =>
                  onDataChange({ ...data, heartDisease: checked })
                }
              />
            </div>
          </div>

          {/* Smoking Status */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-card-foreground">
              Smoking Status
            </label>
            <Select
              value={data.smokingStatus}
              onValueChange={(val) =>
                onDataChange({ ...data, smokingStatus: val })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never_smoked">Never Smoked</SelectItem>
                <SelectItem value="formerly_smoked">Formerly Smoked</SelectItem>
                <SelectItem value="smokes">Currently Smokes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Right: Outputs */}
      <div className="flex flex-col gap-6">
        {/* Probability Gauge */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <HeartPulse className="h-5 w-5 text-primary" />
              Stroke Probability Gauge
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-4">
            <div className="relative">
              <svg
                width="180"
                height="180"
                viewBox="0 0 180 180"
                className="-rotate-90"
              >
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="none"
                  strokeWidth="12"
                  className="stroke-muted"
                />
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="none"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className={`transition-all duration-700 ${
                    probability < 20
                      ? "stroke-clinical-safe"
                      : probability < 50
                        ? "stroke-clinical-warning"
                        : "stroke-clinical-danger"
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold font-mono text-card-foreground">
                  {probability}%
                </span>
                <span className="text-xs text-muted-foreground">
                  Risk Score
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* VitalsGuard Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <ShieldCheck className="h-5 w-5 text-primary" />
              VitalsGuard Score
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-5">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-bold ${
                vgScore.color === "clinical-safe"
                  ? "bg-clinical-safe/15 text-clinical-safe"
                  : vgScore.color === "clinical-warning"
                    ? "bg-clinical-warning/15 text-clinical-warning"
                    : "bg-clinical-danger/15 text-clinical-danger"
              }`}
            >
              {vgScore.score}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-lg font-semibold text-card-foreground">
                {vgScore.label}
              </span>
              <span className="text-sm text-muted-foreground">
                {probability < 25
                  ? "Cardiovascular profile within acceptable parameters."
                  : probability < 50
                    ? "Some risk factors present. Monitor and review."
                    : "Elevated cardiovascular risk. Immediate intervention recommended."}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Medical Action Checklist
            </CardTitle>
            <CardDescription>
              Based on cardiovascular risk assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {actionItems.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm text-card-foreground"
                >
                  {item.checked ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-clinical-safe" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-clinical-danger" />
                  )}
                  <span
                    className={
                      item.checked ? "text-muted-foreground line-through" : ""
                    }
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
