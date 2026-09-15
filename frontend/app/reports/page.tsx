"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  FolderOpen,
  Plus,
  Search,
  ShieldCheck,
  Upload,
} from "lucide-react";

type Report = {
  id: number;
  name: string;
  type: string;
  date: string;
  size: string;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: 1,
      name: "HbA1c Report",
      type: "Diabetes",
      date: "13 September 2026",
      size: "1.2 MB",
    },
    {
      id: 2,
      name: "Blood Pressure Review",
      type: "Vitals",
      date: "10 September 2026",
      size: "840 KB",
    },
    {
      id: 3,
      name: "Complete Blood Count",
      type: "Blood Test",
      date: "05 September 2026",
      size: "1.8 MB",
    },
  ]);

  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState("");

  const filteredReports = reports.filter((report) =>
    `${report.name} ${report.type}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const removeReport = (id: number) => {
    setReports((current) =>
      current.filter((report) => report.id !== id)
    );
  };

  return (
    <main className="min-h-screen bg-[#f5f9fa] text-slate-900">
      <div className="mx-auto max-w-5xl px-5 py-6 md:px-8">

        {/* HEADER */}
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
              Reports
            </h1>
          </div>

          <button
            onClick={() => setShowUpload(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition hover:bg-emerald-600"
          >
            <Plus size={21} />
          </button>
        </div>

        {/* HERO */}
        <section className="mb-6 rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-2 text-emerald-600">
                <FolderOpen size={18} />
                <span className="text-sm font-medium">
                  Health records
                </span>
              </div>

              <h2 className="text-2xl font-semibold">
                Your medical reports
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Keep important health reports organized in one place for
                easier tracking and future doctor consultations.
              </p>
            </div>

            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              <Upload size={17} />
              Upload report
            </button>

          </div>
        </section>

        {/* SEARCH */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
          <Search size={18} className="text-slate-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        {/* SUMMARY */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">

          <SummaryCard
            icon={<FileText size={19} />}
            label="Total reports"
            value={`${reports.length}`}
          />

          <SummaryCard
            icon={<FolderOpen size={19} />}
            label="Categories"
            value={`${new Set(reports.map((r) => r.type)).size}`}
          />

          <SummaryCard
            icon={<ShieldCheck size={19} />}
            label="Health records"
            value="Secure"
          />

        </div>

        {/* REPORT LIST */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Recent reports
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your latest uploaded health documents
            </p>
          </div>

          <div className="space-y-3">

            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="group rounded-[24px] bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] ring-1 ring-slate-100 transition hover:shadow-md"
              >
                <div className="flex items-center gap-4">

                  {/* ICON */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <FileText size={21} />
                  </div>

                  {/* DETAILS */}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">
                      {report.name}
                    </h3>

                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-400">
                      <span>{report.type}</span>
                      <span>•</span>
                      <span>{report.date}</span>
                      <span>•</span>
                      <span>{report.size}</span>
                    </div>
                  </div>

                  {/* ARROW */}
                  <button
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition group-hover:bg-emerald-50 group-hover:text-emerald-600"
                  >
                    <ChevronRight size={17} />
                  </button>

                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => removeReport(report.id)}
                    className="text-xs text-slate-400 transition hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {filteredReports.length === 0 && (
              <div className="rounded-[24px] bg-white p-10 text-center">
                <FileText
                  size={28}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-medium">
                  No reports found
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Try another search term.
                </p>
              </div>
            )}

          </div>
        </section>

        {/* AI SECTION */}
        <section className="mt-6 rounded-[26px] border border-emerald-100 bg-emerald-50/70 p-5">

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
            SumanCare AI
          </p>

          <h3 className="mt-2 text-lg font-semibold">
            Reports → meaningful health insights
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            In the next integration stage, selected report information can
            contribute to your health timeline and AI-assisted insights.
            SumanCare will not replace professional medical interpretation.
          </p>

        </section>

        {/* UPLOAD MODAL */}
        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/30 p-4 md:items-center">

            <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Upload report
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Document storage will be connected later.
                  </p>
                </div>

                <button
                  onClick={() => setShowUpload(false)}
                  className="text-sm text-slate-400 hover:text-slate-700"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3">

                <input
                  placeholder="Report name"
                  className="report-input"
                />

                <select className="report-input">
                  <option>Blood Test</option>
                  <option>Diabetes</option>
                  <option>Vitals</option>
                  <option>Prescription</option>
                  <option>Imaging</option>
                  <option>Other</option>
                </select>

                <input
                  type="date"
                  className="report-input"
                />

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-emerald-300 hover:bg-emerald-50/40">
                  <Upload size={24} className="text-emerald-600" />

                  <p className="mt-2 text-sm font-medium">
                    Choose report file
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    PDF, JPG or PNG
                  </p>

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                </label>

              </div>

              <button
                onClick={() => setShowUpload(false)}
                className="mt-5 w-full rounded-2xl bg-emerald-500 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                Save report
              </button>

            </div>
          </div>
        )}

        {/* DISCLAIMER */}
        <p className="mt-8 pb-5 text-center text-xs leading-5 text-slate-400">
          SumanCare is a health-tracking prototype. Uploaded reports should
          be reviewed by a qualified healthcare professional.
        </p>

      </div>

      <style jsx global>{`
        .report-input {
          width: 100%;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          padding: 12px 14px;
          font-size: 14px;
          outline: none;
          transition: 0.2s;
        }

        .report-input:focus {
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

      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-semibold">
        {value}
      </p>
    </div>
  );
}