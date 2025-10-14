import { supabase } from '@/supabase/config';

/**
 * Mobile API Layer for Infringements
 * Provides functions to interact with infringement data
 */

export type InfringementStatus = 'issued' | 'paid' | 'voided' | 'disputed';

export interface Vehicle {
  id: string;
  reg_number: string;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  color?: string | null;
}

export interface Offence {
  id: string;
  code: string;
  description: string;
  base_fine_amount: number;
  category?: string;
}

export interface Infringement {
  id: string;
  infringement_number: string;
  issuing_agency_id: string;
  officer_user_id: string;
  vehicle_id: string;
  driver_licence_number: string | null;
  offence_id: string;
  fine_amount: number;
  status: InfringementStatus;
  location: { lat: number; lng: number } | null;
  location_description: string | null;
  notes: string | null;
  evidence_urls: string[];
  issued_at: string;
  created_at: string;
  vehicle?: Vehicle;
  offence?: Offence;
  agency?: {
    name: string;
    code: string;
  };
  officer?: {
    display_name: string;
  };
}

export interface CreateInfringementData {
  vehicle_reg_number: string;
  offence_id: string;
  driver_licence_number?: string;
  location_description?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Search for a vehicle by registration number
 */
export async function searchVehicle(regNumber: string): Promise<Vehicle | null> {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('reg_number', regNumber.toUpperCase().trim())
      .eq('active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error searching vehicle:', error);
    throw new Error(`Failed to search vehicle: ${error.message}`);
  }
}

/**
 * Create a new vehicle if it doesn't exist
 */
export async function createVehicle(regNumber: string): Promise<Vehicle> {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        reg_number: regNumber.toUpperCase().trim(),
        active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    throw new Error(`Failed to create vehicle: ${error.message}`);
  }
}

/**
 * Get all active offences
 */
export async function getOffences(): Promise<Offence[]> {
  try {
    const { data, error } = await supabase
      .from('offences')
      .select('*')
      .eq('active', true)
      .order('code');

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching offences:', error);
    throw new Error(`Failed to fetch offences: ${error.message}`);
  }
}

/**
 * Get a single offence by ID
 */
export async function getOffence(id: string): Promise<Offence> {
  try {
    const { data, error } = await supabase
      .from('offences')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching offence:', error);
    throw new Error(`Failed to fetch offence: ${error.message}`);
  }
}

/**
 * Create a new infringement
 */
export async function createInfringement(
  data: CreateInfringementData
): Promise<Infringement> {
  try {
    // Get or create the vehicle
    let vehicle = await searchVehicle(data.vehicle_reg_number);
    if (!vehicle) {
      vehicle = await createVehicle(data.vehicle_reg_number);
    }

    // Get the offence to retrieve the base fine amount
    const offence = await getOffence(data.offence_id);

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user profile to get agency_id
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.agency_id) {
      throw new Error('User profile or agency not found');
    }

    // Create the infringement
    const infringementData: any = {
      issuing_agency_id: profile.agency_id,
      officer_user_id: user.id,
      vehicle_id: vehicle.id,
      offence_id: data.offence_id,
      fine_amount: offence.base_fine_amount,
      status: 'issued',
      driver_licence_number: data.driver_licence_number || null,
      location_description: data.location_description || null,
      notes: data.notes || null,
    };

    // Add location if provided
    if (data.latitude && data.longitude) {
      infringementData.location = `POINT(${data.longitude} ${data.latitude})`;
    }

    const { data: infringement, error } = await supabase
      .from('infringements')
      .insert(infringementData)
      .select(
        `
        *,
        vehicle:vehicles(*),
        offence:offences(*),
        agency:agencies(*),
        officer:user_profiles(full_name)
      `
      )
      .single();

    if (error) throw error;
    return infringement;
  } catch (error: any) {
    console.error('Error creating infringement:', error);
    throw new Error(`Failed to create infringement: ${error.message}`);
  }
}

/**
 * Get infringements for the current user
 */
export async function getInfringements(filters?: {
  status?: InfringementStatus;
  limit?: number;
  offset?: number;
}): Promise<Infringement[]> {
  try {
    let query = supabase
      .from('infringements')
      .select(
        `
        *,
        vehicle:vehicles(*),
        offence:offences(*),
        agency:agencies(*),
        officer:user_profiles(full_name)
      `
      )
      .order('issued_at', { ascending: false });

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching infringements:', error);
    throw new Error(`Failed to fetch infringements: ${error.message}`);
  }
}

/**
 * Get a single infringement by ID
 */
