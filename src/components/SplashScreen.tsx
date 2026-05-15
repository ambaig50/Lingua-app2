import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { colors } from '../theme';

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const fadeOut   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade + scale in
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start(() => {
      // Hold for 1.5 seconds then fade out
      setTimeout(() => {
        Animated.timing(fadeOut, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => {
          onFinish();
        });
      }, 1500);
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Logo icon */}
        <View style={styles.iconWrap}>
          <View style={styles.iconBg}>
            {/* Speech bubbles */}
            <View style={styles.bubble1}>
              <Text style={styles.bubbleText1}>Hello</Text>
              <Text style={styles.bubbleText2}>مرحبا</Text>
            </View>
            <View style={styles.bubble2}>
              <Text style={styles.bubbleText3}>Hola</Text>
              <Text style={styles.bubbleText4}>नमस्ते</Text>
            </View>
          </View>
        </View>

        {/* App name */}
        <Text style={styles.appName}>Lingua</Text>
        <Text style={styles.tagline}>Translate · Scan · Speak</Text>

        {/* Language pills */}
        <View style={styles.pills}>
          {['Arabic', 'Hindi', 'Urdu اردو', 'Chinese', 'Spanish'].map(l => (
            <View key={l} style={styles.pill}>
              <Text style={styles.pillText}>{l}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container:    { ...StyleSheet.absoluteFillObject, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  content:      { alignItems: 'center', gap: 12 },
  iconWrap:     { marginBottom: 8 },
  iconBg:       { width: 120, height: 120, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  bubble1:      { position: 'absolute', top: 18, left: 12, backgroundColor: '#fff', borderRadius: 12, padding: 8, paddingHorizontal: 10 },
  bubble2:      { position: 'absolute', bottom: 18, right: 10, backgroundColor: '#D4F5E0', borderRadius: 12, padding: 8, paddingHorizontal: 10 },
  bubbleText1:  { fontSize: 12, fontWeight: '700', color: colors.primary },
  bubbleText2:  { fontSize: 10, color: '#555' },
  bubbleText3:  { fontSize: 12, fontWeight: '700', color: colors.success },
  bubbleText4:  { fontSize: 10, color: '#555' },
  appName:      { fontSize: 48, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  tagline:      { fontSize: 15, color: 'rgba(255,255,255,0.8)', fontWeight: '500', letterSpacing: 0.5 },
  pills:        { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 8, paddingHorizontal: 20 },
  pill:         { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  pillText:     { fontSize: 12, color: '#fff', fontWeight: '600' },
});
