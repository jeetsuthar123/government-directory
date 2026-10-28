import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BackHandler, Platform } from "react-native";
import NotebookLayout from "../components/NotebookLayout";
import DashboardScreen from "../screens/DashboardScreen";
import DirectoryScreen from "../screens/DirectoryScreen";
import OfficerDetailsScreen from "../screens/OfficerDetailsScreen";
import EventListScreen from "../screens/EventListScreen";
import { COLORS } from "../theme/colors";
import {
  fetchAllEmployees,
  fetchPublicSummary,
  fetchReference,
} from "../services/api";
import type {
  DirectoryScreenName,
  Officer,
  ReferenceItem,
  DashboardSummary,
  NavigationItem,
} from "../types/models";

const NAV_ITEMS: NavigationItem[] = [
  {
    key: "Dashboard",
    label: "Dashboard",
    icon: "view-dashboard-outline",
    color: COLORS.orange,
  },
  {
    key: "Directory",
    label: "Directory",
    icon: "account-search-outline",
    color: COLORS.blue,
  },
  {
    key: "Birthdays",
    label: "Birthday",
    icon: "cake-variant-outline",
    color: COLORS.orange,
  },
  {
    key: "Retirement",
    label: "Retirement",
    icon: "calendar-clock-outline",
    color: COLORS.green,
  },
  {
    key: "Alumni",
    label: "Alumni",
    icon: "account-group-outline",
    color: COLORS.brown,
  },
  {
    key: "Calendar",
    label: "Calendar",
    icon: "calendar-month-outline",
    color: COLORS.teal,
  },
];

export default function AppNavigator() {
  const [screen, setScreen] = useState<DirectoryScreenName>("Dashboard");
  const [employees, setEmployees] = useState<Officer[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [departments, setDepartments] = useState<ReferenceItem[]>([]);
  const [designations, setDesignations] = useState<ReferenceItem[]>([]);
  const [districts, setDistricts] = useState<ReferenceItem[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [dataMessage, setDataMessage] = useState("");
  const [returnScreen, setReturnScreen] =
    useState<DirectoryScreenName>("Directory");

  const loadData = useCallback(async (): Promise<boolean> => {
    setLoadingData(true);
    setDataMessage("");
    try {
      const [people, stats, depts, desigs, dists] = await Promise.all([
        fetchAllEmployees(),
        fetchPublicSummary(),
        fetchReference("departments"),
        fetchReference("designations"),
        fetchReference("districts"),
      ]);
      setEmployees(people);
      setSummary(stats);
      setDepartments(depts);
      setDesignations(desigs);
      setDistricts(dists);
      return true;
    } catch (error) {
      setDataMessage(
        error instanceof Error
          ? error.message
          : "Could not load public directory data.",
      );
      return false;
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openOfficer = useCallback(
    (officer: Officer, from: DirectoryScreenName = "Directory"): void => {
      setSelectedOfficer(officer);
      setReturnScreen(from);
      setScreen("Details");
    },
    [],
  );
  const go = useCallback(
    (key: DirectoryScreenName): void => setScreen(key),
    [],
  );

  useEffect(() => {
    if (Platform.OS !== "android") return undefined;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (screen === "Details") {
        setScreen(returnScreen);
        return true;
      }
      if (screen !== "Dashboard") {
        setScreen("Dashboard");
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [screen, returnScreen]);

  const content = useMemo(() => {
    const shared = {
      employees,
      departments,
      designations,
      districts,
      summary,
      loading: loadingData,
      message: dataMessage,
      onRetry: loadData,
      onOpenOfficer: openOfficer,
      onNavigate: go,
    };
    if (screen === "Dashboard")
      return (
        <DashboardScreen
          {...shared}
          onOpenOfficer={(person) => openOfficer(person, "Dashboard")}
        />
      );
    if (screen === "Directory")
      return (
        <DirectoryScreen
          {...shared}
          onOpenOfficer={(person) => openOfficer(person, "Directory")}
        />
      );
    if (screen === "Details")
      return (
        <OfficerDetailsScreen
          officer={selectedOfficer}
          onBack={() => setScreen(returnScreen)}
        />
      );
    if (
      screen === "Birthdays" ||
      screen === "Retirement" ||
      screen === "Alumni" ||
      screen === "Calendar"
    )
      return (
        <EventListScreen
          {...shared}
          type={screen}
          onOpenOfficer={(person) => openOfficer(person, screen)}
        />
      );
    return (
      <DashboardScreen
        {...shared}
        onOpenOfficer={(person) => openOfficer(person, "Dashboard")}
      />
    );
  }, [
    screen,
    employees,
    departments,
    designations,
    districts,
    summary,
    loadingData,
    dataMessage,
    loadData,
    openOfficer,
    go,
    selectedOfficer,
    returnScreen,
  ]);

  return (
    <NotebookLayout
      active={screen}
      items={NAV_ITEMS}
      onNavigate={go}
      onHome={() => go("Dashboard")}
    >
      {content}
    </NotebookLayout>
  );
}
