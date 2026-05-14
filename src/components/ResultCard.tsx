import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import { LANGUAGES } from '../services/translate';
import { colors } from '../theme';

interface Props {
  text: string;
  lang: string;
}

export default function ResultCard({ text, lang }: Props) {
  const langCode = LANGUAGES.find(l => l.name === lang)?.code ?? 'en';
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => { Speech.stop(); };
  }, [text]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(text);
    Alert.alert('✓ Copied', 'Translation copied to clipboard.');
  };

  const handleSpeak = async () => {
    const speaking = await Speech.isSpeakingAsync();
    if (speaking) {
      await Speech.stop();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    Speech.speak(text, {
      language: langCode,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleShare = async () => {
    await Share.share({ message: text });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.langTag}>🌐 {lang}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btn} onPress={handleCopy}>
            <Text style={styles.btnText}>📋 Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, isSpeaking && styles.btnActive]} onPress={handleSpeak}>
            <Text style={[styles.btnText, isSpeaking && styles.btnTextActive]}>
              {isSpeaking ? '⏹ Stop' : '🔊 Speak'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={handleShare}>
            <Text style={styles.btnText}>↗ Share</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card:          { marginHorizontal: 16, marginBottom: 24, borderRadius: 14, borderWidth: 1.5, borderColor: colors.successBorder, backgroundColor: colors.successLight },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.successBorder },
  langTag:       { fontSize: 12, fontWeight: '700', color: colors.success },
  actions:       { flexDirection: 'row', gap: 6 },
  btn:           { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, borderWidth: 1.5, borderColor: colors.successBorder, backgroundColor: colors.cardBg },
  btnActive:     { backgroundColor: colors.success, borderColor: colors.success },
  btnText:       { fontSize: 11, fontWeight: '600', color: colors.success },
  btnTextActive: { color: '#fff' },
  text:          { fontSize: 16, color: colors.text, padding: 14, lineHeight: 26, fontWeight: '500' },
});
