import React from 'react';
import { ShieldAlert, ShieldCheck, ArrowRight, Lock, Zap } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterCommandCenter: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onEnterCommandCenter,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-md bg-[#0B0F17] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 relative overflow-hidden">
        {/* Subtle cyber background ambient glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center mb-5 shadow-lg shadow-cyan-500/20">
          <ShieldAlert className="w-6 h-6 text-white" />
        </div>

        {/* Logo and Tagline */}
        <h2 className="text-2xl font-extrabold tracking-wider text-slate-100 uppercase">
          SECOPS-PULSE
        </h2>
        <div className="text-xs font-semibold text-cyan-400 tracking-wide mt-0.5 uppercase">
          Autonomous AI Incident Response Agent
        </div>
        <p className="text-sm text-slate-400 mt-3 italic leading-relaxed">
          «Autonomous defense. Faster than the attack.»
        </p>

        {/* Capabilities list */}
        <div className="my-6 space-y-2 py-3 border-y border-slate-800/80 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>Continuous Tier-1 SOC alert triage & reasoning</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span>Policy-governed autonomous containment (3.8s avg)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Immutable SHA-256 cryptographic audit trail</span>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              onEnterCommandCenter();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold tracking-wider transition-all shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2 group"
          >
            <span>ENTER SECURITY COMMAND CENTER</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => {
              onEnterCommandCenter();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Demo Login (No Auth Required for Evaluation)</span>
          </button>
        </div>

        <div className="mt-5 text-center text-[11px] text-slate-400 font-mono-nums">
          SecOps-Pulse Platform v1.2 · NIST CSF Compliant
        </div>
      </div>
    </div>
  );
};
