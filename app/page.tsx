"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard-header";
import { DiabetesTab } from "@/components/diabetes-tab";
import { StrokeTab } from "@/components/stroke-tab";
import { RecoveryTab } from "@/components/recovery-tab";
import type { RecoveryData } from "@/components/recovery-tab";
import { Activity, BrainCircuit, Dumbbell } from "lucide-react";

export default function Page() {
  const [selectedPatient, setSelectedPatient] = useState("pt-001");

  const [diabetesVitals, setDiabetesVitals] = useState({
    age: 42,
    bmi: 28.5,
    fastingGlucose: 105,
    insulin: 18,
    dailySteps: 6500,
    sedentaryMinutes: 320,
  });

  const [strokeData, setStrokeData] = useState({
    age: 42,
    avgGlucose: 110,
    bmi: 28.5,
    hypertension: false,
    heartDisease: false,
    smokingStatus: "never_smoked",
  });

  const [recoveryData, setRecoveryData] = useState<RecoveryData>({
    sleepQuality: 7,
    stressLevel: 4,
    restingHeartRate: 62,
    hydrationLevel: 70,
    trainingIntensity: 6,
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader
        selectedPatient={selectedPatient}
        onPatientChange={setSelectedPatient}
      />

      <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
        <Tabs defaultValue="diabetes" className="w-full">
          <TabsList className="mb-6 h-11 w-full max-w-2xl">
            <TabsTrigger value="diabetes" className="gap-1.5 px-4">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">
                Diabetes & Metabolic Risk
              </span>
              <span className="sm:hidden">Diabetes</span>
            </TabsTrigger>
            <TabsTrigger value="stroke" className="gap-1.5 px-4">
              <BrainCircuit className="h-4 w-4" />
              <span className="hidden sm:inline">Stroke Risk Assessor</span>
              <span className="sm:hidden">Stroke</span>
            </TabsTrigger>
            <TabsTrigger value="recovery" className="gap-1.5 px-4">
              <Dumbbell className="h-4 w-4" />
              <span className="hidden sm:inline">
                {"Athletic Recovery & Injury"}
              </span>
              <span className="sm:hidden">Recovery</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diabetes">
            <DiabetesTab
              vitals={diabetesVitals}
              onVitalsChange={setDiabetesVitals}
            />
          </TabsContent>

          <TabsContent value="stroke">
            <StrokeTab data={strokeData} onDataChange={setStrokeData} />
          </TabsContent>

          <TabsContent value="recovery">
            <RecoveryTab data={recoveryData} onDataChange={setRecoveryData} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border bg-card px-6 py-3">
        <p className="text-center text-xs text-muted-foreground">
          VitalsGuard Clinical v2.4 &mdash; For authorized healthcare
          professionals only. Not a substitute for clinical judgment.
        </p>
      </footer>
    </div>
  );
}
