/**
 * Screen Wrapper Component
 * Automatically wraps all screens with SafeAreaLayout
 * This is used in layout files to avoid repeating SafeAreaLayout in every screen
 */

import React from 'react';
import { SafeAreaLayout } from './SafeAreaLayout';

interface ScreenWrapperProps {
  children: React.ReactNode;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
}

/**
 * Wrapper component that applies SafeAreaLayout to screen content
 * Used by layout files to wrap all child screens automatically
 */
export function ScreenWrapper({ children, edges = ['top', 'left', 'right'] }: ScreenWrapperProps) {
  return (
    <SafeAreaLayout edges={edges}>
      {children}
    </SafeAreaLayout>
  );
}
