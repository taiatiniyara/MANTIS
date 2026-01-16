/**
 * Components Index
 * Centralized exports for common components
 */

// Dashboard components
export {
  WelcomeSection,
  StatCard,
  StatsGrid,
  SectionHeader,
  DashboardContainer,
} from './DashboardComponents';

// Layout components
export { RoleBasedTabLayout, type TabConfig } from './RoleBasedTabLayout';

// UI components
export * from './ui';

// Themed components
export { ThemedText, type ThemedTextProps } from './themed-text';
export { ThemedView, type ThemedViewProps } from './themed-view';

// Other components
export { ComponentShowcase } from './ComponentShowcase';
export { HapticTab } from './haptic-tab';
export { SessionStatus } from './SessionStatus';
export { SyncStatus } from './SyncStatus';
export { WatermarkedImage } from './WatermarkedImage';
export { default as OSMMap } from './OSMMap';
