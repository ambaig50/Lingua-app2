import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LANGUAGES } from '../services/translate';
import { colors } from '../theme';

const TOP_LANGS = ['Spanish', 'French', 'Arabic', 'Chinese', 'Hindi', 'Portuguese'];

interface Props {
  selected: string;
  onSelect: (lang: string) => void;
}

export default function LanguagePicker({ selected, onSelect }: Props) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? LANGUAGES : LANGUAGES.filter(l => TOP_LANGS.includes(l.name));

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Translate to</Text>
      <View style={styles.fromRow}>
        <View style={styles.fromBox}>
          <Text style={styles.fromText}>🇬🇧 English</Text>
        </View>
        <Text style={styles.arrow}>⇄</Text>
        <View style={[styles.fromBox, styles.toBox]}>
          <Text style={styles.toText}>{selected}</Text>
        </View>
      </View>
      <View style={styles.grid}>
        {displayed.map(lang => (
          <TouchableOpacity
            key={lang.name}
            style={[styles.chip, lang.name === selected && styles.chipSel]}
            onPress={() => onSelect(lang.name)}
          >
            <Text style={[styles.chipText, lang.name === selected && styles.chipTextSel]}>
              {lang.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.moreTap} onPress={() => setShowAll(v => !v)}>
        <Text style={styles.moreText}>
          {showAll ? '▲ Show fewer' : `▼ Show all ${LANGUAGES.length} languages`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:         { marginHorizontal: 16, marginBottom: 8 },
  label:        { fontSize: 11, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 },
  fromRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  fromBox:      { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background },
  toBox:        { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  fromText:     { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  arrow:        { fontSize: 20, color: colors.primary, fontWeight: '700' },
  toText:       { fontSize: 13, color: colors.primary, fontWeight: '700', textAlign: 'center' },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:         { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.cardBg },
  chipSel:      { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText:     { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  chipTextSel:  { color: '#FFFFFF' },
  moreTap:      { marginTop: 10, alignItems: 'center' },
  moreText:     { fontSize: 12, color: colors.primary, fontWeight: '600' },
});
