import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SupportedLanguage } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/snomedData';

interface LanguageModalProps {
  visible: boolean;
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onClose: () => void;
}

export function LanguageModal({
  visible,
  selectedLanguage,
  onSelectLanguage,
  onClose,
}: LanguageModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Select Language</Text>
              <Text style={styles.subtitle}>Wybierz język / Choose language</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#334155" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === selectedLanguage.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.languageItem, isSelected && styles.languageItemSelected]}
                  onPress={() => {
                    onSelectLanguage(lang);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.flag}>{lang.flag}</Text>
                  <View style={styles.langTextContainer}>
                    <Text style={[styles.nativeName, isSelected && styles.selectedText]}>
                      {lang.nativeName}
                    </Text>
                    <Text style={styles.englishName}>{lang.name}</Text>
                    <Text style={styles.greetingSample}>"{lang.greeting}"</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={22} color="#005EB8" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 36,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  list: {
    marginBottom: 10,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  languageItemSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#005EB8',
    borderWidth: 2,
  },
  flag: {
    fontSize: 28,
    marginRight: 14,
  },
  langTextContainer: {
    flex: 1,
  },
  nativeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  englishName: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  greetingSample: {
    fontSize: 11,
    color: '#005EB8',
    fontStyle: 'italic',
    marginTop: 2,
  },
  selectedText: {
    color: '#005EB8',
  },
});
