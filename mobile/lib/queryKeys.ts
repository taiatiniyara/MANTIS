// Centralized query key factory helpers
export const queryKeys = {
  infringementsByOfficer: (officerId?: string | null, limit?: number) =>
    ['infringements', 'officer', officerId ?? 'anon', limit ?? 'all'] as const,
  evidenceByInfringement: (infringementId?: string | null) =>
    ['evidence', 'infringement', infringementId ?? 'none'] as const,
  drafts: ['drafts'] as const,
  offencesActive: ['offences', 'active'] as const,
  officerStats: (officerId?: string | null) => ['stats', 'officer', officerId ?? 'anon'] as const,
  teamStats: (teamId?: string | null) => ['stats', 'team', teamId ?? 'none'] as const,
  syncStats: ['sync', 'stats'] as const,
  currentUser: ['auth', 'current-user'] as const,
};