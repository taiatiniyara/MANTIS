import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  const startTime = Date.now();
  let apiKeyId: string | null = null;

  try {
    // Get API key from header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid API key' },
        { status: 401 }
      );
    }

    const apiKey = authHeader.substring(7);
    const supabase = await createClient();

    // Hash the API key
    const keyHash = crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');

    // Verify API key
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single();

    if (keyError || !keyData) {
      await logRequest(null, '/api/public/infringements', 'POST', 401, Date.now() - startTime, 'Invalid API key');
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    apiKeyId = keyData.id;

    // Check if key is expired
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      await logRequest(apiKeyId, '/api/public/infringements', 'POST', 401, Date.now() - startTime, 'API key expired');
      return NextResponse.json(
        { error: 'API key expired' },
        { status: 401 }
      );
    }

    // Check permissions
    const permissions = keyData.permissions as string[];
    if (!permissions.includes('infringements.create')) {
      await logRequest(apiKeyId, '/api/public/infringements', 'POST', 403, Date.now() - startTime, 'Insufficient permissions');
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['type_id', 'offender_license', 'vehicle_registration', 'officer_id'];
    for (const field of requiredFields) {
      if (!body[field]) {
        await logRequest(apiKeyId, '/api/public/infringements', 'POST', 400, Date.now() - startTime, `Missing field: ${field}`);
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create infringement
    const { data: infringement, error: createError } = await supabase
      .from('infringements')
      .insert({
        ...body,
        agency_id: keyData.agency_id,
      })
      .select()
      .single();

    if (createError) throw createError;

    // Log successful request
    await logRequest(apiKeyId, '/api/public/infringements', 'POST', 201, Date.now() - startTime);

    // Trigger webhook
    await supabase.rpc('trigger_webhook', {
      p_event_type: 'infringement.created',
      p_payload: infringement,
    });

    return NextResponse.json(infringement, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    await logRequest(apiKeyId, '/api/public/infringements', 'POST', 500, Date.now() - startTime, 'Internal server error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const startTime = Date.now();
  let apiKeyId: string | null = null;

  try {
    // Get API key from header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid API key' },
        { status: 401 }
      );
    }

    const apiKey = authHeader.substring(7);
    const supabase = await createClient();

    // Hash the API key
    const keyHash = crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');

    // Verify API key
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single();

    if (keyError || !keyData) {
      await logRequest(null, '/api/public/infringements', 'GET', 401, Date.now() - startTime, 'Invalid API key');
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    apiKeyId = keyData.id;

    // Check permissions
    const permissions = keyData.permissions as string[];
    if (!permissions.includes('infringements.read')) {
      await logRequest(apiKeyId, '/api/public/infringements', 'GET', 403, Date.now() - startTime, 'Insufficient permissions');
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch infringements
    let query = supabase
      .from('infringements')
      .select('*')
      .eq('agency_id', keyData.agency_id)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    // Log successful request
    await logRequest(apiKeyId, '/api/public/infringements', 'GET', 200, Date.now() - startTime);

    return NextResponse.json({
      data,
      pagination: {
        limit,
        offset,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    await logRequest(apiKeyId, '/api/public/infringements', 'GET', 500, Date.now() - startTime, 'Internal server error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function logRequest(
  apiKeyId: string | null,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTimeMs: number,
  errorMessage?: string
) {
  if (!apiKeyId) return;

  try {
    const supabase = await createClient();
    await supabase.rpc('log_api_request', {
      p_api_key_id: apiKeyId,
      p_endpoint: endpoint,
      p_method: method,
      p_status_code: statusCode,
      p_response_time_ms: responseTimeMs,
      p_error_message: errorMessage || null,
    });
  } catch (error) {
    console.error('Error logging API request:', error);
  }
}
