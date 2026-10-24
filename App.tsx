import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SupportedLanguage, StructuredExtraction, SNOMEDGrounding, DoctorFollowUp, RedFlagAssessment } from './src/types';
import { SUPPORTED_LANGUAGES, evaluateRedFlags } from './src/data/snomedData';
import { LanguageModal } from './src/components/LanguageModal';
import { PatientPortalView } from './src/views/PatientPortalView';
import { DoctorPortalView } from './src/views/DoctorPortalView';

export default function App() {
  // Two Accounts: Patient vs Doctor
  const [activeAccount, setActiveAccount] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [languageModalVisible, setLanguageModalVisible] = useState<boolean>(false);

  // Active Patient Language (Polish default as per NHS migrant intake demo)
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(SUPPORTED_LANGUAGES[0]);

  // Shared Patient Audio & Transcripts
  const [audioUri, setAudioUri] = useState<string | undefined>(undefined);
  const [verbatimTranscript, setVerbatimTranscript] = useState<string>(
    'Od trzech dni czuję mocne pieczenie w żołądku po jedzeniu, jakby palił mnie ogień. Biorę leki na nadciśnienie, nie mam alergii.'
  );
  const [sentToDoctor, setSentToDoctor] = useState<boolean>(true);

  // Red Flags
  const [redFlags, setRedFlags] = useState<RedFlagAssessment>({
    detected: false,
    severityLevel: 'NONE',
    symptomsTriggered: [],
    recommendation: 'No acute emergency red flags detected.',
    recommendationInPatientLang: 'Brak ostrych objawów zagrożenia życia.',
  });

  // Clinical Structured Extraction
  const [extraction, setExtraction] = useState<StructuredExtraction>({
    chiefComplaint: 'Epigastric pain / Dyspepsia',
    chiefComplaintInPatientLang: 'Pieczenie w żołądku po jedzeniu',
    historyOfPresentIllness:
      'Patient reports severe burning discomfort in the upper epigastric region for 3 days, worsened after meal ingestion. On blood pressure medication.',
    symptoms: [
      {
        symptom: 'Epigastric burning / Dyspepsia',
        symptomInPatientLang: 'Pieczenie w żołądku',
        onset: '3 days ago',
        duration: '1-2 hour episodes',
        severity: 7,
        location: 'Epigastrium / Upper abdomen',
        character: 'Burning / Acid reflux',
        aggravating: 'Worse after meals',
        relieving: 'Not reported',
      },
    ],
    medications: ['Ramipril (antihypertensive)'],
    allergies: ['No known drug allergies (NKDA)'],
    redFlags: {
      detected: false,
      severityLevel: 'NONE',
      symptomsTriggered: [],
      recommendation: 'No acute emergency red flags.',
      recommendationInPatientLang: 'Brak ostrych objawów zagrożenia życia.',
    },
    ambiguities: ['Exact meal timing relative to pain onset'],
    confidenceScore: 0.95,
  });

  // Grounded SNOMED CT Concepts
  const [groundedTerms, setGroundedTerms] = useState<SNOMEDGrounding[]>([
    {
      id: 'sn-25376007',
      patientPhrase: 'pieczenie w żołądku',
      patientLanguage: 'pl',
      englishLayPhrase: 'burning stomach / indigestion / acid heartburn',
      snomedConceptId: '25376007',
      snomedPreferredTerm: 'Dyspepsia / Epigastric pain',
      icd10Code: 'K30',
      clinicalCategory: 'Symptom',
      plainExplanation: 'Irritation or burning sensation in the upper digestive tract or stomach.',
      plainExplanationInPatientLang: 'Uczucie pieczenia lub kwasowości w górnej części żołądka.',
      matchScore: 0.98,
      source: 'snomed-ct-catalog',
    },
  ]);

  // Doctor Follow-Ups Delivered to Patient App
  const [followUps, setFollowUps] = useState<DoctorFollowUp[]>([
    {
      id: 'fu-init',
      doctorQuestionRaw: 'Does the epigastric pain radiate posteriorly to your thoracic back or shoulder?',
      simplifiedEnglish: 'Does the pain spread or shoot to your back or shoulders?',
      translatedPatientLang: 'Czy ten ból promieniuje lub przechodzi na plecy albo w okolice łopatek?',
      patientSuggestedQuestions: [
        'Nie, ból jest tylko z przodu w żołądku',
        'Czasami czuję ból między łopatkami',
        'Tylko wtedy, gdy się położę',
      ],
      timestamp: '11:42',
    },
  ]);

  // Patient Replies sent back to Doctor Software
  const [patientReplies, setPatientReplies] = useState<string[]>([
    'Nie, ból jest tylko z przodu w żołądku (Patient confirmed via app)',
  ]);

  const handleSelectLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
    if (verbatimTranscript) {
      setRedFlags(evaluateRedFlags(verbatimTranscript, lang.code));
    }
  };

  const handleAddPatientReply = (reply: string) => {
    setPatientReplies((prev) => [reply, ...prev]);
  };

  const handleSendFollowUp = (newFu: DoctorFollowUp) => {
    setFollowUps((prev) => [newFu, ...prev]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="light" />

      {/* Top NHS App Header */}
      <View style={styles.appHeader}>
        <View style={styles.headerTitleRow}>
          <View style={styles.nhsBadge}>
            <Text style={styles.nhsLogoText}>NHS</Text>
          </View>
          <View>
            <Text style={styles.appTitle}>CliniBridge</Text>
            <Text style={styles.appSubtitle}>Multilingual Clinical Triage</Text>
          </View>
        </View>

        {/* Two Accounts Switcher */}
        <View style={styles.accountSwitcher}>
          <TouchableOpacity
            style={[
              styles.accountTab,
              activeAccount === 'PATIENT' && styles.accountTabActivePatient,
            ]}
            onPress={() => setActiveAccount('PATIENT')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="person"
              size={14}
              color={activeAccount === 'PATIENT' ? '#005EB8' : '#94A3B8'}
            />
            <Text
              style={[
                styles.accountTabText,
                activeAccount === 'PATIENT' && styles.accountTabTextActivePatient,
              ]}
            >
              Patient App
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.accountTab,
              activeAccount === 'DOCTOR' && styles.accountTabActiveDoctor,
            ]}
            onPress={() => setActiveAccount('DOCTOR')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="medkit"
              size={14}
              color={activeAccount === 'DOCTOR' ? '#D97706' : '#94A3B8'}
            />
            <Text
              style={[
                styles.accountTabText,
                activeAccount === 'DOCTOR' && styles.accountTabTextActiveDoctor,
              ]}
            >
              Doctor Software
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main View: Patient Portal vs Doctor Software */}
      <View style={styles.mainContent}>
        {activeAccount === 'PATIENT' ? (
          <PatientPortalView
            patientLanguage={currentLanguage}
            onOpenLanguagePicker={() => setLanguageModalVisible(true)}
            redFlags={redFlags}
            onUpdateRedFlags={setRedFlags}
            extraction={extraction}
            onUpdateExtraction={setExtraction}
            groundedTerms={groundedTerms}
            onUpdateGroundedTerms={setGroundedTerms}
            verbatimTranscript={verbatimTranscript}
            onUpdateTranscript={setVerbatimTranscript}
            audioUri={audioUri}
            onUpdateAudioUri={setAudioUri}
            followUps={followUps}
            onAddPatientReply={handleAddPatientReply}
            onSendToDoctor={() => setSentToDoctor(true)}
            sentToDoctor={sentToDoctor}
          />
        ) : (
          <DoctorPortalView
            patientLanguage={currentLanguage}
            redFlags={redFlags}
            extraction={extraction}
            groundedTerms={groundedTerms}
            verbatimTranscript={verbatimTranscript}
            audioUri={audioUri}
            followUps={followUps}
            onSendFollowUp={handleSendFollowUp}
            patientReplies={patientReplies}
          />
        )}
      </View>

      {/* Language Modal */}
      <LanguageModal
        visible={languageModalVisible}
        selectedLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        onClose={() => setLanguageModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#005EB8',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  appHeader: {
    backgroundColor: '#005EB8',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  nhsBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 10,
  },
  nhsLogoText: {
    color: '#005EB8',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  appSubtitle: {
    color: '#BFDBFE',
    fontSize: 11,
    fontWeight: '600',
  },
  accountSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 47, 92, 0.6)',
    borderRadius: 10,
    padding: 3,
  },
  accountTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  accountTabActivePatient: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  accountTabActiveDoctor: {
    backgroundColor: '#FEF3C7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  accountTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BFDBFE',
  },
  accountTabTextActivePatient: {
    color: '#005EB8',
  },
  accountTabTextActiveDoctor: {
    color: '#B45309',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
});
