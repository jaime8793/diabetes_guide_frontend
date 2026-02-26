"use client";

import { Activity } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const patients = [
  { id: "pt-001", name: "Sarah Mitchell", age: 42 },
  { id: "pt-002", name: "James Okonkwo", age: 58 },
  { id: "pt-003", name: "Elena Rodriguez", age: 35 },
];

interface DashboardHeaderProps {
  selectedPatient: string;
  onPatientChange: (value: string) => void;
}

export function DashboardHeader({
  selectedPatient,
  onPatientChange,
}: DashboardHeaderProps) {
  const patient = patients.find((p) => p.id === selectedPatient);

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Activity className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-card-foreground tracking-tight">
            VitalsGuard Clinical
          </h1>
          <p className="text-xs text-muted-foreground">
            Patient Health Dashboard
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-xs text-muted-foreground">Active Patient</span>
          {patient && (
            <span className="text-xs text-muted-foreground">
              {"Age: "}
              {patient.age}
            </span>
          )}
        </div>
        <Select value={selectedPatient} onValueChange={onPatientChange}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Select patient..." />
          </SelectTrigger>
          <SelectContent>
            {patients.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
