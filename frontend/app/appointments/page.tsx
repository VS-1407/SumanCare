"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Clock3,
  MapPin,
  Plus,
  Stethoscope,
  Trash2,
} from "lucide-react";

type Appointment = {
  id: number;
  doctor: string;
  specialty: string;
  hospital: string;
  date: string;
  time: string;
  location: string;
  notes: string;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      doctor: "Dr. Ananya Sharma",
      specialty: "General Physician",
      hospital: "CityCare Hospital",
      date: "18 September 2026",
      time: "10:30 AM",
      location: "Noida",
      notes: "Routine health review",
    },
    {
      id: 2,
      doctor: "Dr. Rahul Mehta",
      specialty: "Diabetes Specialist",
      hospital: "MedLife Clinic",
      date: "25 September 2026",
      time: "04:00 PM",
      location: "Noida",
      notes: "Glucose and HbA1c review",
    },
  ]);

  const [showAdd, setShowAdd] = useState(false);

  const removeAppointment = (id: number) => {
    setAppointments((current) =>
      current.filter((appointment) => appointment.id !== id)
    );
  };

  const upcoming = appointments[0];

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
              Appointments
            </h1>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition hover:bg-emerald-600"
          >
            <Plus size={21} />
          </button>
        </div>

        {/* Next Appointment */}
        {upcoming && (
          <section className="mb-6 overflow-hidden rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="mb-5 flex items-center gap-2 text-emerald-600">
              <Bell size={18} />
              <span className="text-sm font-medium">
                Next appointment
              </span>
            </div>

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-semibold">
                  {upcoming.doctor}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {upcoming.specialty}
                </p>

                <p className="mt-4 text-sm font-medium text-slate-700">
                  {upcoming.hospital}
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 px-5 py-4 md:min-w-[190px]">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CalendarDays size={17} />

                  <span className="text-sm font-semibold">
                    {upcoming.date}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <Clock3 size={15} />
                  {upcoming.time}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Summary */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          <SummaryCard
            icon={<CalendarDays size={19} />}
            label="Upcoming"
            value={`${appointments.length}`}
          />

          <SummaryCard
            icon={<Stethoscope size={19} />}
            label="Doctors"
            value={`${new Set(appointments.map((a) => a.doctor)).size}`}
          />

          <SummaryCard
            icon={<Bell size={19} />}
            label="Reminders"
            value={`${appointments.length}`}
          />
        </div>

        {/* Appointment List */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Your appointments
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Keep your consultations and health reviews organized
            </p>
          </div>

          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="rounded-[26px] bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)]"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center">

                  {/* Doctor icon */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Stethoscope size={22} />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {appointment.doctor}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {appointment.specialty}
                    </p>

                    <p className="mt-3 text-sm font-medium text-slate-700">
                      {appointment.hospital}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={13} />
                        {appointment.date}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Clock3 size={13} />
                        {appointment.time}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} />
                        {appointment.location}
                      </span>
                    </div>
                  </div>

                  {/* Reminder */}
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
                    <Bell
                      size={17}
                      className="mx-auto mb-1 text-emerald-600"
                    />

                    <p className="text-[11px] font-medium text-slate-500">
                      Reminder
                    </p>

                    <p className="text-xs font-semibold text-slate-700">
                      1 day before
                    </p>
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Notes
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {appointment.notes}
                  </p>
                </div>

                {/* Delete */}
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => removeAppointment(appointment.id)}
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
            Stay ahead of your care
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Your appointments can later be combined with health trends,
            medication adherence and reports to create a more complete
            health timeline.
          </p>
        </section>

        {/* Add Appointment Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/30 p-4 md:items-center">
            <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Add appointment
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Appointment data will be connected to MySQL later.
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
                  placeholder="Doctor name"
                  className="appointment-input"
                />

                <input
                  placeholder="Specialty"
                  className="appointment-input"
                />

                <input
                  placeholder="Hospital / Clinic"
                  className="appointment-input"
                />

                <input
                  type="date"
                  className="appointment-input"
                />

                <input
                  type="time"
                  className="appointment-input"
                />

                <input
                  placeholder="Location"
                  className="appointment-input"
                />

                <textarea
                  placeholder="Appointment notes"
                  rows={3}
                  className="appointment-input resize-none"
                />
              </div>

              <button
                onClick={() => setShowAdd(false)}
                className="mt-5 w-full rounded-2xl bg-emerald-500 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                Save appointment
              </button>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="mt-8 pb-5 text-center text-xs leading-5 text-slate-400">
          SumanCare is a health-tracking prototype. Appointment reminders do
          not replace professional medical advice.
        </p>
      </div>

      <style jsx global>{`
        .appointment-input {
          width: 100%;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          padding: 12px 14px;
          font-size: 14px;
          outline: none;
          transition: 0.2s;
        }

        .appointment-input:focus {
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

      <p className="mt-1 text-xl font-semibold">
        {value}
      </p>
    </div>
  );
}