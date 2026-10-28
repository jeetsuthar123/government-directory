import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import type { OfficerCardProps } from '../types/ui';

export default function OfficerCard({ officer, index, onPress, color = COLORS.blue }: OfficerCardProps) {
  return <Pressable onPress={onPress} style={styles.row} accessibilityRole="button">
    <View style={[styles.number, { backgroundColor: color }]}><Text style={styles.numberText}>{index + 1}</Text></View>
    <View style={styles.avatar}><Ionicons name="person" size={23} color="#fff"/></View>
    <View style={styles.copy}><Text numberOfLines={1} style={styles.name}>{officer.name || 'Unnamed officer'}</Text><Text numberOfLines={1} style={styles.designation}>{officer.designation || 'Designation not specified'}</Text><Text numberOfLines={1} style={styles.office}>{officer.office || officer.department || 'Office not specified'}</Text></View>
    <Ionicons name="chevron-forward" size={17} color={COLORS.blueDark}/>
  </Pressable>;
}
const styles = StyleSheet.create({ row: { minHeight: 58, backgroundColor: '#fff', borderRadius: 10, marginVertical: 3, marginHorizontal: 2, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', elevation: 1, paddingRight: 7 }, number: { width: 25, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' }, numberText: { color: '#fff', fontSize: 13, fontWeight: '800' }, avatar: { width: 36, height: 36, borderRadius: 20, backgroundColor: COLORS.blueDark, marginHorizontal: 6, alignItems: 'center', justifyContent: 'center' }, copy: { flex: 1, paddingVertical: 6, paddingRight: 4 }, name: { fontSize: 10.5, color: '#3f4144', fontWeight: '700' }, designation: { fontSize: 9.5, color: COLORS.blueDark, marginTop: 3 }, office: { fontSize: 8.5, color: '#59666b', marginTop: 2 } });
