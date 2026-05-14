import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator, Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { extractTextFromImage, isSupported } from 'expo-text-extractor';
import { translateText } from '../services/translate';
import { useTranslationHistory } from '../hooks/useTranslationHistory';
import LanguagePicker from '../components/LanguagePicker';
import ResultCard from '../components/ResultCard';
import { colors } from '../theme';

type Mode = 'camera' | 'photo';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode]                 = useState<Mode>('camera');
  const [scannedText, setScannedText]   = useState('');
  const [targetLang, setTargetLang]     = useState('Spanish');
  const [result, setResult]             = useState('');
  const [ocrLoading, setOcrLoading]     = useState(false);
  const [transLoading, setTransLoading] = useState(false);
  const [previewUri, setPreviewUri]     = useState<string | null>(null);
  const cameraRef                       = useRef<CameraView>(null);
  const { addEntry }                    = useTranslationHistory();

  const runOCR = async (imageUri: string) => {
    setOcrLoading(true);
    setScannedText('');
    setResult('');
    try {
      if (!isSupported) {
        Alert.alert('Not supported', 'Text recognition is not supported on this device.');
        return;
      }
      const lines: string[] = await extractTextFromImage(imageUri);
      const text = lines.join('\n').trim();
      setScannedText(text || 'No text detected. Try a clearer or closer image.');
    } catch {
      Alert.alert('OCR failed', 'Could not read text. Try a clearer photo.');
    } finally {
      setOcrLoading(false);
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (!photo?.uri) return;
      setPreviewUri(photo.uri);
      await runOCR(photo.uri);
    } catch {
      Alert.alert('Error', 'Could not capture photo.');
    }
  };

  const handlePickImage = async () => {
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!picked.canceled && picked.assets[0]) {
      setPreviewUri(picked.assets[0].uri);
      await runOCR(picked.assets[0].uri);
    }
  };

  const handleTranslate = async () => {
    if (!scannedText.trim()) return;
    setTransLoading(true);
    try {
      const translated = await translateText(scannedText, targetLang);
      setResult(translated);
      // ✅ Save to history
      addEntry({ source: scannedText.trim(), target: translated, lang: targetLang, mode: 'scan' });
    } catch {
      Alert.alert('Error', 'Translation failed. Check your internet connection.');
    } finally {
      setTransLoading(false);
    }
  };

  if (!permission) return <View />;

  if (!permission.granted && mode === 'camera') {
    return (
      <View style={styles.permWrap}>
        <Text style={styles.permEmoji}>📷</Text>
        <Text style={styles.permTitle}>Camera Permission Needed</Text>
        <Text style={styles.permSub}>Allow camera access to scan and translate printed text.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Camera Access</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMode('photo')} style={{ marginTop: 12 }}>
          <Text style={styles.switchLink}>Use photo upload instead →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.modeTabs}>
        {(['camera', 'photo'] as Mode[]).map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.modeTab, mode === m && styles.modeTabOn]}
            onPress={() => { setMode(m); setScannedText(''); setResult(''); setPreviewUri(null); }}
          >
            <Text style={[styles.modeTabText, mode === m && styles.modeTabTextOn]}>
              {m === 'camera' ? '📷 Camera Scan' : '🖼 Upload Photo'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>✓ On-device ML Kit · Offline · Free forever · No account</Text>
      </View>

      {mode === 'camera' && (
        <View style={styles.cameraWrap}>
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          <View style={[styles.corner, styles.cTL]} />
          <View style={[styles.corner, styles.cTR]} />
          <View style={[styles.corner, styles.cBL]} />
          <View style={[styles.corner, styles.cBR]} />
          <View style={styles.hintBar}>
            <Text style={styles.hintText}>Point at printed text then tap capture</Text>
          </View>
          <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
            <View style={styles.captureBtnRing}>
              <View style={styles.captureBtnCore} />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {mode === 'photo' && (
        <TouchableOpacity style={styles.uploadZone} onPress={handlePickImage}>
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.previewImg} resizeMode="contain" />
          ) : (
            <>
              <Text style={styles.uploadEmoji}>📄</Text>
              <Text style={styles.uploadLabel}>Tap to select a photo</Text>
              <Text style={styles.uploadSub}>JPEG · PNG · up to A4 size</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {previewUri && (
        <TouchableOpacity style={styles.rescanBtn} onPress={mode === 'camera' ? handleCapture : handlePickImage}>
          <Text style={styles.rescanBtnText}>{mode === 'camera' ? '↺ Retake' : '↺ Choose another'}</Text>
        </TouchableOpacity>
      )}

      {ocrLoading && (
        <View style={styles.ocrRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.ocrText}>Reading text from image…</Text>
        </View>
      )}

      {!!scannedText && (
        <View style={styles.detectedBox}>
          <View style={styles.detectedHead}>
            <Text style={styles.detectedLabel}>📝 Detected Text</Text>
            <TouchableOpacity onPress={() => { setScannedText(''); setResult(''); }}>
              <Text style={styles.clearBtn}>✕ Clear</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.detectedText}>{scannedText}</Text>
        </View>
      )}

      <LanguagePicker selected={targetLang} onSelect={setTargetLang} />

      <TouchableOpacity
        style={[styles.btn, (!scannedText.trim() || transLoading) && styles.btnDisabled]}
        onPress={handleTranslate}
        disabled={!scannedText.trim() || transLoading}
      >
        {transLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>🌐 Translate Text</Text>}
      </TouchableOpacity>

      {!!result && <ResultCard text={result} lang={targetLang} />}
    </ScrollView>
  );
}

const C = '#FFD700';
const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.background },
  permWrap:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  permEmoji:      { fontSize: 48, marginBottom: 8 },
  permTitle:      { fontSize: 18, fontWeight: '700', color: colors.text },
  permSub:        { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  permBtn:        { marginTop: 8, backgroundColor: colors.primary, paddingVertical: 13, paddingHorizontal: 32, borderRadius: 12 },
  permBtnText:    { color: '#fff', fontSize: 15, fontWeight: '700' },
  switchLink:     { fontSize: 13, color: colors.primary, fontWeight: '600' },
  modeTabs:       { flexDirection: 'row', margin: 16, marginBottom: 10, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, overflow: 'hidden' },
  modeTab:        { flex: 1, paddingVertical: 11, alignItems: 'center', backgroundColor: colors.cardBg },
  modeTabOn:      { backgroundColor: colors.primary },
  modeTabText:    { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  modeTabTextOn:  { color: '#fff' },
  badge:          { marginHorizontal: 16, marginBottom: 12, backgroundColor: colors.successLight, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.successBorder },
  badgeText:      { fontSize: 11, color: colors.success, fontWeight: '600' },
  cameraWrap:     { marginHorizontal: 16, marginBottom: 10, borderRadius: 16, overflow: 'hidden', height: 250, position: 'relative', backgroundColor: '#000' },
  camera:         { flex: 1 },
  corner:         { position: 'absolute', width: 24, height: 24, borderColor: C, borderStyle: 'solid' },
  cTL:            { top: 12, left: 12, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 4 },
  cTR:            { top: 12, right: 12, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 4 },
  cBL:            { bottom: 58, left: 12, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 4 },
  cBR:            { bottom: 58, right: 12, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 4 },
  hintBar:        { position: 'absolute', bottom: 58, left: 0, right: 0, alignItems: 'center' },
  hintText:       { fontSize: 12, color: '#fff', backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, fontWeight: '600' },
  captureBtn:     { position: 'absolute', bottom: 10, alignSelf: 'center' },
  captureBtnRing: { width: 62, height: 62, borderRadius: 31, borderWidth: 3, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  captureBtnCore: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff' },
  uploadZone:     { marginHorizontal: 16, marginBottom: 10, borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.primary, minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primaryLight },
  previewImg:     { width: '100%', height: 220 },
  uploadEmoji:    { fontSize: 40 },
  uploadLabel:    { fontSize: 15, color: colors.primary, fontWeight: '700' },
  uploadSub:      { fontSize: 11, color: colors.textSecondary },
  rescanBtn:      { marginHorizontal: 16, marginBottom: 10, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.cardBg },
  rescanBtnText:  { fontSize: 13, color: colors.primary, fontWeight: '600' },
  ocrRow:         { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginBottom: 10 },
  ocrText:        { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  detectedBox:    { marginHorizontal: 16, marginBottom: 10, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.cardBg },
  detectedHead:   { flexDirection: 'row', justifyContent: 'space-between', padding: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  detectedLabel:  { fontSize: 12, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase' },
  clearBtn:       { fontSize: 12, color: colors.danger, fontWeight: '700' },
  detectedText:   { fontSize: 14, color: colors.text, padding: 14, lineHeight: 22 },
  btn:            { marginHorizontal: 16, marginBottom: 12, backgroundColor: colors.primary, borderRadius: 12, padding: 15, alignItems: 'center', elevation: 3 },
  btnDisabled:    { opacity: 0.4, elevation: 0 },
  btnText:        { color: '#fff', fontSize: 16, fontWeight: '700' },
});
