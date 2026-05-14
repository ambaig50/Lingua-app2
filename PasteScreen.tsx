import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { translateText } from '../services/translate';
import { useTranslationHistory } from '../hooks/useTranslationHistory';
import LanguagePicker from '../components/LanguagePicker';
import ResultCard from '../components/ResultCard';
import { colors } from '../theme';

const MAX_CHARS = 14000;

export default function PasteScreen() {
  const [text, setText]           = useState('');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [result, setResult]       = useState('');
  const [loading, setLoading]     = useState(false);
  const { addEntry }              = useTranslationHistory();

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const fillPct   = Math.min(100, (text.length / MAX_CHARS) * 100);
  const nearLimit = text.length > MAX_CHARS * 0.8;

  const handlePaste = async () => {
    const content = await Clipboard.getStringAsync();
    if (content) setText(content.slice(0, MAX_CHARS));
  };

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const translated = await translateText(text.trim(), targetLang);
      setResult(translated);
      // ✅ Save to history
      addEntry({ source: text.trim(), target: translated, lang: targetLang, mode: 'paste' });
    } catch {
      Alert.alert('Error', 'Translation failed. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>📋 English Text — up to A4 (~3,000 words)</Text>
          {text.length > 0 && (
            <TouchableOpacity onPress={() => { setText(''); setResult(''); }}>
              <Text style={styles.clearBtn}>✕ Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        <TextInput
          style={styles.input}
          multiline
          maxLength={MAX_CHARS}
          placeholder={`Paste a full document, article or page here…\n\nUp to ${MAX_CHARS.toLocaleString()} characters (~3,000 words)`}
          placeholderTextColor={colors.textTertiary}
          value={text}
          onChangeText={setText}
          textAlignVertical="top"
        />

        <View style={styles.cardFooter}>
          <Text style={[styles.countText, nearLimit && styles.countWarn]}>
            {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars · ~{wordCount.toLocaleString()} words
          </Text>
          <TouchableOpacity style={styles.pasteBtn} onPress={handlePaste}>
            <Text style={styles.pasteBtnText}>📋 Paste</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${fillPct}%` as any }, nearLimit && styles.barWarn]} />
        </View>
      </View>

      <LanguagePicker selected={targetLang} onSelect={setTargetLang} />

      <TouchableOpacity
        style={[styles.btn, (!text.trim() || loading) && styles.btnDisabled]}
        onPress={handleTranslate}
        disabled={!text.trim() || loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>🌐 Translate</Text>}
      </TouchableOpacity>

      {result ? (
        <View style={styles.resultWrap}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultHeaderText}>✓ Translation</Text>
            <TouchableOpacity onPress={() => setResult('')}>
              <Text style={styles.clearBtn}>✕ Clear</Text>
            </TouchableOpacity>
          </View>
          <ResultCard text={result} lang={targetLang} />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: colors.background },
  card:             { margin: 16, marginBottom: 10, backgroundColor: colors.cardBg, borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, overflow: 'hidden' },
  cardHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  cardLabel:        { fontSize: 12, fontWeight: '700', color: colors.primary },
  clearBtn:         { fontSize: 12, color: colors.danger, fontWeight: '700' },
  input:            { fontSize: 15, color: colors.text, minHeight: 200, padding: 14, lineHeight: 24 },
  cardFooter:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: colors.borderLight },
  countText:        { fontSize: 11, color: colors.textTertiary },
  countWarn:        { color: colors.warning, fontWeight: '600' },
  pasteBtn:         { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.primaryLight },
  pasteBtnText:     { fontSize: 12, color: colors.primary, fontWeight: '700' },
  barTrack:         { height: 4, backgroundColor: colors.borderLight },
  barFill:          { height: 4, backgroundColor: colors.primary },
  barWarn:          { backgroundColor: colors.warning },
  btn:              { marginHorizontal: 16, marginBottom: 12, backgroundColor: colors.primary, borderRadius: 12, padding: 15, alignItems: 'center', elevation: 3 },
  btnDisabled:      { opacity: 0.4, elevation: 0 },
  btnText:          { color: '#fff', fontSize: 16, fontWeight: '700' },
  resultWrap:       { marginBottom: 8 },
  resultHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginBottom: 6 },
  resultHeaderText: { fontSize: 12, fontWeight: '700', color: colors.success, textTransform: 'uppercase' },
});
