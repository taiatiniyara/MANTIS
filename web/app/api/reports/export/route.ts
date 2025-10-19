import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const agency = searchParams.get("agency");
  const format = searchParams.get("format") || "csv";

  // Get user details
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role, agency_id")
    .eq("id", user.id)
    .single();

  if (!userData || !["super_admin", "agency_admin", "manager"].includes(userData.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Build query
  let query = supabase.from("infringements").select(
    `
      id,
      vehicle_id,
      issued_at,
      created_at,
      type:infringement_types (
        code,
        name,
        fine_amount,
        gl_code
      ),
      agency:agencies (
        name
      ),
      officer:users!infringements_officer_id_fkey (
        full_name
      )
    `
  );

  // Apply filters
  if (userData.role === "agency_admin" && userData.agency_id) {
    query = query.eq("agency_id", userData.agency_id);
  } else if (agency) {
    query = query.eq("agency_id", agency);
  }

  if (from) {
    query = query.gte("issued_at", from);
  }

  if (to) {
    query = query.lte("issued_at", to);
  }

  const { data: infringements, error } = await query;

  if (error) {
    console.error("Error fetching infringements:", error);
    return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
  }

  // Generate export based on format
  if (format === "csv") {
    const csv = generateCSV(infringements || []);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="report-${Date.now()}.csv"`,
      },
    });
  } else if (format === "xlsx") {
    // For Excel, we'd use a library like xlsx
    // For now, return CSV
    const csv = generateCSV(infringements || []);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="report-${Date.now()}.csv"`,
      },
    });
  } else if (format === "pdf") {
    const html = generatePDF(infringements || []);
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  }

  return NextResponse.json({ error: "Invalid format" }, { status: 400 });
}

function generateCSV(infringements: any[]): string {
  const headers = [
    "ID",
    "Date",
    "Vehicle ID",
    "Type Code",
    "Type Name",
    "Fine Amount",
    "GL Code",
    "Agency",
    "Officer",
  ];

  const rows = infringements.map((inf) => [
    inf.id,
    new Date(inf.issued_at).toLocaleDateString(),
    inf.vehicle_id || "",
    inf.type?.code || "",
    inf.type?.name || "",
    inf.type?.fine_amount || "0",
    inf.type?.gl_code || "",
    inf.agency?.[0]?.name || "",
    inf.officer?.[0]?.full_name || "",
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${cell}"`).join(",")
    ),
  ].join("\n");

  return csv;
}

function generatePDF(infringements: any[]): string {
  const totalFines = infringements.reduce(
    (sum, inf) => sum + (inf.type?.fine_amount || 0),
    0
  );

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Infringement Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; font-weight: bold; }
          .summary { margin: 20px 0; padding: 15px; background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>Infringement Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        
        <div class="summary">
          <h2>Summary</h2>
          <p><strong>Total Infringements:</strong> ${infringements.length}</p>
          <p><strong>Total Fines:</strong> $${totalFines.toFixed(2)}</p>
          <p><strong>Average Fine:</strong> $${
            infringements.length > 0 ? (totalFines / infringements.length).toFixed(2) : "0.00"
          }</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Vehicle ID</th>
              <th>Type</th>
              <th>Fine</th>
              <th>Agency</th>
              <th>Officer</th>
            </tr>
          </thead>
          <tbody>
            ${infringements
              .map(
                (inf) => `
              <tr>
                <td>${new Date(inf.issued_at).toLocaleDateString()}</td>
                <td>${inf.vehicle_id || ""}</td>
                <td>${inf.type?.name || ""}</td>
                <td>$${inf.type?.fine_amount || "0"}</td>
                <td>${inf.agency?.[0]?.name || ""}</td>
                <td>${inf.officer?.[0]?.full_name || ""}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  return html;
}
