import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SupportedLanguage, StructuredExtraction, SNOMEDGrounding, DoctorFollowUp, RedFlagAssessment } from '../types';
import { AudioPlayerWidget } from '../components/AudioPlayerWidget';
import { simplifyAndTranslateDoctorQuestion } from '../services/clinicalService';

interface DoctorPortalViewProps {
  patientLanguage: SupportedLanguage;
  redFlags: RedFlagAssessment;
  extraction: StructuredExtraction;
  groundedTerms: SNOMEDGrounding[];
  verbatimTranscript: string;
  audioUri?: string;
  followUps: DoctorFollowUp[];
  onSendFollowUp: (fu: DoctorFollowUp) => void;
  patientReplies: string[];
}

export function DoctorPortalView({
  patientLanguage,
  redFlags,
  extraction,
  groundedTerms,
  verbatimTranscript,
  audioUri,
  followUps,
  onSendFollowUp,
  patientReplies,
}: DoctorPortalViewProps) {
  const [activeTab, setActiveTab] = useState<'VISIT_SUMMARY' | 'ASK_FOLLOWUP'>('VISIT_SUMMARY');
  const [doctorQuestionInput, setDoctorQuestionInput] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // Quick clinical follow-up presets for GPs
  const quickDoctorQuestions = [
    'Does the epigastric pain radiate posteriorly to your thoracic back or shoulder?',
    'Any symptoms of dysphagia, odynophagia or regurgitation?',
    'Have you noticed involuntary weight loss or early satiety?',
    'Are you taking any NSAIDs or over-the-counter antacids?',
    'Do you experience nausea or vomiting following meals?',
  ];

  const handleSendFollowUp = async (questionText: string) => {
    if (!questionText.trim()) {
      Alert.alert('Empty Question', 'Please enter or select a clinical follow-up question.');
      return;
    }

    setIsTranslating(true);
    try {
      const result = await simplifyAndTranslateDoctorQuestion(questionText, patientLanguage);
      const newFollowUp: DoctorFollowUp = {
        id: `fu-${Date.now()}`,
        doctorQuestionRaw: questionText,
        simplifiedEnglish: result.simplifiedEnglish,
        translatedPatientLang: result.translatedPatientLang,
        patientSuggestedQuestions: result.patientSuggestedQuestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      onSendFollowUp(newFollowUp);
      setDoctorQuestionInput('');
      Alert.alert(
        'Sent to Patient App',
        `Follow-up translated into ${patientLanguage.nativeName} and delivered to patient's phone.`
      );
    } catch (e) {
      Alert.alert('Error', 'Could not send follow-up. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Clinician Visit Header */}
      <View style={styles.doctorHeader}>
        <View style={styles.doctorHeaderTop}>
          <View style={styles.patientInfoCol}>
            <View style={styles.liveBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.liveBadgeText}>ACTIVE NHS CONSULTATION</Text>
            </View>
            <Text style={styles.patientName}>Patient: Maria Kowalska</Text>
            <Text style={styles.patientMeta}>
              NHS ID: 482 910 3841 • Age: 42 • Primary: {patientLanguage.flag} {patientLanguage.name} ({patientLanguage.code})
            </Text>
          </View>

          <View style={styles.clinicianBadge}>
            <Ionicons name="medkit" size={16} color="#005EB8" />
            <Text style={styles.clinicianBadgeText}>GP Room 4</Text>
          </View>
        </View>

        {/* Doctor Mode Navigation Tabs */}
        <View style={styles.subTabBar}>
          <TouchableOpacity
            style={[styles.subTabButton, activeTab === 'VISIT_SUMMARY' && styles.subTabButtonActive]}
            onPress={() => setActiveTab('VISIT_SUMMARY')}
          >
            <Ionicons
              name="clipboard-outline"
              size={16}
              color={activeTab === 'VISIT_SUMMARY' ? '#005EB8' : '#64748B'}
            />
            <Text
              style={[
                styles.subTabText,
                activeTab === 'VISIT_SUMMARY' && styles.subTabTextActive,
              ]}
            >
              Intake & SBAR Summary
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabButton, activeTab === 'ASK_FOLLOWUP' && styles.subTabButtonActive]}
            onPress={() => setActiveTab('ASK_FOLLOWUP')}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={16}
              color={activeTab === 'ASK_FOLLOWUP' ? '#005EB8' : '#64748B'}
            />
            <Text
              style={[
                styles.subTabText,
                activeTab === 'ASK_FOLLOWUP' && styles.subTabTextActive,
              ]}
            >
              Ask Follow-Up ({followUps.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {activeTab === 'VISIT_SUMMARY' && (
          <View style={styles.contentWrap}>
            {/* Safety Triage Indicator */}
            <View
              style={[
                styles.safetyCard,
                redFlags.detected ? styles.safetyCardRed : styles.safetyCardGreen,
              ]}
            >
              <Ionicons
                name={redFlags.detected ? 'alert-circle' : 'shield-checkmark'}
                size={22}
                color={redFlags.detected ? '#DC2626' : '#059669'}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text
                  style={[
                    styles.safetyTitle,
                    { color: redFlags.detected ? '#991B1B' : '#065F46' },
                  ]}
                >
                  {redFlags.detected
                    ? `RED FLAG WARNING: ${redFlags.severityLevel}`
                    : 'NO ACUTE RED FLAGS DETECTED (Routine / Semi-Urgent)'}
                </Text>
                <Text
                  style={[
                    styles.safetySub,
                    { color: redFlags.detected ? '#B91C1C' : '#047857' },
                  ]}
                >
                  {redFlags.recommendation}
                </Text>
              </View>
            </View>

            {/* Voice Intake Audio Playback Widget */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="mic-circle" size={20} color="#005EB8" />
                <Text style={styles.cardTitle}>Patient Native Voice Intake</Text>
              </View>
              <AudioPlayerWidget
                audioUri={audioUri}
                label={`Spoken in ${patientLanguage.name} (${patientLanguage.code})`}
                sublabel="Listen to authentic patient pronunciation and tone"
              />
            </View>

            {/* Bilingual Verbatim & Translation */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="language" size={20} color="#005EB8" />
                <Text style={styles.cardTitle}>Verbatim Transcript & Translation</Text>
              </View>

              <View style={styles.bilingualBox}>
                <Text style={styles.transcriptLangTag}>
                  {patientLanguage.flag} Spoken Verbatim ({patientLanguage.nativeName}):
                </Text>
                <Text style={styles.transcriptText}>
                  "{verbatimTranscript || 'No speech recorded yet.'}"
                </Text>

                <View style={styles.divider} />

                <Text style={styles.transcriptLangTag}>🇬🇧 English Clinical Translation:</Text>
                <Text style={styles.englishText}>
                  Chief Complaint: {extraction.chiefComplaint}
                  {'\n'}
                  HPI: {extraction.historyOfPresentIllness}
                </Text>
              </View>
            </View>

            {/* SNOMED CT / ICD-10 Grounding Concepts */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="medical" size={20} color="#005EB8" />
                <Text style={styles.cardTitle}>SNOMED CT & ICD-10 Clinical Grounding</Text>
              </View>
              <Text style={styles.snomedExplainer}>
                Automated Atlas Vector Search mapped patient lay phrasing to NHS TRUD clinical concepts:
              </Text>

              {groundedTerms.map((term, i) => (
                <View key={term.id || i} style={styles.snomedBox}>
                  <View style={styles.snomedTopRow}>
                    <View style={styles.tagSnomed}>
                      <Text style={styles.tagSnomedText}>SNOMED {term.snomedConceptId}</Text>
                    </View>
                    {term.icd10Code && (
                      <View style={styles.tagIcd}>
                        <Text style={styles.tagIcdText}>ICD-10 {term.icd10Code}</Text>
                      </View>
                    )}
                    <View style={styles.tagScore}>
                      <Text style={styles.tagScoreText}>
                        {(term.matchScore * 100).toFixed(0)}% Match
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.snomedTerm}>{term.snomedPreferredTerm}</Text>
                  <Text style={styles.snomedDef}>
                    <Text style={{ fontWeight: '700' }}>NHS Definition:</Text> {term.plainExplanation}
                  </Text>
                </View>
              ))}
            </View>

            {/* Structured SBAR Clinical Table */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="analytics" size={20} color="#005EB8" />
                <Text style={styles.cardTitle}>Structured Clinical Extraction (SBAR)</Text>
              </View>

              <View style={styles.sbarRow}>
                <Text style={styles.sbarLabel}>Chief Complaint:</Text>
                <Text style={styles.sbarValue}>{extraction.chiefComplaint}</Text>
              </View>

              <View style={styles.sbarRow}>
                <Text style={styles.sbarLabel}>Location:</Text>
                <Text style={styles.sbarValue}>
                  {extraction.symptoms[0]?.location || 'Upper abdomen'}
                </Text>
              </View>

              <View style={styles.sbarRow}>
                <Text style={styles.sbarLabel}>Onset & Duration:</Text>
                <Text style={styles.sbarValue}>
                  {extraction.symptoms[0]?.onset || '3 days ago'} (
                  {extraction.symptoms[0]?.duration || 'Episodes 1-2h'})
                </Text>
              </View>

              <View style={styles.sbarRow}>
                <Text style={styles.sbarLabel}>Severity:</Text>
                <Text style={styles.sbarValue}>
                  {extraction.symptoms[0]?.severity || 7}/10 ({extraction.symptoms[0]?.character || 'Burning'})
                </Text>
              </View>

              <View style={styles.sbarRow}>
                <Text style={styles.sbarLabel}>Aggravating Factors:</Text>
                <Text style={styles.sbarValue}>
                  {extraction.symptoms[0]?.aggravating || 'Worse after meals'}
                </Text>
              </View>

              <View style={styles.sbarRow}>
                <Text style={styles.sbarLabel}>Medications:</Text>
                <Text style={styles.sbarValue}>
                  {Array.isArray(extraction.medications)
                    ? extraction.medications.join(', ')
                    : extraction.medications}
                </Text>
              </View>

              <View style={styles.sbarRow}>
                <Text style={styles.sbarLabel}>Allergies:</Text>
                <Text style={styles.sbarValue}>
                  {Array.isArray(extraction.allergies)
                    ? extraction.allergies.join(', ')
                    : extraction.allergies}
                </Text>
              </View>

              <View style={styles.sbarRow}>
                <Text style={styles.sbarLabel}>Ambiguities:</Text>
                <Text style={styles.sbarValueWarn}>
                  {extraction.ambiguities.join('; ')}
                </Text>
              </View>
            </View>

            {/* Quick Action to Ask Follow-up */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setActiveTab('ASK_FOLLOWUP')}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-ellipses" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>
                Ask Clinical Follow-Up Question
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ===================== TAB 2: ASK FOLLOW-UP ===================== */}
        {activeTab === 'ASK_FOLLOWUP' && (
          <View style={styles.contentWrap}>
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="send" size={20} color="#005EB8" />
                <Text style={styles.cardTitle}>Ask Follow-Up (During Visit)</Text>
              </View>
              <Text style={styles.cardSubtitle}>
                Type or select a clinical question. The system simplifies medical jargon and translates directly into {patientLanguage.nativeName} on the patient's phone.
              </Text>

              {/* Doctor Input Box */}
              <TextInput
                style={styles.doctorInput}
                multiline
                numberOfLines={3}
                placeholder="Type question or medical inquiry in English..."
                placeholderTextColor="#94A3B8"
                value={doctorQuestionInput}
                onChangeText={setDoctorQuestionInput}
              />

              <TouchableOpacity
                style={[
                  styles.sendFollowUpBtn,
                  isTranslating && styles.sendFollowUpBtnDisabled,
                ]}
                onPress={() => handleSendFollowUp(doctorQuestionInput)}
                disabled={isTranslating}
              >
                {isTranslating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="language" size={18} color="#FFFFFF" />
                    <Text style={styles.sendFollowUpText}>
                      Translate & Send to Patient App
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Quick Clinical Preset Questions */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>1-Click Clinical Follow-Up Presets:</Text>
              <Text style={styles.cardSubtitle}>Tap to immediately simplify, translate, and send:</Text>

              {quickDoctorQuestions.map((q, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.presetItem}
                  onPress={() => handleSendFollowUp(q)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="help-circle-outline" size={18} color="#005EB8" />
                  <Text style={styles.presetText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* History of Sent Follow-Ups & Patient Replies */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Consultation Exchange History ({followUps.length})</Text>

              {followUps.length === 0 ? (
                <Text style={styles.emptyHistory}>No follow-ups sent during this visit yet.</Text>
              ) : (
                followUps.map((fu, idx) => (
                  <View key={fu.id || idx} style={styles.fuHistoryItem}>
                    <View style={styles.fuHistoryHeader}>
                      <Text style={styles.fuHistoryDoc}>Doctor (English):</Text>
                      <Text style={styles.fuHistoryTime}>{fu.timestamp}</Text>
                    </View>
                    <Text style={styles.fuHistoryDocQ}>"{fu.doctorQuestionRaw}"</Text>

                    <View style={styles.fuHistoryPatientBox}>
                      <Text style={styles.fuHistoryPatTitle}>
                        {patientLanguage.flag} Delivered to Patient ({patientLanguage.nativeName}):
                      </Text>
                      <Text style={styles.fuHistoryPatQ}>"{fu.translatedPatientLang}"</Text>
                      <Text style={styles.fuHistorySimplified}>
                        Simplified meaning: {fu.simplifiedEnglish}
                      </Text>
                    </View>
                  </View>
                ))
              )}

              {/* Patient Replies Received */}
              {patientReplies.length > 0 && (
                <View style={styles.patientRepliesBox}>
                  <Text style={styles.patientRepliesTitle}>Incoming Patient Responses:</Text>
                  {patientReplies.map((reply, rIdx) => (
                    <View key={rIdx} style={styles.replyItem}>
                      <Ionicons name="chatbubble" size={14} color="#059669" />
                      <Text style={styles.replyText}>"{reply}"</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  doctorHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  doctorHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  patientInfoCol: {
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  patientMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  clinicianBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 4,
  },
  clinicianBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#005EB8',
  },
  subTabBar: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    paddingBottom: 8,
  },
  subTabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    backgroundColor: '#F8FAFC',
  },
  subTabButtonActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#005EB8',
  },
  subTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  subTabTextActive: {
    color: '#005EB8',
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
    padding: 16,
  },
  contentWrap: {
    paddingBottom: 40,
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
  },
  safetyCardGreen: {
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
  },
  safetyCardRed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  safetyTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  safetySub: {
    fontSize: 11,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  bilingualBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  transcriptLangTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  transcriptText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#1E293B',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 10,
  },
  englishText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#005EB8',
    lineHeight: 20,
  },
  snomedExplainer: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 10,
  },
  snomedBox: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  snomedTopRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  tagSnomed: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagSnomedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E40AF',
  },
  tagIcd: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagIcdText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4338CA',
  },
  tagScore: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagScoreText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  snomedTerm: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  snomedDef: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
  },
  sbarRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sbarLabel: {
    width: 120,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  sbarValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  sbarValueWarn: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  actionButton: {
    backgroundColor: '#005EB8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  doctorInput: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  sendFollowUpBtn: {
    backgroundColor: '#005EB8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  sendFollowUpBtnDisabled: {
    opacity: 0.6,
  },
  sendFollowUpText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    gap: 8,
  },
  presetText: {
    flex: 1,
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
  },
  emptyHistory: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  fuHistoryItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#005EB8',
  },
  fuHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  fuHistoryDoc: {
    fontSize: 11,
    fontWeight: '700',
    color: '#005EB8',
  },
  fuHistoryTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  fuHistoryDocQ: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
    marginBottom: 6,
  },
  fuHistoryPatientBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 8,
  },
  fuHistoryPatTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 2,
  },
  fuHistoryPatQ: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  fuHistorySimplified: {
    fontSize: 11,
    color: '#475569',
    fontStyle: 'italic',
    marginTop: 4,
  },
  patientRepliesBox: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
  patientRepliesTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 6,
  },
  replyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
    gap: 6,
  },
  replyText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '700',
  },
});
