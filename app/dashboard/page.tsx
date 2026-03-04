"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard-header";
import { DiabetesTab } from "@/components/diabetes-tab";
import { StrokeTab } from "@/components/stroke-tab";
import { RecoveryTab } from "@/components/recovery-tab";
import { MasterTab } from "@/components/master-tab";
import {
  Activity,
  BrainCircuit,
  Dumbbell,
  Users,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Siren,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// 1. METABOLIC SCENARIOS
// ---------------------------------------------------------------------------
const METABOLIC_SCENARIOS = [
  {
    id: "optimal_metabolic",
    name: "The Optimal Baseline",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-100",
    description:
      "Highly active, perfect clinical labs. Tests the model's baseline for 'Healthy' classification.",
    data: {
      age: 28,
      bmi: 21.5,
      glucose: 82,
      bloodPressure: 79,
      insulin: 12,
      skinThickness: 15,
      pregnancies: 0,
      diabetesPedigree: 0.15,
      hypertension: 0,
      heartDisease: 0,
      smokingStatus: "never smoked",
      dailySteps: 14000,
      sleepHours: 8.5,
      hydrationLiters: 3.5,
      stressLevel: 2,
      restingHeartRate: 50,
      trainingIntensity: 7,
    },
  },
  {
    id: "exec",
    name: "High-Stress Executive",
    icon: AlertTriangle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    description:
      "Normal labs, but dangerously sedentary and high stress. Tests the 'Elevated (Behavioral)' early warning system.",
    data: {
      age: 45,
      bmi: 26.5,
      glucose: 95,
      bloodPressure: 125,
      insulin: 18,
      skinThickness: 22,
      pregnancies: 0,
      diabetesPedigree: 0.3,
      hypertension: 0,
      heartDisease: 0,
      smokingStatus: "formerly smoked",
      dailySteps: 2500,
      sleepHours: 4.5,
      hydrationLiters: 1.2,
      stressLevel: 9,
      restingHeartRate: 75,
      trainingIntensity: 5,
    },
  },
  {
    id: "clinical_shift",
    name: "Chronic Clinical Shift",
    icon: HeartPulse,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    description:
      "Active lifestyle, but genetics/age are forcing labs into pre-diabetic thresholds. Tests 'Moderate (Medical)' priority.",
    data: {
      age: 58,
      bmi: 31.0,
      glucose: 145,
      bloodPressure: 140,
      insulin: 95,
      skinThickness: 30,
      pregnancies: 2,
      diabetesPedigree: 0.85,
      hypertension: 1,
      heartDisease: 0,
      smokingStatus: "never smoked",
      dailySteps: 8500,
      sleepHours: 6.5,
      hydrationLiters: 2.0,
      stressLevel: 5,
      restingHeartRate: 68,
      trainingIntensity: 4,
    },
  },
  {
    id: "emergency",
    name: "The Perfect Storm",
    icon: Siren,
    color: "text-red-600",
    bgColor: "bg-red-100",
    description:
      "Severe compounding of morbid obesity, high glucose, and zero activity. Triggers 'Critical Risk'.",
    data: {
      age: 68,
      bmi: 38.5,
      glucose: 195,
      bloodPressure: 165,
      insulin: 150,
      skinThickness: 45,
      pregnancies: 3,
      diabetesPedigree: 1.2,
      hypertension: 1,
      heartDisease: 1,
      smokingStatus: "smokes",
      dailySteps: 1200,
      sleepHours: 4.0,
      hydrationLiters: 0.8,
      stressLevel: 10,
      restingHeartRate: 88,
      trainingIntensity: 2,
    },
  },
];

// ---------------------------------------------------------------------------
// 2. STROKE SCENARIOS
// ---------------------------------------------------------------------------
const STROKE_SCENARIOS = [
  {
    id: "optimal_stroke",
    name: "Vascular Integrity",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-100",
    description:
      "Young, highly active, non-smoker with perfect clinical labs. Tests the model's baseline for 'Low Risk'.",
    data: {
      age: 32,
      bmi: 22.0,
      glucose: 85,
      bloodPressure: 110,
      insulin: 12,
      skinThickness: 15,
      pregnancies: 0,
      diabetesPedigree: 0.15,
      hypertension: 0,
      heartDisease: 0,
      smokingStatus: "never smoked",
      dailySteps: 12000,
      sleepHours: 8.0,
      hydrationLiters: 3.0,
      stressLevel: 3,
      restingHeartRate: 55,
      trainingIntensity: 7,
    },
  },
  {
    id: "sedentary_smoker",
    name: "The Sedentary Smoker",
    icon: AlertTriangle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    description:
      "Middle-aged with normal BMI/Glucose, but currently smokes and is highly sedentary. Tests behavioral vascular stress.",
    data: {
      age: 48,
      bmi: 25.5,
      glucose: 105,
      bloodPressure: 125,
      insulin: 18,
      skinThickness: 22,
      pregnancies: 0,
      diabetesPedigree: 0.3,
      hypertension: 0,
      heartDisease: 0,
      smokingStatus: "smokes",
      dailySteps: 2500,
      sleepHours: 5.5,
      hydrationLiters: 1.5,
      stressLevel: 7,
      restingHeartRate: 72,
      trainingIntensity: 3,
    },
  },
  {
    id: "unmanaged_bp",
    name: "Unmanaged Hypertension",
    icon: HeartPulse,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    description:
      "Older patient with chronic high blood pressure and climbing glucose. Tests sensitivity to clinical aging factors.",
    data: {
      age: 62,
      bmi: 29.0,
      glucose: 135,
      bloodPressure: 145,
      insulin: 45,
      skinThickness: 28,
      pregnancies: 2,
      diabetesPedigree: 0.6,
      hypertension: 1,
      heartDisease: 0,
      smokingStatus: "formerly smoked",
      dailySteps: 6000,
      sleepHours: 6.0,
      hydrationLiters: 2.2,
      stressLevel: 6,
      restingHeartRate: 78,
      trainingIntensity: 4,
    },
  },
  {
    id: "ischemic_crisis",
    name: "The Ischemic Crisis",
    icon: Siren,
    color: "text-red-600",
    bgColor: "bg-red-100",
    description:
      "Severe compounding of advanced age, prior heart disease, active smoking, and high glucose. Triggers critical alerts.",
    data: {
      age: 75,
      bmi: 34.0,
      glucose: 190,
      bloodPressure: 160,
      insulin: 120,
      skinThickness: 35,
      pregnancies: 3,
      diabetesPedigree: 0.9,
      hypertension: 1,
      heartDisease: 1,
      smokingStatus: "smokes",
      dailySteps: 1500,
      sleepHours: 4.5,
      hydrationLiters: 1.0,
      stressLevel: 9,
      restingHeartRate: 88,
      trainingIntensity: 1,
    },
  },
];

// ---------------------------------------------------------------------------
// 3. ATHLETIC SCENARIOS
// ---------------------------------------------------------------------------
const ATHLETIC_SCENARIOS = [
  {
    id: "peaking",
    name: "The Peaking Athlete",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-100",
    description:
      "Perfectly recovered (9hrs sleep, high hydration). Cleared for high training intensity.",
    data: {
      age: 24,
      bmi: 22.0,
      glucose: 85,
      bloodPressure: 110,
      insulin: 10,
      skinThickness: 12,
      pregnancies: 0,
      diabetesPedigree: 0.2,
      hypertension: 0,
      heartDisease: 0,
      smokingStatus: "never smoked",
      dailySteps: 15000,
      sleepHours: 9.0,
      hydrationLiters: 4.0,
      stressLevel: 2,
      restingHeartRate: 48,
      trainingIntensity: 7,
    },
  },
  {
    id: "overtrained",
    name: "The Overtrained Competitor",
    icon: AlertTriangle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    description:
      "Decent sleep, but accumulated central nervous system stress is high. Pushing intensity today will spike injury risk.",
    data: {
      age: 29,
      bmi: 24.5,
      glucose: 92,
      bloodPressure: 120,
      insulin: 14,
      skinThickness: 15,
      pregnancies: 0,
      diabetesPedigree: 0.3,
      hypertension: 0,
      heartDisease: 0,
      smokingStatus: "never smoked",
      dailySteps: 12000,
      sleepHours: 6.5,
      hydrationLiters: 2.5,
      stressLevel: 7,
      restingHeartRate: 65,
      trainingIntensity: 8,
    },
  },
  {
    id: "weekend_warrior",
    name: "The Weekend Warrior",
    icon: Siren,
    color: "text-red-600",
    bgColor: "bg-red-100",
    description:
      "Poor sleep, dehydrated, and high life stress, but attempting a massive workout. High probability of acute injury.",
    data: {
      age: 42,
      bmi: 28.0,
      glucose: 105,
      bloodPressure: 130,
      insulin: 22,
      skinThickness: 24,
      pregnancies: 0,
      diabetesPedigree: 0.5,
      hypertension: 0,
      heartDisease: 0,
      smokingStatus: "formerly smoked",
      dailySteps: 6000,
      sleepHours: 4.5,
      hydrationLiters: 1.5,
      stressLevel: 8.5,
      restingHeartRate: 78,
      trainingIntensity: 9,
    },
  },
  {
    id: "active_recovery",
    name: "Smart Active Recovery",
    icon: Activity,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    description:
      "Under-recovered from a bad night's sleep, but smartly lowered workout intensity to 3/10. Model clears them to train but still has a moderate probability.",
    data: {
      age: 35,
      bmi: 25.0,
      glucose: 90,
      bloodPressure: 115,
      insulin: 15,
      skinThickness: 18,
      pregnancies: 1,
      diabetesPedigree: 0.4,
      hypertension: 0,
      heartDisease: 0,
      smokingStatus: "never smoked",
      dailySteps: 8000,
      sleepHours: 4.0,
      hydrationLiters: 2.0,
      stressLevel: 6,
      restingHeartRate: 68,
      trainingIntensity: 3,
    },
  },
];

// ---------------------------------------------------------------------------
// 4. MASTER SCENARIOS (Holistic Overviews)
// ---------------------------------------------------------------------------
const MASTER_SCENARIOS = [
  {
    id: "holistic_healthy",
    name: "Holistic Optimization",
    icon: Sparkles,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    description:
      "A 360-degree view of a patient whose clinical baselines and lifestyle habits are completely dialed in.",
    data: METABOLIC_SCENARIOS[0].data, // Reuse the optimal data
  },
  {
    id: "holistic_burnout",
    name: "Systemic Burnout",
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    description:
      "Shows how severe lifestyle deficits (sleep, stress, hydration) negatively cascade across all three medical models simultaneously.",
    data: METABOLIC_SCENARIOS[1].data,
  },
  {
    id: "holistic_critical",
    name: "Multi-System Failure",
    icon: Siren,
    color: "text-red-600",
    bgColor: "bg-red-100",
    description:
      "A dangerous combination of clinical disease markers and terrible behavioral habits. Red alerts across the board.",
    data: METABOLIC_SCENARIOS[3].data,
  },
];

export default function Page() {
  const [activeTab, setActiveTab] = useState("diabetes");

  // Determine which scenario list to show based on the active tab
  let activeScenarios = METABOLIC_SCENARIOS;
  if (activeTab === "stroke") activeScenarios = STROKE_SCENARIOS;
  if (activeTab === "recovery") activeScenarios = ATHLETIC_SCENARIOS;
  if (activeTab === "master") activeScenarios = MASTER_SCENARIOS;

  const [activeScenarioId, setActiveScenarioId] = useState(
    METABOLIC_SCENARIOS[0].id,
  );

  // The unified state that gets passed to whichever tab is currently open
  const [vitals, setVitals] = useState(METABOLIC_SCENARIOS[0].data);

  const handleApplyScenario = (scenario: any) => {
    setActiveScenarioId(scenario.id);
    setVitals(scenario.data);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // Auto-select the first scenario of the new group so the context shifts instantly
    let newScenarios = METABOLIC_SCENARIOS;
    if (value === "stroke") newScenarios = STROKE_SCENARIOS;
    if (value === "recovery") newScenarios = ATHLETIC_SCENARIOS;
    if (value === "master") newScenarios = MASTER_SCENARIOS;

    handleApplyScenario(newScenarios[0]);
  };

  const getSidebarTitle = () => {
    if (activeTab === "recovery") return "Athletic Profiles";
    if (activeTab === "stroke") return "Cerebrovascular Profiles";
    if (activeTab === "master") return "Holistic Profiles";
    return "Metabolic Profiles";
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <DashboardHeader />

      <main className="flex-1 px-4 py-6 md:px-6 lg:px-8 max-w-[1600px] mx-auto w-full flex flex-col lg:flex-row gap-6">
        {/* LEFT SIDEBAR: Context-Aware Scenario Picker */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                {getSidebarTitle()}
              </CardTitle>
              <CardDescription>
                Select a baseline profile to inject into the simulation engine.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {activeScenarios.map((scenario) => {
                const isActive = activeScenarioId === scenario.id;
                const Icon = scenario.icon;
                return (
                  <div
                    key={scenario.id}
                    onClick={() => handleApplyScenario(scenario)}
                    className={`
                      cursor-pointer rounded-lg border p-3 transition-all duration-200
                      ${isActive ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-sm" : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"}
                    `}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${scenario.bgColor}`}>
                          <Icon className={`h-4 w-4 ${scenario.color}`} />
                        </div>
                        <span
                          className={`font-semibold text-sm ${isActive ? "text-blue-900" : "text-slate-700"}`}
                        >
                          {scenario.name}
                        </span>
                      </div>
                      {isActive && (
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-[10px] px-1.5"
                        >
                          ACTIVE
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed pl-9">
                      {scenario.description}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT CONTENT: The AI Tabs */}
        <div className="flex-1 min-w-0">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="mb-6 h-11 w-full max-w-3xl bg-white border shadow-sm">
              <TabsTrigger
                value="recovery"
                className="gap-1.5 px-4 data-[state=active]:bg-slate-100"
              >
                <Dumbbell className="h-4 w-4" />
                <span className="hidden sm:inline">Athletic Injury</span>
                <span className="sm:hidden">Injury</span>
              </TabsTrigger>
              <TabsTrigger
                value="diabetes"
                className="gap-1.5 px-4 data-[state=active]:bg-slate-100"
              >
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Metabolic Risk</span>
                <span className="sm:hidden">Metabolic</span>
              </TabsTrigger>
              <TabsTrigger
                value="stroke"
                className="gap-1.5 px-4 data-[state=active]:bg-slate-100"
              >
                <BrainCircuit className="h-4 w-4" />
                <span className="hidden sm:inline">Stroke Assessor</span>
                <span className="sm:hidden">Stroke</span>
              </TabsTrigger>

              <TabsTrigger
                value="master"
                className="gap-1.5 px-4 data-[state=active]:bg-slate-100"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Master Overview</span>
                <span className="sm:hidden">Overview</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="recovery" className="mt-0 outline-none">
              <RecoveryTab vitals={vitals} onVitalsChange={setVitals as any} />
            </TabsContent>

            <TabsContent value="stroke" className="mt-0 outline-none">
              <StrokeTab vitals={vitals} onVitalsChange={setVitals as any} />
            </TabsContent>

            <TabsContent value="diabetes" className="mt-0 outline-none">
              <DiabetesTab vitals={vitals} onVitalsChange={setVitals as any} />
            </TabsContent>

            <TabsContent value="master" className="mt-0 outline-none">
              <MasterTab
                vitals={vitals}
                onVitalsChange={setVitals} // <-- Fixed!
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-4 mt-auto">
        <p className="text-center text-xs text-slate-500 font-medium tracking-wide">
          VitalsGuard Clinical Engine &mdash; Not a substitute for clinical
          judgment.
        </p>
      </footer>
    </div>
  );
}
