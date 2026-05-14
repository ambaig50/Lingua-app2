import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslationHistory, HistoryEntry } from '../../src/hooks/useTranslationHistory';
import { colors } from '../../src/theme';

function timeAgo(ts: number): string {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const modeIcon = (mode: string) =>
  mode === 'scan' ? '📷' : mode === 'paste' ? '📋' : '🌐';

const modeColor = (mode: string) =>
  mode === 'scan' ? '#8B5CF6' : mode === 'paste' ? '#F59E0B' : colors.primary;

export default function HistoryScreen() {
  const { history, clearHistory } = useTranslationHistory();
  const router = useRouter();

  const handleClearAll = () => {
    Alert.alert('Clear history?', 'All saved translations will be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear all', style: 'destructive', onPress: clearHistory },
    ]);
  };

  const renderItem = ({ item }: { item: HistoryEntry }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => router.push({ pathname: '/', params: { prefill: item.source, lang: item.lang } })}
      activeOpacity={0.7}
    >
      <View style={[styles.modeIcon, { backgroundColor: modeColor(item.mode) + '22' }]}>
        <Text style={styles.modeEmoji}>{modeIcon(item.mode)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.itemTop}>
          <Text style={[styles.modeBadge, { color: modeColor(item.mode) }]}>
            {item.mode.toUpperCase()}
          </Text>
          <Text style={styles.timeText}>{timeAgo(item.timestamp)}</Text>
        </View>
        <Text style={styles.srcText} numberOfLines={1}>{item.source}</Text>
        <Text style={styles.tgtText} numberOfLines={1}>{item.target}</Text>
      </View>
      <Text style={styles.langBadge}>{item.lang}</Text>
    </TouchableOpacity>
  );

  if (history.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🕐</Text>
        <Text style={styles.emptyTitle}>No history yet</Text>
        <Text style={styles.emptySub}>Translations from all tabs appear here.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>{history.length} translation{history.length !== 1 ? 's' : ''}</Text>
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={styles.clearAll}>🗑 Clear all</Text>
            </TouchableOpacity>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background },
  list:         { padding: 16, paddingBottom: 32 },
  listHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  listHeaderText:{ fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  clearAll:     { fontSize: 13, color: colors.danger, fontWeight: '700' },
  item:         { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.cardBg, borderRadius: 12, borderWidth: 1.5, borderColor: colors.borderLight, padding: 12 },
  modeIcon:     { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  modeEmoji:    { fontSize: 20 },
  itemTop:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  modeBadge:    { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  timeText:     { fontSize: 10, color: colors.textTertiary },
  srcText:      { fontSize: 12, color: colors.textSecondary, marginBottom: 2 },
  tgtText:      { fontSize: 14, color: colors.text, fontWeight: '600' },
  langBadge:    { fontSize: 10, color: colors.primary, fontWeight: '700', backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, flexShrink: 0 },
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32, backgroundColor: colors.background },
  emptyIcon:    { fontSize: 52, marginBottom: 8 },
  emptyTitle:   { fontSize: 18, fontWeight: '700', color: colors.text },
  emptySub:     { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
