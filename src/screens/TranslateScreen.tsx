import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { translateText } from '../services/translate';
import { useTranslationHistory } from '../hooks/useTranslationHistory';
import LanguagePicker from '../components/LanguagePicker';
import ResultCard from '../components/ResultCard';
import { colors } from '../theme';

const MAX_CHARS = 5000;

export default function TranslateScreen() {
  const params = useLocalSearchParams<{ prefill?: string; lang?: string }>();
  const [sourceText, setSourceText]     = useState(params.prefill ?? '');
  const [targetLang, setTargetLang]     = useState(params.lang ?? 'Spanish');
  const [result, setResult]             = useState('');
  const [loading, setLoading]           = useState(false);
  const { history, addEntry }           = useTranslationHistory();

  useEffect(() => {
    if (params.prefill) setSourceText(params.prefill);
    if (params.lang)    setTargetLang(params.lang);
  }, [params.prefill, params.lang]);

  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) return;
    setLoading(true);
    try {
      const translated = await translateText(sourceText.trim(), targetLang);
      setResult(translated);
      addEntry({ source: sourceText.trim(), target: translated, lang: targetLang, mode: 'translate' });
    } catch {
      Alert.alert('Error', 'Translation failed. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  }, [sourceText, targetLang]);

  const handleClear = () => { setSourceText(''); setResult(''); };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

      {/* Input card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>🇬🇧 English</Text>
          {sourceText.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <Text style={styles.clearBtn}>✕ Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        <TextInput
          style={styles.input}
          multiline
          maxLength={MAX_CHARS}
          placeholder="Type or paste your text here…"
          placeholderTextColor={colors.textTertiary}
          value={sourceText}
          onChangeText={setSourceText}
          textAlignVertical="top"
        />
        <Text style={[styles.charCount, sourceText.length > MAX_CHARS * 0.9 && styles.charCountWarn]}>
          {sourceText.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </Text>
      </View>

      {/* Language picker */}
      <LanguagePicker selected={targetLang} onSelect={setTargetLang} />

      {/* Translate button */}
      <TouchableOpacity
        style={[styles.btn, (!sourceText.trim() || loading) && styles.btnDisabled]}
        onPress={handleTranslate}
        disabled={!sourceText.trim() || loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>🌐 Translate</Text>}
      </TouchableOpacity>

      {/* Result */}
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

      {/* Recent history */}
      {history.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>🕐 Recent</Text>
          {history.slice(0, 5).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.historyItem}
              onPress={() => { setSourceText(item.source); setTargetLang(item.lang); setResult(item.target); }}
            >
              <View style={styles.historyMode}>
                <Text style={styles.historyModeText}>
                  {item.mode === 'scan' ? '📷' : item.mode === 'paste' ? '📋' : '🌐'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.historySrc} numberOfLines={1}>{item.source}</Text>
                <Text style={styles.historyTgt} numberOfLines={1}>{item.target}</Text>
              </View>
              <Text style={styles.historyLang}>{item.lang}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: colors.background },
  card:            { margin: 16, marginBottom: 10, backgroundColor: colors.cardBg, borderRadius: 14, borderWidth: 1.5, borderColor: colors.border },
  cardHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  cardLabel:       { fontSize: 12, fontWeight: '700', color: colors.primary, letterSpacing: 0.5, textTransform: 'uppercase' },
  clearBtn:        { fontSize: 12, color: colors.danger, fontWeight: '700' },
  input:           { fontSize: 15, color: colors.text, minHeight: 120, padding: 14, lineHeight: 24 },
  charCount:       { fontSize: 11, color: colors.textTertiary, textAlign: 'right', padding: 8, paddingRight: 14 },
  charCountWarn:   { color: colors.warning, fontWeight: '600' },
  btn:             { marginHorizontal: 16, marginBottom: 12, backgroundColor: colors.primary, borderRadius: 12, padding: 15, alignItems: 'center', elevation: 3 },
  btnDisabled:     { opacity: 0.4, elevation: 0 },
  btnText:         { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  resultWrap:      { marginBottom: 8 },
  resultHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginBottom: 6 },
  resultHeaderText:{ fontSize: 12, fontWeight: '700', color: colors.success, textTransform: 'uppercase' },
  section:         { marginHorizontal: 16, marginBottom: 24 },
  sectionLabel:    { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 10 },
  historyItem:     { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.cardBg, borderRadius: 10, borderWidth: 1.5, borderColor: colors.borderLight, padding: 10, marginBottom: 8 },
  historyMode:     { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  historyModeText: { fontSize: 16 },
  historySrc:      { fontSize: 12, color: colors.textSecondary },
  historyTgt:      { fontSize: 13, color: colors.text, fontWeight: '600', marginTop: 2 },
  historyLang:     { fontSize: 10, color: colors.primary, fontWeight: '700', backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
});
