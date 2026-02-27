"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard-header";
import { DiabetesTab } from "@/components/diabetes-tab";
import { StrokeTab } from "@/components/stroke-tab";
import { RecoveryTab } from "@/components/recovery-tab";
import type { RecoveryData } from "@/components/recovery-tab";
import {
  Activity,
  BrainCircuit,
  Dumbbell,
  Users,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Siren,
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
// 1. METABOLIC SCENARIOS (For Diabetes Tab)
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
    diabetes: {
      age: 28,
      bmi: 21.5,
      glucose: 82,
      insulin: 12,
      bloodPressure: 70,
      skinThickness: 15,
      pregnancies: 0,
      diabetesPedigree: 0.15,
      dailySteps: 14000,
    },
    stroke: {
      age: 28,
      avgGlucose: 82,
      bmi: 21.5,
      hypertension: 0,
      heartDisease: 0,
      smokingStatus: "never_smoked",
      dailySteps: 14000,
    },
    recovery: {
      sleepQuality: 8.5,
      stressLevel: 2,
      restingHeartRate: 50,
      hydrationLevel: 90,
      trainingIntensity: 8,
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
    diabetes: {
      age: 45,
      bmi: 25.5,
      glucose: 95,
      insulin: 18,
      bloodPressure: 82,
      skinThickness: 22,
      pregnancies: 0,
      diabetesPedigree: 0.3,
      dailySteps: 1500,
    },
    stroke: {
      age: 45,
      avgGlucose: 95,
      bmi: 25.5,
      hypertension: 1,
      heartDisease: 0,
      smokingStatus: "formerly_smoked",
      dailySteps: 1500,
    },
    recovery: {
      sleepQuality: 5.0,
      stressLevel: 8,
      restingHeartRate: 72,
      hydrationLevel: 60,
      trainingIntensity: 3,
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
    diabetes: {
      age: 55,
      bmi: 31.0,
      glucose: 145,
      insulin: 95,
      bloodPressure: 92,
      skinThickness: 30,
      pregnancies: 2,
      diabetesPedigree: 0.85,
      dailySteps: 8500,
    },
    stroke: {
      age: 55,
      avgGlucose: 145,
      bmi: 31.0,
      hypertension: 1,
      heartDisease: 0,
      smokingStatus: "smokes",
      dailySteps: 8500,
    },
    recovery: {
      sleepQuality: 6.0,
      stressLevel: 6,
      restingHeartRate: 78,
      hydrationLevel: 55,
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
      "Severe compounding of morbid obesity, high glucose, and zero activity. Triggers 'Critical Risk' across all models.",
    diabetes: {
      age: 68,
      bmi: 38.5,
      glucose: 195,
      insulin: 150,
      bloodPressure: 105,
      skinThickness: 45,
      pregnancies: 3,
      diabetesPedigree: 1.2,
      dailySteps: 800,
    },
    stroke: {
      age: 68,
      avgGlucose: 195,
      bmi: 38.5,
      hypertension: 1,
      heartDisease: 1,
      smokingStatus: "smokes",
      dailySteps: 800,
    },
    recovery: {
      sleepQuality: 4.0,
      stressLevel: 9,
      restingHeartRate: 88,
      hydrationLevel: 40,
      trainingIntensity: 1,
    },
  },
];

// ---------------------------------------------------------------------------
// 2. STROKE SCENARIOS (For Stroke Tab)
// ---------------------------------------------------------------------------
const STROKE_SCENARIOS = [
  {
    id: "optimal_stroke",
    name: "The Optimal Baseline",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-100",
    description:
      "Young, highly active, non-smoker with perfect clinical labs. Tests the model's baseline for 'Low Risk'.",
    diabetes: {
      age: 32,
      bmi: 22.0,
      glucose: 85,
      insulin: 12,
      bloodPressure: 110,
      skinThickness: 15,
      pregnancies: 0,
      diabetesPedigree: 0.15,
      dailySteps: 12000,
    },
    stroke: {
      age: 32,
      avgGlucose: 85,
      bmi: 22.0,
      hypertension: 0,
      heartDisease: 0,
      smokingStatus: "never smoked",
      dailySteps: 12000,
    },
    recovery: {
      sleepQuality: 8.5,
      stressLevel: 2,
      restingHeartRate: 50,
      hydrationLevel: 90,
      trainingIntensity: 8,
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
    diabetes: {
      age: 48,
      bmi: 25.5,
      glucose: 105,
      insulin: 18,
      bloodPressure: 125,
      skinThickness: 22,
      pregnancies: 0,
      diabetesPedigree: 0.3,
      dailySteps: 2500,
    },
    stroke: {
      age: 48,
      avgGlucose: 105,
      bmi: 25.5,
      hypertension: 0,
      heartDisease: 0,
      smokingStatus: "smokes",
      dailySteps: 2500,
    },
    recovery: {
      sleepQuality: 5.0,
      stressLevel: 8,
      restingHeartRate: 72,
      hydrationLevel: 60,
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
    diabetes: {
      age: 62,
      bmi: 29.0,
      glucose: 135,
      insulin: 45,
      bloodPressure: 145,
      skinThickness: 28,
      pregnancies: 2,
      diabetesPedigree: 0.6,
      dailySteps: 6000,
    },
    stroke: {
      age: 62,
      avgGlucose: 135,
      bmi: 29.0,
      hypertension: 1,
      heartDisease: 0,
      smokingStatus: "formerly smoked",
      dailySteps: 6000,
    },
    recovery: {
      sleepQuality: 6.0,
      stressLevel: 6,
      restingHeartRate: 78,
      hydrationLevel: 55,
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
      "Severe compounding of advanced age, prior heart disease, active smoking, and high glucose. Triggers 'High Risk' critical alerts.",
    diabetes: {
      age: 75,
      bmi: 34.0,
      glucose: 190,
      insulin: 120,
      bloodPressure: 160,
      skinThickness: 35,
      pregnancies: 3,
      diabetesPedigree: 0.9,
      dailySteps: 1500,
    },
    stroke: {
      age: 75,
      avgGlucose: 190,
      bmi: 34.0,
      hypertension: 1,
      heartDisease: 1,
      smokingStatus: "smokes",
      dailySteps: 1500,
    },
    recovery: {
      sleepQuality: 4.0,
      stressLevel: 9,
      restingHeartRate: 88,
      hydrationLevel: 40,
      trainingIntensity: 1,
    },
  },
];

// ---------------------------------------------------------------------------
// 3. ATHLETIC SCENARIOS (For Recovery Tab)
// ---------------------------------------------------------------------------
const ATHLETIC_SCENARIOS = [
  {
    id: "peaking",
    name: "The Peaking Athlete",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-100",
    description:
      "Perfectly recovered (9/10 sleep). Cleared for maximum training intensity (9/10).",
    diabetes: {
      age: 24,
      bmi: 22.0,
      glucose: 85,
      insulin: 10,
      bloodPressure: 110,
      skinThickness: 12,
      pregnancies: 0,
      diabetesPedigree: 0.2,
      dailySteps: 15000,
    },
    stroke: {
      age: 24,
      avgGlucose: 85,
      bmi: 22.0,
      hypertension: 0,
      heartDisease: 0,
      smokingStatus: "never_smoked",
      dailySteps: 15000,
    },
    recovery: {
      sleepQuality: 9.0,
      stressLevel: 2,
      restingHeartRate: 48,
      hydrationLevel: 95,
      trainingIntensity: 9,
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
    diabetes: {
      age: 29,
      bmi: 24.5,
      glucose: 92,
      insulin: 14,
      bloodPressure: 120,
      skinThickness: 15,
      pregnancies: 0,
      diabetesPedigree: 0.3,
      dailySteps: 12000,
    },
    stroke: {
      age: 29,
      avgGlucose: 92,
      bmi: 24.5,
      hypertension: 0,
      heartDisease: 0,
      smokingStatus: "never_smoked",
      dailySteps: 12000,
    },
    recovery: {
      sleepQuality: 6.5,
      stressLevel: 7,
      restingHeartRate: 65,
      hydrationLevel: 75,
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
      "Poor sleep and high life stress, but attempting a massive workout (intensity: 9). High probability of acute injury.",
    diabetes: {
      age: 42,
      bmi: 28.0,
      glucose: 105,
      insulin: 22,
      bloodPressure: 130,
      skinThickness: 24,
      pregnancies: 0,
      diabetesPedigree: 0.5,
      dailySteps: 6000,
    },
    stroke: {
      age: 42,
      avgGlucose: 105,
      bmi: 28.0,
      hypertension: 1,
      heartDisease: 0,
      smokingStatus: "formerly_smoked",
      dailySteps: 6000,
    },
    recovery: {
      sleepQuality: 4.5,
      stressLevel: 8.5,
      restingHeartRate: 78,
      hydrationLevel: 50,
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
      "Under-recovered from a bad night's sleep, but smartly lowered planned intensity to 3/10. Model clears them to train.",
    diabetes: {
      age: 35,
      bmi: 25.0,
      glucose: 90,
      insulin: 15,
      bloodPressure: 115,
      skinThickness: 18,
      pregnancies: 1,
      diabetesPedigree: 0.4,
      dailySteps: 8000,
    },
    stroke: {
      age: 35,
      avgGlucose: 90,
      bmi: 25.0,
      hypertension: 0,
      heartDisease: 0,
      smokingStatus: "never_smoked",
      dailySteps: 8000,
    },
    recovery: {
      sleepQuality: 4.0,
      stressLevel: 6,
      restingHeartRate: 68,
      hydrationLevel: 65,
      trainingIntensity: 3,
    },
  },
];

export default function Page() {
  // 1. Track which tab is currently open
  const [activeTab, setActiveTab] = useState("diabetes");
  const [selectedPatient, setSelectedPatient] = useState("pt-001");

  // 2. Determine which scenario list to show based on the active tab
  let activeScenarios = METABOLIC_SCENARIOS;
  if (activeTab === "stroke") activeScenarios = STROKE_SCENARIOS;
  if (activeTab === "recovery") activeScenarios = ATHLETIC_SCENARIOS;

  const [activeScenarioId, setActiveScenarioId] = useState(
    METABOLIC_SCENARIOS[0].id,
  );

  // Unified State driven by the scenarios
  const [diabetesVitals, setDiabetesVitals] = useState(
    METABOLIC_SCENARIOS[0].diabetes,
  );
  const [strokeData, setStrokeData] = useState(METABOLIC_SCENARIOS[0].stroke);
  const [recoveryData, setRecoveryData] = useState<RecoveryData>(
    METABOLIC_SCENARIOS[0].recovery,
  );

  // Handler to inject data across all 3 AI models instantly
  const handleApplyScenario = (scenario: any) => {
    setActiveScenarioId(scenario.id);
    setDiabetesVitals(scenario.diabetes);
    setStrokeData(scenario.stroke);
    setRecoveryData(scenario.recovery);
  };

  // Handler for when a user switches tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // Auto-select the first scenario of the new group so the UI instantly matches the context
    let newScenarios = METABOLIC_SCENARIOS;
    if (value === "stroke") newScenarios = STROKE_SCENARIOS;
    if (value === "recovery") newScenarios = ATHLETIC_SCENARIOS;

    handleApplyScenario(newScenarios[0]);
  };

  // Dynamic Sidebar Title
  const getSidebarTitle = () => {
    if (activeTab === "recovery") return "Athletic Profiles";
    if (activeTab === "stroke") return "Cerebrovascular Profiles";
    return "Metabolic Profiles";
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <DashboardHeader
        selectedPatient={selectedPatient}
        onPatientChange={setSelectedPatient}
      />

      <main className="flex-1 px-4 py-6 md:px-6 lg:px-8 max-w-[1600px] mx-auto w-full flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar: Context-Aware Scenario Picker */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                {getSidebarTitle()}
              </CardTitle>
              <CardDescription>
                {activeTab === "recovery"
                  ? "Test the injury prediction model with specific lifestyle inputs."
                  : "Inject unified profiles to test VitalsGuard risk mapping."}
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

        {/* Right Content: The AI Tabs */}
        <div className="flex-1 min-w-0">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="mb-6 h-11 w-full max-w-2xl bg-white border shadow-sm">
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
                value="recovery"
                className="gap-1.5 px-4 data-[state=active]:bg-slate-100"
              >
                <Dumbbell className="h-4 w-4" />
                <span className="hidden sm:inline">Athletic Injury</span>
                <span className="sm:hidden">Injury</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="diabetes" className="mt-0 outline-none">
              <DiabetesTab
                vitals={diabetesVitals}
                onVitalsChange={setDiabetesVitals}
              />
            </TabsContent>

            <TabsContent value="stroke" className="mt-0 outline-none">
              <StrokeTab data={strokeData} onDataChange={setStrokeData} />
            </TabsContent>

            <TabsContent value="recovery" className="mt-0 outline-none">
              <RecoveryTab data={recoveryData} onDataChange={setRecoveryData} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-4 mt-auto">
        <p className="text-center text-xs text-slate-500 font-medium tracking-wide">
          VitalsGuard Clinical Engine &mdash; For authorized healthcare
          professionals only. Not a substitute for clinical judgment.
        </p>
      </footer>
    </div>
  );
}
