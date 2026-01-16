/**
 * MANTIS Mobile - Database Helper
 * 
 * Type-safe wrapper around Supabase client for mobile app
 */

import { supabase } from '../utils/supabase';
import type {
  Agency,
  Location,
  Team,
  User,
  Driver,
  Vehicle,
  Offence,
  Infringement,
  EvidenceFile,
  Payment,
  Appeal,
  NewDriver,
  NewVehicle,
  NewInfringement,
  NewEvidenceFile,
  InfringementWithDetails,
  UserWithRelations,
  ApiResponse,
  PaginatedResponse,
  TableNames,
} from './types';

// -----------------------------------------------------
// Generic Query Helpers
// -----------------------------------------------------

export async function fetchOne<T>(
  table: string,
  id: string
): Promise<ApiResponse<T>> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data: data as T };
}

export async function fetchMany<T>(
  table: string,
  options?: {
    filter?: Record<string, any>;
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<ApiResponse<T[]>> {
  let query = supabase.from(table).select('*');

  // Apply filters
  if (options?.filter) {
    Object.entries(options.filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  // Apply ordering
  if (options?.orderBy) {
    query = query.order(options.orderBy, { ascending: options.ascending ?? true });
  }

  // Apply pagination
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data: data as T[] };
}

// -----------------------------------------------------
// User Queries
// -----------------------------------------------------

export async function getCurrentUser(): Promise<ApiResponse<UserWithRelations>> {
  const { data: authData } = await supabase.auth.getUser();
  
  if (!authData.user) {
    return { error: { message: 'Not authenticated' } };
  }

  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      agency:agencies(*),
      team:teams(*)
    `)
    .eq('id', authData.user.id)
    .single();

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data: data as UserWithRelations };
}

export async function getUserById(userId: string): Promise<ApiResponse<User>> {
  return fetchOne<User>('users', userId);
}

// -----------------------------------------------------
// Infringement Queries
// -----------------------------------------------------

export async function getInfringements(options?: {
  status?: string;
  officer_id?: string;
  team_id?: string;
  limit?: number;
  offset?: number;
}): Promise<ApiResponse<Infringement[]>> {
  let query = supabase
    .from('infringements')
    .select('*')
    .order('issued_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }
  if (options?.officer_id) {
    query = query.eq('officer_id', options.officer_id);
  }
  if (options?.team_id) {
    query = query.eq('team_id', options.team_id);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    const limit = options.limit || 10;
    query = query.range(options.offset, options.offset + limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data: data as Infringement[] };
}

export async function getInfringementWithDetails(
  id: string
): Promise<ApiResponse<InfringementWithDetails>> {
  const { data, error } = await supabase
    .from('infringements')
    .select(`
      *,
      driver:drivers(*),
      vehicle:vehicles(*),
      offence:offences(*),
      officer:users(*),
      team:teams(*),
      agency:agencies(*),
      jurisdiction:locations(*),
      evidence_files(*),
      payments(*),
      appeals(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data: data as InfringementWithDetails };
}

export async function createInfringement(
  infringement: NewInfringement
): Promise<ApiResponse<Infringement>> {
  const { data, error } = await supabase
    .from('infringements')
    .insert(infringement as any)
    .select()
    .single();

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data: data as Infringement };
}

export async function updateInfringement(
  id: string,
  updates: Partial<Infringement>
): Promise<ApiResponse<Infringement>> {
  const { data, error } = await supabase
    .from('infringements')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data: data as Infringement };
}

// -----------------------------------------------------
// Driver Queries
// -----------------------------------------------------

export async function searchDriverByLicense(
  licenseNumber: string
): Promise<ApiResponse<Driver>> {
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('license_number', licenseNumber)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = not found, which is expected
    return { error: { message: error.message, code: error.code } };
  }

  return { data: (data as unknown) as Driver };
}

export async function searchDriver(licenseNumber: string): Promise<ApiResponse<Driver>> {
  return searchDriverByLicense(licenseNumber);
}

export async function createDriver(driver: NewDriver): Promise<ApiResponse<Driver>> {
  const { data, error } = await supabase
    .from('drivers')
    .insert(driver as any)
    .select()
    .single();

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data: data as Driver };
}

export async function upsertDriver(driver: NewDriver): Promise<ApiResponse<Driver>> {
  const { data, error } = await supabase
    .from('drivers')
    .upsert(driver as any, { onConflict: 'license_number' })
    .select()
    .single();

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data: data as Driver };
}

// -----------------------------------------------------
// Vehicle Queries
// -----------------------------------------------------

export async function searchVehicleByPlate(
  plateNumber: string
): Promise<ApiResponse<Vehicle>> {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('plate_number', plateNumber)
    .single();

  if (error && error.code !== 'PGRST116') {
    return { error: { message: error.message, code: error.code } };
  }

  return { data: (data as unknown) as Vehicle };
}

export async function searchVehicle(plateNumber: string): Promise<ApiResponse<Vehicle>> {
  return searchVehicleByPlate(plateNumber);
}

