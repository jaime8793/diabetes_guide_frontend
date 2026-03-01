"use client";

import Link from "next/link";
import { Activity, Bell, ShieldCheck, Search, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      {/* 1. Left: Brand & Home Link */}
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
              VitalsGuard
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Engine Online
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* 2. Right: Utility & User Profile */}
      <div className="flex items-center gap-4">
        {/* Utilities */}
        <div className="flex items-center gap-2">
          <button className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
            <Search className="h-4 w-4" />
          </button>
          <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-red-500 border border-white" />
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* Logged-In User Profile */}
        <div className="flex items-center gap-3 rounded-lg p-1 hover:bg-slate-50 transition-colors cursor-pointer text-left">
          <Avatar className="h-9 w-9 border border-slate-200">
            <AvatarImage src="" alt="Dr. House" />
            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
              MG
            </AvatarFallback>
          </Avatar>
          <div className="hidden flex-col md:flex">
            <span className="text-sm font-semibold text-slate-900 leading-none mb-1">
              Dr. Meredith Grey
            </span>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 leading-none uppercase font-bold tracking-wider">
              <ShieldCheck className="h-3 w-3 text-green-500" />
              Nairobi Hub
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400 ml-1 hidden md:block" />
        </div>
      </div>
    </header>
  );
}
