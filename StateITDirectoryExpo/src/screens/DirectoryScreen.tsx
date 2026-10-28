import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SectionTitle from "../components/SectionTitle";
import OfficerCard from "../components/OfficerCard";
import { COLORS } from "../theme/colors";
import { fetchPublicEmployees } from "../services/api";
import type { Officer, ReferenceItem } from "../types/models";
import type { DirectoryScreenProps } from "../types/ui";
import type { PublicEmployeeQuery } from "../services/api";

interface ChoiceChipsProps {
  title: string;
  options: ReferenceItem[];
  selected: string;
  allLabel: string;
  onSelect: (option: string) => void;
}
function ChoiceChips({
  title,
  options,
  selected,
  allLabel,
  onSelect,
}: ChoiceChipsProps) {
  return (
    <View style={styles.chipSection}>
      <Text style={styles.filterLabel}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Pressable
          onPress={() => onSelect("")}
          style={[styles.chip, !selected && styles.chipSelected]}
        >
          <Text style={[styles.chipText, !selected && styles.chipTextSelected]}>
            {allLabel}
          </Text>
        </Pressable>
        {options.map((option) => (
          <Pressable
            key={option.id || option._id || option.name}
            onPress={() => onSelect(String(option.id || option._id || ""))}
            style={[
              styles.chip,
              selected === (option.id || option._id) && styles.chipSelected,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                selected === (option.id || option._id) &&
                  styles.chipTextSelected,
              ]}
            >
              {option.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

export default function DirectoryScreen({
  employees: initialEmployees,
  departments,
  designations,
  districts,
  onOpenOfficer,
}: DirectoryScreenProps) {
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [designationId, setDesignationId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [status, setStatus] = useState("");
  const [letter, setLetter] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [results, setResults] = useState<Officer[]>(initialEmployees);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const requestId = useRef(0);

  const query = useMemo<PublicEmployeeQuery>(
    () => ({
      search: search.trim() || undefined,
      departmentId: departmentId || undefined,
      designationId: designationId || undefined,
      districtId: districtId || undefined,
      status: status === "active" || status === "inactive" ? status : undefined,
      letter: letter || undefined,
      page: 1,
      limit: 25,
      sortBy: "name",
      order: "asc",
    }),
    [search, departmentId, designationId, districtId, status, letter],
  );

  useEffect(() => {
    const currentRequest = ++requestId.current;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetchPublicEmployees(query);
        if (currentRequest !== requestId.current) return;
        setResults(response.data);
        setTotal(response.total);
        setPage(response.page);
        setTotalPages(response.totalPages);
      } catch (reason) {
        if (currentRequest !== requestId.current) return;
        setResults([]);
        setTotal(0);
        setError(
          reason instanceof Error
            ? reason.message
            : "Could not load directory results.",
        );
      } finally {
        if (currentRequest === requestId.current) setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query, retryCount]);

  const loadMore = async () => {
    if (loadingMore || loading || page >= totalPages) return;
    const activeRequest = requestId.current;
    setLoadingMore(true);
    setError("");
    try {
      const response = await fetchPublicEmployees({ ...query, page: page + 1 });
      if (activeRequest !== requestId.current) return;
      setResults((current) => [...current, ...response.data]);
      setPage(response.page);
      setTotalPages(response.totalPages);
    } catch (reason) {
      if (activeRequest === requestId.current)
        setError(
          reason instanceof Error
            ? reason.message
            : "Could not load the next page.",
        );
    } finally {
      setLoadingMore(false);
    }
  };

  const reset = () => {
    setSearch("");
    setDepartmentId("");
    setDesignationId("");
    setDistrictId("");
    setStatus("");
    setLetter("");
  };
  const initialLoading = loading && results.length === 0;
  return (
    <View style={styles.flex}>
      <SectionTitle subtitle="Search published officers across departments">
        Officer Directory
      </SectionTitle>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.blueDark} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search name, designation or location"
            style={styles.searchInput}
            returnKeyType="search"
            accessibilityLabel="Search public directory"
          />
          <Pressable
            onPress={() => setSearch("")}
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={18} color={COLORS.muted} />
          </Pressable>
        </View>
        <Pressable
          onPress={() => setFiltersOpen((value) => !value)}
          style={styles.filterToggle}
        >
          <Ionicons name="options-outline" size={17} color={COLORS.blueDark} />
          <Text style={styles.filterToggleText}>
            {filtersOpen ? "Hide search filters" : "Show search filters"}
          </Text>
          <Ionicons
            name={filtersOpen ? "chevron-up" : "chevron-down"}
            size={16}
            color={COLORS.blueDark}
          />
        </Pressable>
        {filtersOpen ? (
          <View style={styles.filterCard}>
            <ChoiceChips
              title="Department"
              options={departments}
              selected={departmentId}
              allLabel="All departments"
              onSelect={setDepartmentId}
            />
            <ChoiceChips
              title="Designation"
              options={designations}
              selected={designationId}
              allLabel="All designations"
              onSelect={setDesignationId}
            />
            <ChoiceChips
              title="District"
              options={districts}
              selected={districtId}
              allLabel="All districts"
              onSelect={setDistrictId}
            />
            <Text style={styles.filterLabel}>Officer status</Text>
            <View style={styles.statusRow}>
              {[
                { label: "All", value: "" },
                { label: "Working", value: "active" },
                { label: "Alumni", value: "inactive" },
              ].map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => setStatus(item.value)}
                  style={[
                    styles.statusChip,
                    status === item.value && styles.statusChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      status === item.value && styles.statusTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.actionRow}>
              <Pressable onPress={reset} style={styles.resetButton}>
                <Text style={styles.resetText}>Reset filters</Text>
              </Pressable>
              <Text style={styles.countText}>
                {total} match{total === 1 ? "" : "es"}
              </Text>
            </View>
          </View>
        ) : null}
        <View style={styles.alphaHead}>
          <Text style={styles.sectionSubhead}>Directory results</Text>
          <Text style={styles.resultCount}>
            {loading ? "Searching…" : `${total} records`}
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.letters}
        >
          {["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map((value) => (
            <Pressable
              key={value}
              onPress={() => setLetter(value === "All" ? "" : value)}
              style={[
                styles.letter,
                (value === "All" ? !letter : letter === value) &&
                  styles.letterActive,
              ]}
            >
              <Text
                style={[
                  styles.letterText,
                  (value === "All" ? !letter : letter === value) &&
                    styles.letterTextActive,
                ]}
              >
                {value}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        {initialLoading ? (
          <View style={styles.feedback}>
            <ActivityIndicator color={COLORS.blueDark} />
            <Text style={styles.emptyCopy}>Loading public directory…</Text>
          </View>
        ) : null}
        {!initialLoading
          ? results.map((person, index) => (
              <OfficerCard
                key={person.id || person._id || person.name || index}
                officer={person}
                index={index}
                onPress={() => onOpenOfficer(person)}
              />
            ))
          : null}
        {error ? (
          <View style={styles.feedback}>
            <Text style={styles.errorCopy}>{error}</Text>
            <Pressable
              onPress={() => setRetryCount((value) => value + 1)}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>Retry search</Text>
            </Pressable>
          </View>
        ) : null}
        {!loading && !error && results.length === 0 ? (
          <View style={styles.feedback}>
            <Ionicons name="search-outline" size={34} color="#9aa9ad" />
            <Text style={styles.emptyTitle}>No officers found</Text>
            <Text style={styles.emptyCopy}>
              Try another search or clear some filters.
            </Text>
          </View>
        ) : null}
        {page < totalPages && !loading && !error ? (
          <Pressable
            onPress={loadMore}
            disabled={loadingMore}
            style={styles.loadMore}
          >
            {loadingMore ? (
              <ActivityIndicator color={COLORS.blueDark} />
            ) : (
              <Text style={styles.retryText}>Load more officers</Text>
            )}
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 8, paddingBottom: 18 },
  searchBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#c7dbe1",
  },
  searchInput: { flex: 1, fontSize: 13, color: COLORS.ink, paddingVertical: 9 },
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 10,
  },
  filterToggleText: {
    flex: 1,
    color: COLORS.blueDark,
    fontSize: 12,
    fontWeight: "800",
  },
  filterCard: {
    backgroundColor: "#f8fcfd",
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#c9e1e9",
    padding: 10,
    marginBottom: 11,
  },
  filterLabel: {
    color: COLORS.ink,
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 6,
  },
  chipSection: { marginBottom: 9 },
  chips: { gap: 5, paddingRight: 4 },
  chip: {
    backgroundColor: "#e9f0f2",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d3e0e3",
  },
  chipSelected: {
    backgroundColor: COLORS.blueDark,
    borderColor: COLORS.blueDark,
  },
  chipText: { fontSize: 10, color: "#4a5b60" },
  chipTextSelected: { color: "#fff", fontWeight: "800" },
  statusRow: { flexDirection: "row", gap: 6, marginBottom: 9 },
  statusChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#cbd7db",
    backgroundColor: "#fff",
  },
  statusChipSelected: {
    backgroundColor: "#e1f3f8",
    borderColor: COLORS.blueDark,
  },
  statusText: { fontSize: 11, color: COLORS.muted },
  statusTextSelected: { color: COLORS.blueDark, fontWeight: "800" },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resetButton: {
    borderWidth: 1,
    borderColor: COLORS.blueDark,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  resetText: { color: COLORS.blueDark, fontSize: 10, fontWeight: "800" },
  countText: { color: COLORS.muted, fontSize: 10 },
  alphaHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
    marginBottom: 6,
  },
  sectionSubhead: { fontSize: 14, fontWeight: "800", color: COLORS.ink },
  resultCount: { fontSize: 10, color: COLORS.muted },
  letters: { gap: 4, paddingBottom: 8 },
  letter: {
    width: 25,
    height: 25,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e7eff1",
  },
  letterActive: { backgroundColor: COLORS.blueDark },
  letterText: { fontSize: 9, color: COLORS.ink, fontWeight: "700" },
  letterTextActive: { color: "#fff" },
  feedback: { alignItems: "center", padding: 24, gap: 8 },
  emptyTitle: { fontSize: 14, fontWeight: "800", color: COLORS.ink },
  emptyCopy: {
    fontSize: 11,
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 16,
  },
  errorCopy: { fontSize: 11, color: COLORS.brown, textAlign: "center" },
  retryButton: { padding: 8 },
  retryText: { color: COLORS.blueDark, fontWeight: "800", fontSize: 11 },
  loadMore: {
    minHeight: 40,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.blueDark,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
