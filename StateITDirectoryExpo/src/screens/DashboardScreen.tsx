import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import SectionTitle from "../components/SectionTitle";
import OfficerCard from "../components/OfficerCard";
import { COLORS } from "../theme/colors";
import type { DashboardScreenProps } from "../types/ui";
import type { DirectoryScreenName } from "../types/models";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  color: string;
  onPress: () => void;
}
function StatCard({ label, value, icon, color, onPress }: StatCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.statCard, { borderTopColor: color }]}
    >
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon} size={23} color="#fff" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}
export default function DashboardScreen({
  employees,
  summary,
  loading,
  message,
  onNavigate,
  onOpenOfficer,
  onRetry,
}: DashboardScreenProps) {
  const activeCount =
    summary?.totalActiveEmployees ??
    employees.filter((p) => p.isActive !== false).length;
  const total =
    summary?.totalEmployees ?? summary?.employees ?? employees.length;
  const departmentCount =
    summary?.totalDepartments ?? summary?.departments ?? "—";
  const officeCount = summary?.totalOffices ?? summary?.offices ?? "—";
  const birthdays = employees
    .filter((p) => p.dob && p.isActive !== false)
    .slice(0, 3);
  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <View style={styles.welcome}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>STATE IT DIRECTORY</Text>
          <Text style={styles.welcomeTitle}>Dashboard</Text>
          <Text style={styles.welcomeSub}>Public officer directory</Text>
        </View>
      </View>
      {message ? (
        <View style={styles.infoBanner}>
          <Text style={styles.bannerText}>{message}</Text>
          <Pressable onPress={onRetry}>
            <Text style={styles.retry}>Retry</Text>
          </Pressable>
        </View>
      ) : null}
      <SectionTitle>Directory Overview</SectionTitle>
      <View style={styles.grid}>
        <StatCard
          label="Total Officers"
          value={total}
          icon="account-group-outline"
          color={COLORS.blue}
          onPress={() => onNavigate("Directory")}
        />
        <StatCard
          label="Departments"
          value={departmentCount}
          icon="domain"
          color={COLORS.orange}
          onPress={() => onNavigate("Directory")}
        />
        <StatCard
          label="Offices"
          value={officeCount}
          icon="office-building-outline"
          color={COLORS.green}
          onPress={() => onNavigate("Directory")}
        />
        <StatCard
          label="Active Officers"
          value={activeCount}
          icon="account-check-outline"
          color={COLORS.teal}
          onPress={() => onNavigate("Directory")}
        />
      </View>
      <View style={styles.quickHeader}>
        <Text style={styles.sectionSubhead}>Quick access</Text>
      </View>
      <View style={styles.quickGrid}>
        {[
          {
            label: "Officer Directory",
            icon: "account-search-outline",
            key: "Directory",
            color: COLORS.blue,
          },
          {
            label: "Birthdays",
            icon: "cake-variant-outline",
            key: "Birthdays",
            color: COLORS.orange,
          },
          {
            label: "Retirement",
            icon: "calendar-clock-outline",
            key: "Retirement",
            color: COLORS.green,
          },
          {
            label: "Alumni",
            icon: "account-group-outline",
            key: "Alumni",
            color: COLORS.brown,
          },
        ].map((x) => (
          <Pressable
            key={x.key}
            onPress={() => onNavigate(x.key as DirectoryScreenName)}
            style={styles.quickItem}
          >
            <MaterialCommunityIcons
              name={
                x.icon as React.ComponentProps<
                  typeof MaterialCommunityIcons
                >["name"]
              }
              size={23}
              color={x.color}
            />
            <Text style={styles.quickText}>{x.label}</Text>
            <Ionicons name="chevron-forward" size={15} color={COLORS.muted} />
          </Pressable>
        ))}
      </View>
      <View style={styles.recentHeader}>
        <Text style={styles.sectionSubhead}>Officer records</Text>
        <Pressable onPress={() => onNavigate("Directory")}>
          <Text style={styles.viewAll}>View all</Text>
        </Pressable>
      </View>
      {employees.slice(0, 4).map((p, i) => (
        <OfficerCard
          key={p.id || p.name || i}
          officer={p}
          index={i}
          onPress={() => onOpenOfficer(p, "Dashboard")}
        />
      ))}
      {employees.length === 0 && !loading ? (
        <Text style={styles.empty}>
          No public officer records are available. Try again later.
        </Text>
      ) : null}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 11, paddingBottom: 20 },
  welcome: { flexDirection: "row", alignItems: "center", marginBottom: 13 },
  eyebrow: {
    color: COLORS.blueDark,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  welcomeTitle: {
    color: COLORS.ink,
    fontSize: 25,
    fontWeight: "900",
    marginTop: 2,
  },
  welcomeSub: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: 1,
    borderColor: "#d8b5a9",
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 18,
  },
  signOutText: { color: COLORS.brown, fontWeight: "700", fontSize: 10 },
  demoBanner: {
    backgroundColor: "#d8f0f6",
    borderRadius: 8,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  infoBanner: {
    backgroundColor: "#fff1df",
    borderRadius: 8,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  bannerText: { flex: 1, fontSize: 10, color: COLORS.ink },
  retry: {
    color: COLORS.blueDark,
    fontSize: 11,
    fontWeight: "800",
    paddingHorizontal: 6,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    width: "48%",
    minHeight: 120,
    backgroundColor: "#fff",
    borderRadius: 13,
    borderTopWidth: 4,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
  },
  statIcon: {
    width: 37,
    height: 37,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  statValue: { fontSize: 23, fontWeight: "900", color: COLORS.ink },
  statLabel: {
    fontSize: 10,
    color: COLORS.muted,
    fontWeight: "700",
    marginTop: 2,
    textAlign: "center",
  },
  quickHeader: { marginBottom: 7 },
  sectionSubhead: { fontSize: 15, fontWeight: "800", color: COLORS.ink },
  quickGrid: { gap: 6, marginBottom: 14 },
  quickItem: {
    backgroundColor: "#fff",
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  quickText: { flex: 1, fontSize: 11, fontWeight: "700", color: COLORS.ink },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  viewAll: { color: COLORS.blueDark, fontSize: 11, fontWeight: "800" },
  empty: {
    textAlign: "center",
    color: COLORS.muted,
    fontSize: 12,
    padding: 20,
  },
});
