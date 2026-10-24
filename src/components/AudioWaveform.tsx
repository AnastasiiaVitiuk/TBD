import React from 'react';

interface AudioWaveformProps {
  isRecording: boolean;
  levels: number[];
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ isRecording, levels }) => {
  return (
    <div className="flex items-center justify-center gap-1 h-12 px-4 py-2 bg-slate-900/60 rounded-xl border border-slate-700/60">
      {levels.map((lvl, idx) => (
        <div
          key={idx}
          className={`w-1 rounded-full transition-all duration-75 ${
            isRecording
              ? 'bg-gradient-to-t from-nhs-lightblue to-nhs-brightblue'
              : 'bg-slate-600 h-2'
          }`}
          style={{
            height: isRecording ? `${lvl}%` : '8px',
            minHeight: '6px',
            maxHeight: '100%',
          }}
        />
      ))}
    </div>
  );
};
