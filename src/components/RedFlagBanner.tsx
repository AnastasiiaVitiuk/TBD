import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RedFlagAssessment, SupportedLanguage } from '../types';

interface RedFlagBannerProps {
  redFlags: RedFlagAssessment;
  patientLanguage: SupportedLanguage;
}

export function RedFlagBanner({ redFlags, patientLanguage }: RedFlagBannerProps) {
  if (!redFlags.detected) return null;

  const handleCall999 = () => {
    Linking.openURL('tel:999');
  };

  const handleCall111 = () => {
    Linking.openURL('tel:111');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="warning" size={24} color="#DC2626" />
        <View style={styles.titleWrap}>
          <Text style={styles.title}>EMERGENCY 999 ALERT</Text>
          <Text style={styles.subtitleInLang}>PILNE ZAGROŻENIE ZDROWIA</Text>
        </View>
      </View>

      <Text style={styles.messageInLang}>
        {redFlags.recommendationInPatientLang || 'Wykryto objawy wymagające natychmiastowej pomocy lekarskiej.'}
      </Text>

      <Text style={styles.messageEnglish}>
        {redFlags.recommendation || 'Potential emergency detected. Seek immediate urgent medical care.'}
      </Text>

      {redFlags.symptomsTriggered && redFlags.symptomsTriggered.length > 0 && (
        <View style={styles.chipsRow}>
          {redFlags.symptomsTriggered.map((sym, idx) => (
            <View key={idx} style={styles.chip}>
              <Text style={styles.chipText}>⚠️ {sym}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.call999Button} onPress={handleCall999} activeOpacity={0.8}>
          <Ionicons name="call" size={18} color="#FFFFFF" />
          <Text style={styles.call999Text}>Call 999 Immediately</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.call111Button} onPress={handleCall111} activeOpacity={0.8}>
          <Text style={styles.call111Text}>NHS 111</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
    borderWidth: 2,
    borderRadius: 14,
    padding: 16,
    marginVertical: 12,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleWrap: {
    marginLeft: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '900',
    color: '#991B1B',
    letterSpacing: 0.5,
  },
  subtitleInLang: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B91C1C',
  },
  messageInLang: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7F1D1D',
    lineHeight: 20,
    marginBottom: 4,
  },
  messageEnglish: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 18,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  chip: {
    backgroundColor: '#FEE2E2',
    borderColor: '#F87171',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#991B1B',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  call999Button: {
    flex: 2,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  call999Text: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  call111Button: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#DC2626',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  call111Text: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 14,
  },
});
