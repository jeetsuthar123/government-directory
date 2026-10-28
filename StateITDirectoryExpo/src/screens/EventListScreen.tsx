import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SectionTitle from "../components/SectionTitle";
import OfficerCard from "../components/OfficerCard";
import { COLORS } from "../theme/colors";
import type { EventListScreenProps } from "../types/ui";
import type { Officer, EventScreenName } from "../types/models";

const EVENT_COLORS = {
  Birthdays: COLORS.orange,
  Retirement: COLORS.green,
  Alumni: COLORS.brown,
  Calendar: COLORS.teal,
};
function parseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? null : value;
  const text = String(value).trim();
  const dmy = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  const date = dmy
    ? new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]))
    : new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}
function getValue(person: Officer, key: "dob" | "retirement"): string {
  return key === "dob"
    ? person.dob || person.dateOfBirth || ""
    : person.retirement || person.dateOfRetirement || "";
}
function dateTimestamp(value: string): number {
  return parseDate(value)?.getTime() ?? Number.MAX_SAFE_INTEGER;
}
export default function EventListScreen({
  employees,
  type,
  onOpenOfficer,
  loading,
  message,
  onRetry,
}: EventListScreenProps) {
  const [yearOffset, setYearOffset] = useState(0);
  const currentYear = new Date().getFullYear() + yearOffset;
  const color = EVENT_COLORS[type] || COLORS.teal;
  const list = useMemo(() => {
    if (type === "Alumni") return employees.filter((p) => p.isActive === false);
    if (type === "Birthdays")
      return employees
        .filter(
          (p) => Boolean(parseDate(getValue(p, "dob"))) && p.isActive !== false,
        )
        .sort((a, b) => {
          const da = parseDate(getValue(a, "dob"));
          const db = parseDate(getValue(b, "dob"));
          return (
            (da?.getMonth() ?? 0) - (db?.getMonth() ?? 0) ||
            (da?.getDate() ?? 0) - (db?.getDate() ?? 0)
          );
        });
    if (type === "Retirement")
      return employees
        .filter((p) => {
          const date = parseDate(getValue(p, "retirement"));
          return Boolean(date && date.getFullYear() === currentYear);
        })
        .sort(
          (a, b) =>
            dateTimestamp(getValue(a, "retirement")) -
            dateTimestamp(getValue(b, "retirement")),
        );
    return employees
      .filter(
        (p) =>
          parseDate(getValue(p, "dob")) || parseDate(getValue(p, "retirement")),
      )
      .sort((a, b) => {
        const aDate =
          parseDate(getValue(a, "dob")) || parseDate(getValue(a, "retirement"));
        const bDate =
          parseDate(getValue(b, "dob")) || parseDate(getValue(b, "retirement"));
        return (
          (aDate?.getTime() ?? Number.MAX_SAFE_INTEGER) -
          (bDate?.getTime() ?? Number.MAX_SAFE_INTEGER)
        );
      });
  }, [employees, type, currentYear]);
  const title =
    type === "Birthdays"
      ? "Officer Birthdays"
      : type === "Retirement"
        ? "Retirement List"
        : type === "Alumni"
          ? "Former Officers / Alumni"
          : "Directory Calendar";
  return (
    <View style={styles.flex}>
      <SectionTitle
        subtitle={
          type === "Birthdays"
            ? "Birthdays across the directory"
            : type === "Retirement"
              ? `Retirements during ${currentYear}`
              : type === "Alumni"
                ? "Inactive or former officers"
                : "Dates available in officer records"
        }
      >
        {title}
      </SectionTitle>
      {type === "Retirement" ? (
        <View style={styles.yearRow}>
          <Pressable
            onPress={() => setYearOffset((v) => v - 1)}
            style={[styles.yearButton, { backgroundColor: color }]}
          >
            <Ionicons name="chevron-back" size={18} color="#fff" />
          </Pressable>
          <Text style={styles.year}>{currentYear}</Text>
          <Pressable
            onPress={() => setYearOffset((v) => v + 1)}
            style={[styles.yearButton, { backgroundColor: color }]}
          >
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </Pressable>
        </View>
      ) : null}
      {type === "Calendar" ? (
        <View style={styles.legend}>
          <View style={[styles.dot, { backgroundColor: COLORS.orange }]} />
          <Text style={styles.legendText}>Birthday</Text>
          <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
          <Text style={styles.legendText}>Retirement</Text>
        </View>
      ) : null}
      <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
        {list.map((person, index) => {
          const dob = parseDate(getValue(person, "dob"));
          const retirement = parseDate(getValue(person, "retirement"));
          let dateLabel = "";
          if (type === "Birthdays")
            dateLabel = dob
              ? `Birthday · ${dob.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`
              : "";
          else if (type === "Retirement")
            dateLabel = retirement
              ? `Retirement · ${retirement.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`
              : "";
          else if (type === "Calendar")
            dateLabel = dob
              ? `Birthday · ${dob.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`
              : retirement
                ? `Retirement · ${retirement.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`
                : "";
          return (
            <View
              key={person.id || person._id || person.name || index}
              style={styles.eventItem}
            >
              <OfficerCard
                officer={person}
                index={index}
                color={color}
                onPress={() => onOpenOfficer(person)}
              />
              {dateLabel ? (
                <Text style={[styles.dateLabel, { color }]}>{dateLabel}</Text>
              ) : null}
            </View>
          );
        })}
        {list.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={36} color="#9aa9ad" />
            <Text style={styles.emptyTitle}>
              {loading ? "Loading records…" : "No records to display"}
            </Text>
            <Text style={styles.emptyCopy}>
              {message ||
                (type === "Alumni"
                  ? "No inactive officers were returned by the API."
                  : "The public API does not provide personal birthday or retirement data.")}
            </Text>
            {message && !loading ? (
              <Pressable onPress={onRetry} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 8, paddingBottom: 18 },
  yearRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginBottom: 8,
  },
  yearButton: {
    width: 31,
    height: 31,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  year: { fontSize: 18, fontWeight: "900", color: COLORS.ink },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 8,
  },
  dot: { width: 9, height: 9, borderRadius: 5, marginLeft: 7 },
  legendText: { color: COLORS.muted, fontSize: 10 },
  eventItem: { marginBottom: 5 },
  dateLabel: {
    alignSelf: "flex-end",
    fontSize: 9,
    fontWeight: "800",
    marginTop: -1,
    marginRight: 8,
  },
  empty: { alignItems: "center", padding: 24, gap: 7 },
  emptyTitle: { fontSize: 14, fontWeight: "800", color: COLORS.ink },
  emptyCopy: {
    fontSize: 11,
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 16,
  },
  retryButton: {
    borderWidth: 1,
    borderColor: COLORS.blueDark,
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  retryText: { color: COLORS.blueDark, fontSize: 11, fontWeight: "800" },
});
