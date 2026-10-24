import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAudioService } from '../services/safeAudio';

interface AudioPlayerWidgetProps {
  audioUri?: string;
  durationSeconds?: number;
  label?: string;
  sublabel?: string;
}

export function AudioPlayerWidget({
  audioUri,
  durationSeconds = 12,
  label = 'Voice Intake Audio',
  sublabel = 'Patient recorded speech',
}: AudioPlayerWidgetProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    // Start playback simulation
    setIsPlaying(true);
    let step = Math.floor(progress * durationSeconds * 4);
    const totalSteps = durationSeconds * 4;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      step += 1;
      const currentProgress = step / totalSteps;
      setProgress(Math.min(currentProgress, 1));

      if (step >= totalSteps) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsPlaying(false);
        setProgress(0);
      }
    }, 250);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.playButton, isPlaying && styles.playButtonActive]}
        onPress={handleTogglePlay}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={20}
          color="#FFFFFF"
          style={!isPlaying ? { marginLeft: 2 } : undefined}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.textRow}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.timeText}>
            {formatTime(Math.round(progress * durationSeconds))} / {formatTime(durationSeconds)}
          </Text>
        </View>
        <Text style={styles.sublabel}>{sublabel}</Text>

        {/* Audio Progress Bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
        </View>

        {/* Animated Audio waveform bars */}
        <View style={styles.waveformContainer}>
          {[40, 75, 55, 90, 65, 30, 85, 100, 70, 45, 80, 60, 95, 50, 70, 40, 85, 60, 75, 45].map(
            (barHeight, i) => {
              const isPast = i / 20 <= progress;
              const heightStyle = isPlaying
                ? Math.max(4, Math.sin(i + progress * 10) * 12 + 8)
                : (barHeight / 100) * 16;

              return (
                <View
                  key={i}
                  style={[
                    styles.waveformBar,
                    {
                      height: heightStyle,
                      backgroundColor: isPast ? '#005EB8' : '#CBD5E1',
                    },
                  ]}
                />
              );
            }
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#005EB8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#005EB8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  playButtonActive: {
    backgroundColor: '#0284C7',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  sublabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#005EB8',
    borderRadius: 2,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 16,
  },
  waveformBar: {
    width: 3,
    borderRadius: 2,
  },
});
