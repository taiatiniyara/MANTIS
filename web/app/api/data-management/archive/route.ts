import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  const { table, olderThan, reason } = await request.json();

  // Get user details
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userData || userData.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Calculate cutoff date
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThan));

  // Create archive job
  const { data: job, error: jobError } = await supabase
    .from("archive_jobs")
    .insert({
      job_type: "archive",
      table_name: table,
      status: "pending",
      filter_criteria: {
        olderThan,
        cutoffDate: cutoffDate.toISOString(),
        reason,
      },
      created_by: user.id,
    })
    .select()
    .single();

  if (jobError) {
    console.error("Error creating archive job:", jobError);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }

  // Start archiving process
  try {
    // Update job status to running
    await supabase
      .from("archive_jobs")
      .update({
        status: "running",
        started_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    // Get records to archive (only for infringements for now)
    if (table === "infringements") {
      const { data: recordsToArchive, error: fetchError } = await supabase
        .from("infringements")
        .select("*")
        .lt("issued_at", cutoffDate.toISOString());

      if (fetchError) {
        throw fetchError;
      }

      const totalRecords = recordsToArchive?.length || 0;

      // Update job with total records
      await supabase
        .from("archive_jobs")
        .update({ records_total: totalRecords })
        .eq("id", job.id);

      if (recordsToArchive && recordsToArchive.length > 0) {
        // Archive records in batches
        const batchSize = 100;
        let processed = 0;

        for (let i = 0; i < recordsToArchive.length; i += batchSize) {
          const batch = recordsToArchive.slice(i, i + batchSize);

          // Insert into archived_infringements
          const archivedRecords = batch.map((record) => ({
            original_id: record.id,
            vehicle_id: record.vehicle_id,
            infringement_number: record.infringement_number,
            issued_at: record.issued_at,
            location_id: record.location_id,
            officer_id: record.officer_id,
            team_id: record.team_id,
            route_id: record.route_id,
            agency_id: record.agency_id,
            type_id: record.type_id,
            notes: record.notes,
            photo_url: record.photo_url,
            video_url: record.video_url,
            status: record.status,
            created_at: record.created_at,
            updated_at: record.updated_at,
            archived_by: user.id,
            archive_reason: reason,
            metadata: record,
          }));

          const { error: insertError } = await supabase
            .from("archived_infringements")
            .insert(archivedRecords);

          if (insertError) {
            throw insertError;
          }

          // Delete from original table
          const idsToDelete = batch.map((r) => r.id);
          const { error: deleteError } = await supabase
            .from("infringements")
            .delete()
            .in("id", idsToDelete);

          if (deleteError) {
            throw deleteError;
          }

          processed += batch.length;

          // Update progress
          await supabase
            .from("archive_jobs")
            .update({ records_processed: processed })
            .eq("id", job.id);
        }
      }

      // Mark job as completed
      await supabase
        .from("archive_jobs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          records_processed: totalRecords,
        })
        .eq("id", job.id);

      return NextResponse.json({
        success: true,
        jobId: job.id,
        recordsArchived: totalRecords,
      });
    }

    return NextResponse.json({ error: "Unsupported table" }, { status: 400 });
  } catch (error) {
    console.error("Archive error:", error);

    // Mark job as failed
    await supabase
      .from("archive_jobs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : "Unknown error",
      })
      .eq("id", job.id);

    return NextResponse.json({ error: "Archive failed" }, { status: 500 });
  }
}