export async function createVehicle(vehicle: NewVehicle): Promise<ApiResponse<Vehicle>> {
  const { data, error } = await supabase
    .from('vehicles')
    .insert(vehicle as any)
    .select()
    .single();

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data: data as Vehicle };
}

export async function upsertVehicle(vehicle: NewVehicle): Promise<ApiResponse<Vehicle>> {
  const { data, error } = await supabase
    .from('vehicles')
    .upsert(vehicle as any, { onConflict: 'plate_number' })
    .select()
    .single();

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data: data as Vehicle };
}

// -----------------------------------------------------
// Offence Queries
// -----------------------------------------------------

export async function getActiveOffences(): Promise<ApiResponse<Offence[]>> {
  const { data, error } = await supabase
    .from('offences')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data: data as Offence[] };
}

export async function getOffences(options?: {
  active?: boolean;
  agency_type?: string;
  limit?: number;
}): Promise<ApiResponse<Offence[]>> {
  let query = supabase
    .from('offences')
    .select('*')
    .order('name');

  if (options?.active !== undefined) {
    query = query.eq('active', options.active);
  }
  if (options?.agency_type) {
    query = query.eq('agency_type', options.agency_type);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data: data as Offence[] };
}

export async function getOffenceByCode(code: string): Promise<ApiResponse<Offence>> {
  const { data, error } = await supabase
    .from('offences')
    .select('*')
    .eq('code', code)
    .single();

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data: data as Offence };
}

// -----------------------------------------------------
// Evidence File Queries
// -----------------------------------------------------

export async function uploadEvidenceFile(
  infringementId: string,
  fileUri: string,
  fileType: string
): Promise<ApiResponse<EvidenceFile>> {
  // 1. Upload file to Supabase Storage
  const fileName = `${infringementId}/${Date.now()}.jpg`;
  
  // Convert local URI to blob
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('evidence')
    .upload(fileName, blob, {
      contentType: fileType,
      upsert: false,
    });

  if (uploadError) {
    return { error: { message: uploadError.message } };
  }

  // 2. Create evidence file record
  const evidenceFile: NewEvidenceFile = {
    infringement_id: infringementId,
    file_path: uploadData.path,
    file_type: fileType,
  };

  const { data, error } = await supabase
    .from('evidence_files')
    .insert(evidenceFile as any)
    .select()
    .single();

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data: data as EvidenceFile };
}

export async function getEvidenceFiles(
  infringementId: string
): Promise<ApiResponse<EvidenceFile[]>> {
  const { data, error } = await supabase
    .from('evidence_files')
    .select('*')
    .eq('infringement_id', infringementId);

  if (error) {
    return { error: { message: error.message, code: error.code } };
  }

  return { data: data as EvidenceFile[] };
}

export async function getEvidenceFileUrl(filePath: string): Promise<string> {
  const { data } = supabase.storage
    .from('evidence')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// -----------------------------------------------------
// Location Queries
// -----------------------------------------------------

export async function getLocations(): Promise<ApiResponse<Location[]>> {
  return fetchMany<Location>('locations', {
    orderBy: 'name',
    ascending: true,
  });
}

export async function getLocationById(id: string): Promise<ApiResponse<Location>> {
  return fetchOne<Location>('locations', id);
}

// -----------------------------------------------------
// Team Queries
// -----------------------------------------------------

export async function getTeamMembers(teamId: string): Promise<ApiResponse<User[]>> {
  return fetchMany<User>('users', {
    filter: { team_id: teamId },
    orderBy: 'display_name',
  });
}

export async function getTeamInfringements(
  teamId: string,
  options?: { limit?: number; offset?: number }
): Promise<ApiResponse<Infringement[]>> {
  return getInfringements({
    team_id: teamId,
    ...options,
  });
}

// -----------------------------------------------------
// Agency Queries
// -----------------------------------------------------

export async function getAgencies(): Promise<ApiResponse<Agency[]>> {
  return fetchMany<Agency>('agencies', {
    orderBy: 'name',
  });
}

// -----------------------------------------------------
// Real-time Subscriptions
// -----------------------------------------------------

export function subscribeToInfringements(
  callback: (payload: any) => void,
  filter?: { officer_id?: string; team_id?: string }
) {
  let channel = supabase
    .channel('infringements-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'infringements',
        filter: filter?.officer_id ? `officer_id=eq.${filter.officer_id}` : undefined,
      },
      callback
    );

  channel.subscribe();

  return () => {
    channel.unsubscribe();
  };
}

// -----------------------------------------------------
// Statistics Queries (Team Leader)
// -----------------------------------------------------

export async function getTeamStats(teamId: string) {
  // This would typically call a Supabase Edge Function or use RPC
  // For now, return basic stats
  const { data: infringements } = await getTeamInfringements(teamId);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayCount = infringements?.filter(i => 
    new Date(i.issued_at) >= today
  ).length || 0;

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weekCount = infringements?.filter(i => 
    new Date(i.issued_at) >= weekAgo
  ).length || 0;

  return {
    total_infringements: infringements?.length || 0,
    today_infringements: todayCount,
    week_infringements: weekCount,
    pending_approvals: infringements?.filter(i => i.status === 'pending').length || 0,
  };
}
