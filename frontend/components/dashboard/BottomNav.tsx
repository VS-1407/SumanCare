"use client";

import Link from "next/link";
import {
  Home,
  Activity,
  MessageCircle,
  Pill,
  UserRound,
} from "lucide-react";

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 md:hidden">
      <div className="mx-auto flex max-w-md items-end justify-between rounded-[32px] border border-white/80 bg-white/90 px-5 py-3 shadow-[0_-10px_40px_rgba(20,70,60,0.12)] backdrop-blur-xl">

        <Link
          href="/"
          className="flex w-14 flex-col items-center gap-1 text-[#00a878]"
        >
          <Home size={23} />
          <span className="text-[11px] font-medium">Home</span>
        </Link>

        <Link
          href="/health"
          className="flex w-14 flex-col items-center gap-1 text-[#8da0bc]"
        >
          <Activity size={23} />
          <span className="text-[11px] font-medium">Health</span>
        </Link>

        {/* AI */}
        <button
          type="button"
          className="-mt-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#00a878] text-white shadow-[0_10px_30px_rgba(0,168,120,0.35)] transition-transform hover:scale-105"
        >
          <MessageCircle size={28} />
        </button>

        <Link
          href="/medicines"
          className="flex w-14 flex-col items-center gap-1 text-[#8da0bc]"
        >
          <Pill size={23} />
          <span className="text-[11px] font-medium">Medicine</span>
        </Link>

        <Link
          href="/profile"
          className="flex w-14 flex-col items-center gap-1 text-[#8da0bc]"
        >
          <UserRound size={23} />
          <span className="text-[11px] font-medium">Profile</span>
        </Link>

      </div>
    </nav>
  );
}