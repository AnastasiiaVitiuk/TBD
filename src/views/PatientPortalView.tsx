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
import { RedFlagBanner } from '../components/RedFlagBanner';
import { AudioPlayerWidget } from '../components/AudioPlayerWidget';
import { SafeAudioService } from '../services/safeAudio';
import { extractClinicalInformation, groundToSNOMED } from '../services/clinicalService';

interface PatientPortalViewProps {
  patientLanguage: SupportedLanguage;
  onOpenLanguagePicker: () => void;
  redFlags: RedFlagAssessment;
  onUpdateRedFlags: (flags: RedFlagAssessment) => void;
  extraction: StructuredExtraction;
  onUpdateExtraction: (ext: StructuredExtraction) => void;
  groundedTerms: SNOMEDGrounding[];
  onUpdateGroundedTerms: (terms: SNOMEDGrounding[]) => void;
  verbatimTranscript: string;
  onUpdateTranscript: (text: string) => void;
  audioUri?: string;
  onUpdateAudioUri: (uri: string) => void;
  followUps: DoctorFollowUp[];
  onAddPatientReply: (replyText: string) => void;
  onSendToDoctor: () => void;
  sentToDoctor: boolean;
}

export function PatientPortalView({
  patientLanguage,
  onOpenLanguagePicker,
  redFlags,
  onUpdateRedFlags,
  extraction,
  onUpdateExtraction,
  groundedTerms,
  onUpdateGroundedTerms,
  verbatimTranscript,
  onUpdateTranscript,
  audioUri,
  onUpdateAudioUri,
  followUps,
  onAddPatientReply,
  onSendToDoctor,
  sentToDoctor,
}: PatientPortalViewProps) {
  // Navigation tab for patient
  const [activeTab, setActiveTab] = useState<'RECORD' | 'SUMMARY' | 'DOCTOR_MESSAGES'>('RECORD');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [patientReplyText, setPatientReplyText] = useState<string>('');

  // Quick symptom sample chips in patient's language
  const getQuickSymptomChips = (langCode: string) => {
    switch (langCode) {
      case 'pl':
        return [
          'Pieczenie w żołądku po jedzeniu',
          'Ostry ból w klatce piersiowej',
          'Silny pulsujący ból głowy',
          'Duszność i trudności w oddychaniu',
          'Zawroty głowy i osłabienie',
        ];
      case 'es':
        return [
          'Ardor en el estómago después de comer',
          'Dolor fuerte en el pecho',
          'Dolor de cabeza punzante',
          'Falta de aire al respirar',
          'Mareo y debilidad',
        ];
      case 'uk':
        return [
          'Печіння в шлунку після їжі',
          'Гострий біль у грудях',
          'Сильний головний біль',
          'Задишка та утруднене дихання',
          'Запаморочення та слабкість',
        ];
      case 'ar':
        return [
          'حرقة في المعدة بعد الأكل',
          'ألم حاد في الصدر',
          'صداع نابض شديد',
          'صعوبة وضيق في التنفس',
        ];
      default:
        return [
          'Burning stomach after meals',
          'Sharp pressure in chest',
          'Severe throbbing headache',
          'Shortness of breath',
          'Dizziness and nausea',
        ];
    }
  };

  // Start Voice Recording safely
  const startRecording = async () => {
    setIsRecording(true);
    setRecordingDuration(0);
    await SafeAudioService.startRecording((seconds) => {
      setRecordingDuration(seconds);
    });
  };

  // Stop Voice Recording safely
  const stopRecording = async () => {
    setIsRecording(false);
    const result = await SafeAudioService.stopRecording();
    onUpdateAudioUri(result.uri);

    // Set sample transcript if empty
    if (!verbatimTranscript || verbatimTranscript.trim().length === 0) {
      if (patientLanguage.code === 'pl') {
        onUpdateTranscript(
          'Od trzech dni czuję mocne pieczenie w żołądku po jedzeniu, jakby palił mnie ogień. Biorę leki na nadciśnienie.'
        );
      } else if (patientLanguage.code === 'es') {
        onUpdateTranscript(
          'Desde hace tres días siento un ardor muy fuerte en el estómago después de comer, como fuego. Tomo medicina para la tensión.'
        );
      } else {
        onUpdateTranscript(
          'For the past three days I have had a severe burning sensation in my stomach after eating. I take blood pressure medicine.'
        );
      }
    }
  };

  // Handle Translate and Send to Doctor
  const handleTranslateAndSend = async () => {
    if (!verbatimTranscript.trim()) {
      Alert.alert('Speak or Enter Symptoms', 'Please speak or enter your symptoms before sending.');
      return;
    }

    setIsProcessing(true);
    try {
      const extracted = await extractClinicalInformation(verbatimTranscript, patientLanguage);
      onUpdateExtraction(extracted);
      onUpdateRedFlags(extracted.redFlags);

      const grounded = await groundToSNOMED(verbatimTranscript, patientLanguage.code);
      if (grounded && grounded.length > 0) {
        onUpdateGroundedTerms(grounded);
      }

      onSendToDoctor();
      setActiveTab('SUMMARY');
    } catch (e) {
      onSendToDoctor();
      setActiveTab('SUMMARY');
    } finally {
      setIsProcessing(false);
    }
  };

  // Read out follow-up question via Safe Speech
  const handleSpeakText = (text: string) => {
    SafeAudioService.speak(text, patientLanguage.speechCode);
  };

  return (
    <View style={styles.container}>
      {/* Top Welcome & Language Selection Banner */}
      <View style={styles.topCard}>
        <View style={styles.topCardRow}>
          <View style={styles.welcomeInfo}>
            <Text style={styles.greetingText}>{patientLanguage.greeting}</Text>
            <Text style={styles.welcomeSubtext}>
              Tell us in {patientLanguage.nativeName} — your doctor will see this translated into English.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.languageBadge}
            onPress={onOpenLanguagePicker}
            activeOpacity={0.7}
          >
            <Text style={styles.flagText}>{patientLanguage.flag}</Text>
            <Text style={styles.languageNameText}>{patientLanguage.nativeName}</Text>
            <Ionicons name="chevron-down" size={14} color="#005EB8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Emergency Red Flag Alert */}
      <RedFlagBanner redFlags={redFlags} patientLanguage={patientLanguage} />

      {/* 3 Intuitive Tab Switchers */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'RECORD' && styles.tabButtonActive]}
          onPress={() => setActiveTab('RECORD')}
        >
          <Ionicons
            name="mic"
            size={18}
            color={activeTab === 'RECORD' ? '#005EB8' : '#64748B'}
          />
          <Text style={[styles.tabText, activeTab === 'RECORD' && styles.tabTextActive]}>
            1. Speak & Record
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'SUMMARY' && styles.tabButtonActive]}
          onPress={() => setActiveTab('SUMMARY')}
        >
          <Ionicons
            name="document-text"
            size={18}
            color={activeTab === 'SUMMARY' ? '#005EB8' : '#64748B'}
          />
          <Text style={[styles.tabText, activeTab === 'SUMMARY' && styles.tabTextActive]}>
            2. Doctor Preview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'DOCTOR_MESSAGES' && styles.tabButtonActive]}
          onPress={() => setActiveTab('DOCTOR_MESSAGES')}
        >
          <Ionicons
            name="chatbubble-ellipses"
            size={18}
            color={activeTab === 'DOCTOR_MESSAGES' ? '#005EB8' : '#64748B'}
          />
          <Text style={[styles.tabText, activeTab === 'DOCTOR_MESSAGES' && styles.tabTextActive]}>
            3. Follow-ups
          </Text>
          {followUps.length > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{followUps.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ===================== TAB 1: RECORD & INTAKE ===================== */}
        {activeTab === 'RECORD' && (
          <View style={styles.tabContent}>
            {/* Big Hero Microphone Button */}
            <View style={styles.micHeroContainer}>
              <TouchableOpacity
                style={[styles.bigMicButton, isRecording && styles.bigMicButtonRecording]}
                onPress={isRecording ? stopRecording : startRecording}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={isRecording ? 'square' : 'mic'}
                  size={44}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <Text style={styles.micStatusTitle}>
                {isRecording ? 'Listening in ' + patientLanguage.nativeName + '...' : 'Tap to Speak'}
              </Text>
              <Text style={styles.micStatusSubtitle}>
                {isRecording
                  ? `Recording: 00:${recordingDuration < 10 ? '0' : ''}${recordingDuration} (Tap to finish)`
                  : 'Describe your symptoms in your own words'}
              </Text>
            </View>

            {/* Audio Recording Playback if available */}
            {audioUri && (
              <View style={styles.audioPreviewCard}>
                <Text style={styles.cardHeader}>Your Voice Intake</Text>
                <AudioPlayerWidget
                  audioUri={audioUri}
                  label="Recorded Audio"
                  sublabel={`Ready to send to doctor (${patientLanguage.nativeName})`}
                />
              </View>
            )}

            {/* Quick Symptom Chips */}
            <View style={styles.chipsSection}>
              <Text style={styles.sectionTitle}>Or tap a common symptom:</Text>
              <View style={styles.chipsWrapper}>
                {getQuickSymptomChips(patientLanguage.code).map((chip, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.symptomChip}
                    onPress={() => {
                      const updated = verbatimTranscript ? `${verbatimTranscript}. ${chip}` : chip;
                      onUpdateTranscript(updated);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add-circle" size={16} color="#005EB8" />
                    <Text style={styles.symptomChipText}>{chip}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Symptom Input Box */}
            <View style={styles.inputCard}>
              <Text style={styles.cardHeader}>What you said ({patientLanguage.nativeName}):</Text>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={3}
                value={verbatimTranscript}
                onChangeText={onUpdateTranscript}
                placeholder={`Type or review what you said in ${patientLanguage.nativeName}...`}
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Primary Action Button: Send Voice & Translation */}
            <TouchableOpacity
              style={[styles.primaryButton, isProcessing && styles.primaryButtonDisabled]}
              onPress={handleTranslateAndSend}
              disabled={isProcessing}
              activeOpacity={0.8}
            >
              {isProcessing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>
                    Send Voice & Translation to Doctor
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {sentToDoctor && (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={20} color="#059669" />
                <Text style={styles.successBannerText}>
                  Sent to Doctor's Visit Dashboard! Your GP can now review your voice & translation.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ===================== TAB 2: DOCTOR SUMMARY & SNOMED ===================== */}
        {activeTab === 'SUMMARY' && (
          <View style={styles.tabContent}>
            {/* Sync Status Banner */}
            <View style={styles.statusBanner}>
              <Ionicons name="checkmark-done-circle" size={22} color="#005EB8" />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.statusTitle}>Synced with Doctor's Visit Software</Text>
                <Text style={styles.statusSubtitle}>
                  The clinician receives your voice recording + English translation.
                </Text>
              </View>
            </View>

            {/* Voice Audio Card */}
            {audioUri && (
              <View style={styles.card}>
                <Text style={styles.cardHeader}>Voice Recording Sent to Clinician</Text>
                <AudioPlayerWidget
                  audioUri={audioUri}
                  label="Patient Voice Intake Audio"
                  sublabel="Sent to doctor for audio listening"
                />
              </View>
            )}

            {/* Side-by-Side: Patient Words vs Doctor English */}
            <View style={styles.bilingualCard}>
              <View style={styles.bilingualCol}>
                <Text style={styles.bilingualColTitle}>
                  {patientLanguage.flag} What You Said ({patientLanguage.nativeName})
                </Text>
                <Text style={styles.bilingualColText}>{verbatimTranscript}</Text>
              </View>

              <View style={styles.bilingualDivider} />

              <View style={styles.bilingualCol}>
                <Text style={styles.bilingualColTitle}>🇬🇧 English Translation for Doctor</Text>
                <Text style={styles.bilingualColTextHighlight}>
                  {extraction.chiefComplaint}: {extraction.historyOfPresentIllness}
                </Text>
              </View>
            </View>

            {/* SNOMED CT Grounding Card */}
            <View style={styles.card}>
              <View style={styles.snomedHeader}>
                <Ionicons name="shield-checkmark" size={20} color="#005EB8" />
                <Text style={styles.cardHeader}>NHS Clinical Terminology (SNOMED CT)</Text>
              </View>
              <Text style={styles.cardExplainer}>
                We map your everyday words to verified medical terms so the doctor understands accurately:
              </Text>

              {groundedTerms.map((term, i) => (
                <View key={term.id || i} style={styles.snomedItem}>
                  <View style={styles.snomedBadgeRow}>
                    <View style={styles.snomedBadge}>
                      <Text style={styles.snomedBadgeText}>SNOMED CT {term.snomedConceptId}</Text>
                    </View>
                    {term.icd10Code && (
                      <View style={styles.icdBadge}>
                        <Text style={styles.icdBadgeText}>ICD-10 {term.icd10Code}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.snomedTermTitle}>{term.snomedPreferredTerm}</Text>
                  <Text style={styles.snomedPlainLang}>
                    💬 <Text style={{ fontWeight: '700' }}>Explanation in {patientLanguage.nativeName}:</Text>{' '}
                    {term.plainExplanationInPatientLang}
                  </Text>
                </View>
              ))}
            </View>

            {/* Action to go to Doctor Messages */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setActiveTab('DOCTOR_MESSAGES')}
            >
              <Ionicons name="chatbubbles" size={18} color="#005EB8" />
              <Text style={styles.secondaryButtonText}>
                Check Doctor's Follow-up Questions ({followUps.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ===================== TAB 3: DOCTOR FOLLOW-UPS ===================== */}
        {activeTab === 'DOCTOR_MESSAGES' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeaderWrap}>
              <Text style={styles.sectionMainTitle}>Doctor's Follow-Up Questions</Text>
              <Text style={styles.sectionSubtitle}>
                During your visit, your doctor can ask questions. They appear here in simple language with an audio button.
              </Text>
            </View>

            {followUps.length === 0 ? (
              <View style={styles.emptyFollowUps}>
                <Ionicons name="hourglass-outline" size={40} color="#94A3B8" />
                <Text style={styles.emptyTitle}>Waiting for Doctor...</Text>
                <Text style={styles.emptySub}>
                  Switch to the "Doctor Portal" at the top to ask a clinical follow-up question.
                </Text>
              </View>
            ) : (
              followUps.map((fu, idx) => (
                <View key={fu.id || idx} style={styles.followUpCard}>
                  <View style={styles.followUpHeader}>
                    <View style={styles.doctorBadge}>
                      <Ionicons name="medkit" size={14} color="#005EB8" />
                      <Text style={styles.doctorBadgeText}>Dr. Sarah Jenkins (GP)</Text>
                    </View>
                    <Text style={styles.fuTimestamp}>{fu.timestamp}</Text>
                  </View>

                  {/* Translated question in patient's language */}
                  <View style={styles.fuQuestionBox}>
                    <Text style={styles.fuQuestionLabel}>
                      Question in {patientLanguage.nativeName}:
                    </Text>
                    <Text style={styles.fuQuestionText}>{fu.translatedPatientLang}</Text>
                  </View>

                  {/* Plain English explanation */}
                  <Text style={styles.fuSimplifiedEnglish}>
                    Plain explanation: "{fu.simplifiedEnglish}"
                  </Text>

                  {/* Listen Aloud Button */}
                  <TouchableOpacity
                    style={styles.listenButton}
                    onPress={() => handleSpeakText(fu.translatedPatientLang)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="volume-high" size={18} color="#005EB8" />
                    <Text style={styles.listenButtonText}>
                      🔊 Listen in {patientLanguage.nativeName}
                    </Text>
                  </TouchableOpacity>

                  {/* Quick Suggested Answers */}
                  {fu.patientSuggestedQuestions && fu.patientSuggestedQuestions.length > 0 && (
                    <View style={styles.suggestedWrap}>
                      <Text style={styles.suggestedTitle}>Quick reply to doctor:</Text>
                      {fu.patientSuggestedQuestions.map((q, qIdx) => (
                        <TouchableOpacity
                          key={qIdx}
                          style={styles.suggestedChip}
                          onPress={() => {
                            onAddPatientReply(q);
                            Alert.alert('Sent to Doctor', `Your reply: "${q}" was sent to the doctor.`);
                          }}
                        >
                          <Ionicons name="arrow-undo" size={14} color="#005EB8" />
                          <Text style={styles.suggestedChipText}>{q}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))
            )}

            {/* Custom Patient Reply Box */}
            <View style={styles.replyBox}>
              <Text style={styles.replyBoxTitle}>Send custom reply back to doctor:</Text>
              <TextInput
                style={styles.replyInput}
                placeholder={`Type your reply in ${patientLanguage.nativeName}...`}
                placeholderTextColor="#94A3B8"
                value={patientReplyText}
                onChangeText={setPatientReplyText}
              />
              <TouchableOpacity
                style={styles.replySendButton}
                onPress={() => {
                  if (patientReplyText.trim()) {
                    onAddPatientReply(patientReplyText);
                    setPatientReplyText('');
                    Alert.alert('Reply Sent', 'Your doctor received your answer.');
                  }
                }}
              >
                <Ionicons name="send" size={16} color="#FFFFFF" />
                <Text style={styles.replySendText}>Send Reply</Text>
              </TouchableOpacity>
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
  topCard: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeInfo: {
    flex: 1,
    marginRight: 10,
  },
  greetingText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#005EB8',
  },
  welcomeSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  languageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  flagText: {
    fontSize: 16,
  },
  languageNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#005EB8',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    position: 'relative',
  },
  tabButtonActive: {
    backgroundColor: '#EFF6FF',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#005EB8',
    fontWeight: '700',
  },
  unreadBadge: {
    position: 'absolute',
    top: 2,
    right: 4,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    paddingBottom: 40,
  },
  micHeroContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  bigMicButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#005EB8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#005EB8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  bigMicButtonRecording: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
  },
  micStatusTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 14,
  },
  micStatusSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  audioPreviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  chipsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  chipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 6,
  },
  symptomChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: '#005EB8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#005EB8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  successBannerText: {
    flex: 1,
    color: '#065F46',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
  },
  statusSubtitle: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  bilingualCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bilingualCol: {
    marginBottom: 10,
  },
  bilingualColTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  bilingualColText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },
  bilingualColTextHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: '#005EB8',
    lineHeight: 20,
  },
  bilingualDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  snomedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  cardExplainer: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  snomedItem: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  snomedBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  snomedBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  snomedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E40AF',
  },
  icdBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  icdBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338CA',
  },
  snomedTermTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  snomedPlainLang: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderColor: '#005EB8',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#005EB8',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeaderWrap: {
    marginBottom: 14,
  },
  sectionMainTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  emptyFollowUps: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  followUpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderColor: '#BFDBFE',
    borderWidth: 1.5,
  },
  followUpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  doctorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  doctorBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#005EB8',
  },
  fuTimestamp: {
    fontSize: 11,
    color: '#94A3B8',
  },
  fuQuestionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#005EB8',
  },
  fuQuestionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  fuQuestionText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
  },
  fuSimplifiedEnglish: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 8,
    gap: 6,
    marginBottom: 12,
  },
  listenButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#005EB8',
  },
  suggestedWrap: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  suggestedTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  suggestedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
    gap: 6,
  },
  suggestedChipText: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
    flex: 1,
  },
  replyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginTop: 6,
  },
  replyBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  replyInput: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 10,
  },
  replySendButton: {
    backgroundColor: '#005EB8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  replySendText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