export async function getInfringement(id: string): Promise<Infringement> {
  try {
    const { data, error } = await supabase
      .from('infringements')
      .select(
        `
        *,
        vehicle:vehicles(*),
        offence:offences(*),
        agency:agencies(*),
        officer:user_profiles(full_name)
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching infringement:', error);
    throw new Error(`Failed to fetch infringement: ${error.message}`);
  }
}

/**
 * Void an infringement (Officer action)
 * Changes status to 'voided' and creates audit log
 */
export async function voidInfringement(
  infringementId: string,
  reason?: string
): Promise<void> {
  try {
    // Update infringement status
    const { error: updateError } = await supabase
      .from('infringements')
      .update({
        status: 'voided',
        voided_at: new Date().toISOString(),
        void_reason: reason,
      })
      .eq('id', infringementId);

    if (updateError) throw updateError;

    // Create audit log
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        table_name: 'infringements',
        record_id: infringementId,
        action: 'void',
        old_values: null,
        new_values: { status: 'voided', void_reason: reason },
      });

    if (auditError) {
      console.warn('Failed to create audit log:', auditError);
    }
  } catch (error: any) {
    console.error('Error voiding infringement:', error);
    throw new Error(`Failed to void infringement: ${error.message}`);
  }
}

/**
 * Payment method types
 */
export type PaymentMethod = 'card' | 'm_paisa' | 'my_cash';

export interface CreatePaymentData {
  infringement_id: string;
  amount: number;
  payment_method: PaymentMethod;
  reference_number?: string;
}

/**
 * Create a payment for an infringement
 * Updates infringement status to 'paid'
 */
export async function createPayment(data: CreatePaymentData): Promise<void> {
  try {
    // Start a transaction by updating infringement first
    const { error: infringementError } = await supabase
      .from('infringements')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', data.infringement_id);

    if (infringementError) throw infringementError;

    // Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        infringement_id: data.infringement_id,
        amount: data.amount,
        payment_method: data.payment_method,
        reference_number: data.reference_number,
        status: 'completed',
        paid_at: new Date().toISOString(),
      });

    if (paymentError) throw paymentError;

    // Create audit log
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        table_name: 'infringements',
        record_id: data.infringement_id,
        action: 'payment',
        old_values: null,
        new_values: {
          status: 'paid',
          payment_method: data.payment_method,
          amount: data.amount,
        },
      });

    if (auditError) {
      console.warn('Failed to create audit log:', auditError);
    }
  } catch (error: any) {
    console.error('Error creating payment:', error);
    throw new Error(`Failed to process payment: ${error.message}`);
  }
}

/**
 * Dispute reason types
 */
export type DisputeReason =
  | 'not_my_vehicle'
  | 'incorrect_details'
  | 'vehicle_stolen'
  | 'parking_permit'
  | 'emergency'
  | 'other';

export interface CreateDisputeData {
  infringement_id: string;
  reason: DisputeReason;
  description: string;
  evidence_urls?: string[];
}

/**
 * Create a dispute for an infringement
 * Updates infringement status to 'disputed'
 */
export async function createDispute(data: CreateDisputeData): Promise<void> {
  try {
    // Update infringement status
    const { error: infringementError } = await supabase
      .from('infringements')
      .update({
        status: 'disputed',
        disputed_at: new Date().toISOString(),
      })
      .eq('id', data.infringement_id);

    if (infringementError) throw infringementError;

    // Create dispute record
    const { error: disputeError } = await supabase
      .from('disputes')
      .insert({
        infringement_id: data.infringement_id,
        reason: data.reason,
        description: data.description,
        evidence_urls: data.evidence_urls || [],
        status: 'pending',
        submitted_at: new Date().toISOString(),
      });

    if (disputeError) throw disputeError;

    // Create audit log
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        table_name: 'infringements',
        record_id: data.infringement_id,
        action: 'dispute',
        old_values: null,
        new_values: {
          status: 'disputed',
          reason: data.reason,
        },
      });

    if (auditError) {
      console.warn('Failed to create audit log:', auditError);
    }
  } catch (error: any) {
    console.error('Error creating dispute:', error);
    throw new Error(`Failed to create dispute: ${error.message}`);
  }
}

/**
 * Upload evidence photos to Supabase Storage and update infringement
 */
export async function uploadEvidencePhotos(
  infringementId: string,
  photos: { uri: string; id: string }[]
): Promise<string[]> {
  try {
    if (photos.length === 0) {
      return [];
    }

    const uploadedUrls: string[] = [];

    // Upload each photo to Supabase Storage
    for (const photo of photos) {
      // Fetch the photo as blob
      const response = await fetch(photo.uri);
      const blob = await response.blob();

      // Generate unique filename
      const fileExt = photo.uri.split('.').pop() || 'jpg';
      const fileName = `${infringementId}/${Date.now()}_${photo.id}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('evidence-photos')
        .upload(fileName, blob, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload photo: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('evidence-photos')
        .getPublicUrl(uploadData.path);

      uploadedUrls.push(urlData.publicUrl);
    }

    // Update infringement with evidence URLs
    const { error: updateError } = await supabase
      .from('infringements')
      .update({ evidence_urls: uploadedUrls })
      .eq('id', infringementId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error(`Failed to update infringement: ${updateError.message}`);
    }

    // Create audit log
    const { error: auditError } = await supabase.from('audit_logs').insert({
      table_name: 'infringements',
      record_id: infringementId,
      action: 'update',
      changes: {
        evidence_urls: {
          old: [],
          new: uploadedUrls,
        },
      },
    });

    if (auditError) {
      console.warn('Failed to create audit log:', auditError);
    }

    return uploadedUrls;
  } catch (error: any) {
    console.error('Error uploading evidence photos:', error);
    throw new Error(`Failed to upload evidence photos: ${error.message}`);
  }
}
