/**
 * MANTIS Mobile - Team Leader Tab Layout
 */

import React from 'react';
import { RoleBasedTabLayout, type TabConfig } from '@/components/RoleBasedTabLayout';

const leaderTabs: TabConfig[] = [
  { name: 'index', title: 'Dashboard', iconName: 'house.fill' },
  { name: 'team', title: 'Team', iconName: 'person.3.fill' },
  { name: 'create', title: 'Create', iconName: 'plus.circle.fill', iconSize: 32 },
  { name: 'cases', title: 'Cases', iconName: 'list.bullet' },
  { name: 'profile', title: 'Profile', iconName: 'person.fill' },
];

export default function TeamLeaderLayout() {
  return <RoleBasedTabLayout headerTitle="MANTIS - Team Leader" tabs={leaderTabs} />;
}
