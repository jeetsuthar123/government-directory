import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';
import type { SectionTitleProps } from '../types/ui';

export default function SectionTitle({ children, color = COLORS.ink, subtitle }: SectionTitleProps) {
  return <View style={styles.wrap}><Text style={[styles.title, { color }]}>{children}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}<View style={styles.line}/></View>;
}
const styles = StyleSheet.create({ wrap: { alignItems: 'center', paddingTop: 8, paddingBottom: 9, marginBottom: 9 }, title: { fontSize: 21, fontWeight: '800', textAlign: 'center' }, subtitle: { color: COLORS.muted, fontSize: 11, marginTop: 3 }, line: { height: 1.5, backgroundColor: COLORS.line, width: '100%', marginTop: 8 } });
