"use client";

import Link from "next/link";
import {
  ArrowRight,
  Activity,
  BrainCircuit,
  Dumbbell,
  ShieldCheck,
  Database,
  Network,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-sm">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            VitalsGuard
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/yourusername"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            GitHub
          </a>
          <Link
            href="/dashboard"
            className="text-sm font-semibold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-all shadow-sm"
          >
            Launch Engine
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Machine Learning API Online
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
          Predictive Health, Powered by{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
            Ensemble AI.
          </span>
        </h1>
        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          VitalsGuard bridges the gap between raw biometric data and clinical
          decision-making. It utilizes a hybrid architecture of statistical
          machine learning and physiological heuristics to forecast medical
          risks before they happen.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Enter Clinical Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#architecture"
            className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition-all"
          >
            Read the Methodology
          </a>
        </div>
      </section>

      {/* Three Pillars Section */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Three Specialized Inference Models
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Each module is trained on highly specific clinical and wearable
              datasets, optimized for clinical sensitivity (Recall) to ensure
              latent risks are never missed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Metabolic Risk
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Evaluates pre-diabetic and metabolic syndrome trajectories by
                analyzing the interaction between physiological insulin
                resistance and behavioral habits (Daily Steps).
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <BrainCircuit className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Cerebrovascular Profile
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Predicts ischemic stroke probability using clinical markers
                (Age, BMI, Hypertension) dynamically mitigated by an aerobic
                activity buffer algorithm.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Dumbbell className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Athletic Recovery
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Assesses central nervous system readiness and acute injury
                probability based on the differential between accumulated
                fatigue and planned physical load.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture & Methodology */}
      <section id="architecture" className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              The "Ensemble Engine" Architecture
            </h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              In healthcare, "black box" AI is a liability. VitalsGuard flips
              this paradigm by utilizing a hybrid clinical architecture that
              merges rigorous econometric modeling with modern machine learning:
            </p>
            <ul className="space-y-5">
              <li className="flex gap-4">
                <div className="mt-1 bg-indigo-100 p-2 rounded-lg h-fit">
                  <Database className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">
                    1. Statistical Base (XGBoost)
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Evaluates core biometrics against historical datasets.
                    Handled extreme class imbalances using SMOTE and custom
                    class-weighting.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 bg-indigo-100 p-2 rounded-lg h-fit">
                  <Network className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">
                    2. Physiological Heuristics
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    A Python rule-engine applies clinical "common sense"
                    multipliers, mathematically rewarding protective behaviors
                    like cardiovascular activity.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 bg-indigo-100 p-2 rounded-lg h-fit">
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">
                    3. Explainable AI (XAI)
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    The Next.js dashboard visualizes the exact physiological
                    drivers pushing a patient into a high-risk tier in
                    real-time.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Developer Card */}
          <div className="bg-slate-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
            <h3 className="text-2xl font-bold mb-2">
              Built by Pandas and Chill
            </h3>
            <p className="text-indigo-300 text-sm font-semibold uppercase tracking-wider mb-8">
                Moringa Capstone Project
            </p>

            <p className="text-slate-300 leading-relaxed text-sm mb-8">
              "This project was developed to demonstrate how the rigorous
              causality of econometrics can be combined with the predictive
              power of machine learning. The goal is to create healthcare tools
              that are not only statistically powerful, but clinically
              explainable and safe."
            </p>

            <a
              href="https://www.linkedin.com/in/jamesowiti/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-indigo-300 transition-colors"
            >
              Connect on LinkedIn <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
