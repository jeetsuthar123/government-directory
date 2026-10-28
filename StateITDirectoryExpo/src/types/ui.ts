import type { ReactNode } from "react";
import type {
  Officer,
  ReferenceItem,
  DashboardSummary,
  DirectoryScreenName,
  EventScreenName,
  NavigationItem,
} from "./models";
export interface NotebookLayoutProps {
  children: ReactNode;
  active: DirectoryScreenName;
  items: NavigationItem[];
  onNavigate: (screen: DirectoryScreenName) => void;
  onHome: () => void;
  showNavigation?: boolean;
}
export interface OfficerCardProps {
  officer: Officer;
  index: number;
  onPress: () => void;
  color?: string;
}
export interface SectionTitleProps {
  children: ReactNode;
  color?: string;
  subtitle?: string;
}
export interface DashboardScreenProps {
  employees: Officer[];
  summary: DashboardSummary | null;
  loading: boolean;
  message: string;
  onNavigate: (screen: DirectoryScreenName) => void;
  onOpenOfficer: (officer: Officer, from?: DirectoryScreenName) => void;
  onRetry: () => void | Promise<unknown>;
}
export interface DirectoryScreenProps {
  employees: Officer[];
  departments: ReferenceItem[];
  designations: ReferenceItem[];
  districts: ReferenceItem[];
  onOpenOfficer: (officer: Officer) => void;
}
export interface EventListScreenProps {
  employees: Officer[];
  type: EventScreenName;
  onOpenOfficer: (officer: Officer) => void;
  loading: boolean;
  message: string;
  onRetry: () => void | Promise<unknown>;
}
export interface OfficerDetailsScreenProps {
  officer: Officer | null;
  onBack: () => void;
}
