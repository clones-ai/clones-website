import React from 'react';
import { Target, MousePointer, FileText, Keyboard, Video } from 'lucide-react';
import { RevealUp } from '../motion/Reveal';

export function DataVault() {
  const dataTypes = [
    {
      icon: Target,
      name: "User Action Sequences",
      volume: "24.8M",
      rate: "$0.08",
      value: "$1,984,000",
      coverage: "Complete interactions",
      color: "primary-500",
      shadow: "shadow-neon-primary",
      hoverBorder: "hover:border-l-primary-500/60",
      hoverShadow: "hover:shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]"
    },
    {
      icon: MousePointer,
      name: "Mouse Event Data",
      volume: "24.6M",
      rate: "$0.05",
      value: "$1,230,000",
      coverage: "Precision tracking",
      color: "primary-600",
      shadow: "shadow-neon-secondary",
      hoverBorder: "hover:border-l-primary-600/60",
      hoverShadow: "hover:shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]"
    },
    {
      icon: FileText,
      name: "Text Prompts",
      volume: "463K",
      rate: "$0.50",
      value: "$231,500",
      coverage: "Task instructions",
      color: "primary-700",
      shadow: "shadow-neon-tertiary",
      hoverBorder: "hover:border-l-primary-700/60",
      hoverShadow: "hover:shadow-[inset_0_0_20px_rgba(147,51,234,0.1)]"
    },
    {
      icon: Keyboard,
      name: "Keyboard Input Data",
      volume: "294K",
      rate: "$0.20",
      value: "$58,800",
      coverage: "Text input",
      color: "green-500",
      shadow: "shadow-neon-success",
      hoverBorder: "hover:border-l-green-500/60",
      hoverShadow: "hover:shadow-[inset_0_0_20px_rgba(34,197,94,0.1)]"
    },
    {
      icon: Video,
      name: "Video Demonstrations",
      volume: "1.55M min",
      rate: "$0.0015",
      value: "$2,325",
      coverage: "Screen recordings",
      color: "blue-500",
      shadow: "shadow-neon-blue",
      hoverBorder: "hover:border-l-blue-500/60",
      hoverShadow: "hover:shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]"
    }
  ];

  return (
    <section className="min-h-screen flex flex-col justify-center py-24 px-4 sm:px-6 relative overflow-hidden">

      <div className="max-w-6xl mx-auto">
        <RevealUp distance={8}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-text-primary mb-8 tracking-wide text-center font-system relative z-10">
            Data Vault
          </h2>
        </RevealUp>

        <RevealUp distance={6}>
          <h3 className="text-2xl sm:text-3xl font-light text-text-secondary mb-16 tracking-wide text-center font-system relative z-10">
            The $3.5M Strategic Asset Foundation
          </h3>
        </RevealUp>

        <RevealUp distance={4}>
          <div className="text-center mb-16 relative z-10">
            <p className="text-lg sm:text-xl text-text-secondary max-w-5xl mx-auto leading-relaxed font-system">
              CLONES owns the largest repository of Computer-use agents training data in Web3 establishing immediate dominance in the AI automation market.
            </p>
          </div>
        </RevealUp>

        {/* Data Vault Table */}
        <RevealUp distance={6}>
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="ultra-premium-data-table rounded-2xl overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-4 sm:p-6 border-b border-primary-500/30 bg-black/20 backdrop-blur-xl">
                <div className="text-text-secondary text-sm font-medium font-system">Data Type</div>
                <div className="text-text-secondary text-sm font-medium font-system text-center hidden sm:block">Volume</div>
                <div className="text-text-secondary text-sm font-medium font-system text-center hidden sm:block">Rate</div>
                <div className="text-text-secondary text-sm font-medium font-system text-center">Value</div>
                <div className="text-text-secondary text-sm font-medium font-system text-center hidden sm:block">Coverage</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-primary-500/10">
                {dataTypes.map((dataType, index) => {
                  const Icon = dataType.icon;
                  return (
                    <div key={index} className={`grid grid-cols-2 sm:grid-cols-5 gap-4 p-4 sm:p-6 hover:border-l-4 transition-all duration-300 backdrop-blur-sm ${dataType.hoverBorder} ${dataType.hoverShadow} ${dataType.color === 'blue-500'
                        ? 'hover:bg-blue-500/8'
                        : dataType.color === 'green-500'
                          ? 'hover:bg-green-500/8'
                          : dataType.color === 'primary-500'
                            ? 'hover:bg-primary-500/8'
                            : dataType.color === 'primary-600'
                              ? 'hover:bg-primary-600/8'
                              : 'hover:bg-primary-700/8'
                      }`}>
                      <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${dataType.shadow} ${dataType.color === 'blue-500'
                            ? 'bg-blue-500/20 border border-blue-500/40'
                            : dataType.color === 'green-500'
                              ? 'bg-green-500/20 border border-green-500/40'
                              : dataType.color === 'primary-500'
                                ? 'bg-primary-500/25 border border-primary-500/40'
                                : dataType.color === 'primary-600'
                                  ? 'bg-primary-600/25 border border-primary-600/40'
                                  : 'bg-primary-700/25 border border-primary-700/40'
                          }`}>
                          <Icon className={`w-6 h-6 ${dataType.color === 'blue-500'
                              ? 'text-blue-500'
                              : dataType.color === 'green-500'
                                ? 'text-green-500'
                                : dataType.color === 'primary-500'
                                  ? 'text-primary-500'
                                  : dataType.color === 'primary-600'
                                    ? 'text-primary-600'
                                    : 'text-primary-700'
                            }`} />
                        </div>
                        <span className="text-text-primary font-medium font-system text-sm sm:text-base">{dataType.name}</span>
                      </div>
                      <div className={`text-center font-bold font-system hidden sm:block ${dataType.color === 'blue-500'
                          ? 'text-blue-500'
                          : dataType.color === 'green-500'
                            ? 'text-green-500'
                            : dataType.color === 'primary-500'
                              ? 'text-primary-500'
                              : dataType.color === 'primary-600'
                                ? 'text-primary-600'
                                : 'text-primary-700'
                        }`}>{dataType.volume}</div>
                      <div className="text-center text-text-secondary font-system hidden sm:block">{dataType.rate}</div>
                      <div className="text-center text-green-400 font-bold font-system">{dataType.value}</div>
                      <div className="text-center text-text-muted text-sm font-system hidden sm:block">{dataType.coverage}</div>
                    </div>
                  );
                })}
              </div>

              {/* Total Value Footer */}
              <div className="p-4 sm:p-6 bg-black/20 border-t border-primary-500/40 backdrop-blur-xl relative">
                {/* Neon accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/80 to-transparent shadow-[0_0_10px_rgba(139,92,246,0.6)]"></div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary-500 font-system drop-shadow-neon-primary">
                    $3,500,000
                  </div>
                  <div className="text-sm text-text-muted font-system mt-1">Total Asset Value</div>
                </div>
              </div>
            </div>
          </div>
        </RevealUp>
      </div>
    </section>
  );
}