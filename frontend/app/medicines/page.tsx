"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Check,
  Clock3,
  Package,
  Plus,
  Pill,
  Trash2,
} from "lucide-react";

type Medicine = {
  id: number;
  name: string;
  dosage: string;
  time: string;
  frequency: string;
  remaining: number;
  taken: boolean;
};

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: 1,
      name: "Metformin",
      dosage: "500 mg",
      time: "08:00 AM",
      frequency: "After breakfast",
      remaining: 18,
      taken: true,
    },
    {
      id: 2,
      name: "Amlodipine",
      dosage: "5 mg",
      time: "02:00 PM",
      frequency: "After lunch",
      remaining: 24,
      taken: false,
    },
    {
      id: 3,
      name: "Vitamin D3",
      dosage: "60,000 IU",
      time: "08:00 PM",
      frequency: "Weekly",
      remaining: 2,
      taken: false,
    },
  ]);

  const [showAdd, setShowAdd] = useState(false);

  const toggleTaken = (id: number) => {
    setMedicines((current) =>
      current.map((medicine) =>
        medicine.id === id
          ? {
              ...medicine,
              taken: !medicine.taken,
              remaining: medicine.taken
                ? medicine.remaining
                : Math.max(0, medicine.remaining - 1),
            }
          : medicine
      )
    );
  };

  const removeMedicine = (id: number) => {
    setMedicines((current) =>
      current.filter((medicine) => medicine.id !== id)
    );
  };

  const nextMedicine = medicines.find((medicine) => !medicine.taken);

  return (
    <main className="min-h-screen bg-[#f5f9fa] text-slate-900">
      <div className="mx-auto max-w-5xl px-5 py-6 md:px-8">

        {/* Header */}
        <div className="mb-7 flex items-center justify-between">
          <Link
            href="/"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm transition hover:shadow-md"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-600">
              SumanCare
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Medicines
            </h1>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition hover:bg-emerald-600"
          >
            <Plus size={21} />
          </button>
        </div>

        {/* Next Dose */}
        <section className="mb-6 rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-emerald-600">
                <Bell size={18} />
                <span className="text-sm font-medium">Next dose</span>
              </div>

              {nextMedicine ? (
                <>
                  <h2 className="text-2xl font-semibold">
                    {nextMedicine.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {nextMedicine.dosage} · {nextMedicine.frequency}
                  </p>
                </>
              ) : (
                <h2 className="text-xl font-semibold">
                  All medicines completed 🎉
                </h2>
              )}
            </div>

            {nextMedicine && (
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-center">
                <Clock3
                  size={19}
                  className="mx-auto mb-1 text-emerald-600"
                />
                <p className="text-sm font-semibold text-emerald-700">
                  {nextMedicine.time}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <SummaryCard
            icon={<Pill size={19} />}
            label="Medicines"
            value={medicines.length.toString()}
          />

          <SummaryCard
            icon={<Check size={19} />}
            label="Taken today"
            value={`${medicines.filter((m) => m.taken).length}`}
          />

          <SummaryCard
            icon={<Package size={19} />}
            label="Total remaining"
            value={`${medicines.reduce((sum, m) => sum + m.remaining, 0)}`}
          />

          <SummaryCard
            icon={<Bell size={19} />}
            label="Pending"
            value={`${medicines.filter((m) => !m.taken).length}`}
          />
        </div>

        {/* Medicine List */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Today&apos;s medicines</h2>
              <p className="text-sm text-slate-500">
                Keep your medication schedule on track
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {medicines.map((medicine) => (
              <div
                key={medicine.id}
                className="rounded-[26px] bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)]"
              >
                <div className="flex items-center gap-4">

                  {/* Pill Icon */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Pill size={22} />
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">
                        {medicine.name}
                      </h3>

                      {medicine.taken && (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                          Taken
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {medicine.dosage} · {medicine.frequency}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock3 size={13} />
                        {medicine.time}
                      </span>

                      <span className="flex items-center gap-1">
                        <Package size={13} />
                        {medicine.remaining} remaining
                      </span>
                    </div>
                  </div>

                  {/* Taken Button */}
                  <button
                    onClick={() => toggleTaken(medicine.id)}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
                      medicine.taken
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                    }`}
                  >
                    <Check size={18} />
                  </button>
                </div>

                {/* Low Stock */}
                {medicine.remaining <= 3 && (
                  <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    ⚠️ Only {medicine.remaining} doses remaining. Consider
                    refilling soon.
                  </div>
                )}

                {/* Delete */}
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => removeMedicine(medicine.id)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-red-500"
                  >
                    <Trash2 size={13} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Insight */}
        <section className="mt-6 rounded-[26px] border border-emerald-100 bg-emerald-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
            SumanCare AI
          </p>

          <h3 className="mt-2 text-lg font-semibold">
            Medication adherence
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Your medication activity is being tracked here. Once connected
            with the health-risk engine, SumanCare can use adherence patterns
            as one factor in your overall health insights.
          </p>
        </section>

        {/* Add Medicine */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/30 p-4 md:items-center">
            <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Add medicine
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    We&apos;ll connect this to the database later.
                  </p>
                </div>

                <button
                  onClick={() => setShowAdd(false)}
                  className="text-sm text-slate-400 hover:text-slate-700"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3">
                <input
                  placeholder="Medicine name"
                  className="medicine-input"
                />

                <input
                  placeholder="Dosage e.g. 500 mg"
                  className="medicine-input"
                />

                <input
                  type="time"
                  className="medicine-input"
                />

                <input
                  type="number"
                  placeholder="Remaining doses"
                  className="medicine-input"
                />
              </div>

              <button
                onClick={() => setShowAdd(false)}
                className="mt-5 w-full rounded-2xl bg-emerald-500 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                Save medicine
              </button>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="mt-8 pb-5 text-center text-xs leading-5 text-slate-400">
          SumanCare is a health-tracking prototype. Medication reminders do
          not replace advice from a qualified healthcare professional.
        </p>
      </div>

      <style jsx global>{`
        .medicine-input {
          width: 100%;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          padding: 12px 14px;
          font-size: 14px;
          outline: none;
          transition: 0.2s;
        }

        .medicine-input:focus {
          border-color: #6ee7b7;
          background: white;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.08);
        }
      `}</style>
    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] bg-white p-4 shadow-[0_8px_25px_rgba(15,23,42,0.04)]">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-emerald-600">
        {icon}
      </div>

      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}