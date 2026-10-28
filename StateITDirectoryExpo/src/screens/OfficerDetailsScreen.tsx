import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SectionTitle from "../components/SectionTitle";
import { COLORS } from "../theme/colors";
import type { OfficerDetailsScreenProps } from "../types/ui";
import { fetchPublicEmployee } from "../services/api";

interface DetailRowProps {
  label: string;
  value?: string | number | null;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}
function DetailRow({ label, value, icon }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={18} color={COLORS.blueDark} />
      </View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text selectable style={styles.detailValue}>
          {value || "Not available"}
        </Text>
      </View>
    </View>
  );
}
export default function OfficerDetailsScreen({
  officer,
  onBack,
}: OfficerDetailsScreenProps) {
  const [detail, setDetail] = useState(officer);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  useEffect(() => {
    setDetail(officer);
    if (!officer?.id) return undefined;
    let active = true;
    setLoading(true);
    setError("");
    fetchPublicEmployee(officer.id)
      .then((record) => {
        if (active) setDetail(record);
      })
      .catch((reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not refresh officer details.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [officer, retryCount]);
  officer = detail;
  if (!officer)
    return (
      <View style={styles.empty}>
        <Text>No officer selected.</Text>
        <Pressable onPress={onBack}>
          <Text style={styles.backText}>Go back</Text>
        </Pressable>
      </View>
    );
  const call = () =>
    officer.phone
      ? Linking.openURL(
          `tel:${String(officer.phone).replace(/[^+\d,;]/g, "")}`,
        ).catch(() => Alert.alert("Call", officer.phone))
      : Alert.alert("Phone number unavailable");
  const email = () =>
    officer.email
      ? Linking.openURL(`mailto:${officer.email}`).catch(() =>
          Alert.alert("Email", officer.email),
        )
      : Alert.alert("Email unavailable");
  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={17} color={COLORS.blueDark} />
        <Text style={styles.backText}>Back to directory</Text>
      </Pressable>
      <SectionTitle>Officer Details</SectionTitle>
      {loading ? (
        <View style={styles.status}>
          <ActivityIndicator color={COLORS.blueDark} />
          <Text style={styles.note}>Refreshing public details…</Text>
        </View>
      ) : null}
      {error ? (
        <View style={styles.status}>
          <Text style={styles.note}>{error}</Text>
          <Pressable onPress={() => setRetryCount((value) => value + 1)}>
            <Text style={styles.retry}>Retry</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={43} color="#fff" />
        </View>
        <Text style={styles.name}>{officer.name || "Unnamed officer"}</Text>
        <Text style={styles.designation}>
          {officer.designation || "Designation not specified"}
        </Text>
        <Text style={styles.office}>
          {officer.office || "Office not specified"}
        </Text>
        {officer.phone || officer.mobile || officer.email ? (
          <View style={styles.actionRow}>
            {officer.phone || officer.mobile ? (
              <Pressable onPress={call} style={styles.action}>
                <Ionicons name="call-outline" size={18} color="#fff" />
                <Text style={styles.actionText}>Call</Text>
              </Pressable>
            ) : null}
            {officer.email ? (
              <Pressable
                onPress={email}
                style={[styles.action, { backgroundColor: COLORS.green }]}
              >
                <Ionicons name="mail-outline" size={18} color="#fff" />
                <Text style={styles.actionText}>Email</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
      {officer.phone || officer.mobile ? (
        <DetailRow
          label="Contact number"
          value={officer.phone || officer.mobile}
          icon="call-outline"
        />
      ) : null}
      {officer.email ? (
        <DetailRow
          label="Email address"
          value={officer.email}
          icon="mail-outline"
        />
      ) : null}
      <DetailRow
        label="Department"
        value={officer.department}
        icon="business-outline"
      />
      <DetailRow
        label="Office"
        value={officer.office}
        icon="briefcase-outline"
      />
      <DetailRow
        label="District"
        value={officer.district}
        icon="location-outline"
      />
      <DetailRow
        label="Date of birth"
        value={officer.dob || officer.dateOfBirth}
        icon="gift-outline"
      />
      <DetailRow
        label="Date of retirement"
        value={officer.retirement || officer.dateOfRetirement}
        icon="calendar-outline"
      />
      <DetailRow
        label="Seniority"
        value={officer.seniority != null ? String(officer.seniority) : ""}
        icon="list-outline"
      />
      <DetailRow
        label="Employee code"
        value={officer.employeeCode}
        icon="id-card-outline"
      />
      <Text style={styles.note}>
        Some fields may be unavailable when they are not provided by the
        backend.
      </Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 10, paddingBottom: 20 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
  },
  backText: { color: COLORS.blueDark, fontSize: 12, fontWeight: "800" },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    marginBottom: 10,
    elevation: 1,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 35,
    backgroundColor: COLORS.blueDark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
    color: COLORS.ink,
  },
  designation: {
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    color: COLORS.blueDark,
    marginTop: 5,
  },
  office: {
    fontSize: 10,
    textAlign: "center",
    color: COLORS.muted,
    marginTop: 4,
  },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 13 },
  action: {
    backgroundColor: COLORS.blueDark,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  actionText: { color: "#fff", fontWeight: "800", fontSize: 11 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 9,
    padding: 10,
    marginBottom: 6,
  },
  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: 18,
    backgroundColor: "#e2f3f8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  detailCopy: { flex: 1 },
  detailLabel: { fontSize: 10, color: COLORS.blueDark, fontWeight: "800" },
  detailValue: { fontSize: 12, color: COLORS.ink, marginTop: 3 },
  note: { color: COLORS.muted, fontSize: 10, lineHeight: 15, marginTop: 8 },
  status: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 6,
  },
  retry: { color: COLORS.blueDark, fontWeight: "800", fontSize: 11 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
});
