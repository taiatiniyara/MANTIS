/**
 * MANTIS Mobile - Officer Tab Layout
 */

import React from 'react';
import { RoleBasedTabLayout, type TabConfig } from '@/components/RoleBasedTabLayout';

const officerTabs: TabConfig[] = [
  { name: 'index', title: 'Dashboard', iconName: 'house.fill' },
  { name: 'map', title: 'Map', iconName: 'map.fill' },
  { name: 'create', title: 'Create', iconName: 'plus.circle.fill', iconSize: 28 },
  { name: 'cases', title: 'Cases', iconName: 'list.bullet' },
  { name: 'drafts', title: 'Drafts', iconName: 'doc.text.fill' },
  { name: 'profile', title: 'Profile', iconName: 'person.fill' },
];

export default function OfficerLayout() {
  return <RoleBasedTabLayout headerTitle="MANTIS" tabs={officerTabs} />;
}
