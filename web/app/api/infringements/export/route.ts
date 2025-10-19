import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user details
  const { data: userData } = await supabase
    .from("users")
    .select("role, agency_id")
    .eq("id", user.id)
    .single();

  if (!userData || !["super_admin", "agency_admin"].includes(userData.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Build query with filters
  let query = supabase
    .from("infringements")
    .select(
      `
      *,
      officer:users!officer_id (
        position
      ),
      agency:agencies (
        name
      ),
      team:teams (
        name
      ),
      route:routes (
        name
      ),
      type:infringement_types (
        code,
        name,
        fine_amount,
        demerit_points,
        gl_code,
        category:infringement_categories (
          name
        )
      ),
      location:locations (
        name,
        type
      )
    `
    )
    .order("issued_at", { ascending: false });

  // Apply role-based filtering
  if (userData.role === "agency_admin" && userData.agency_id) {
    query = query.eq("agency_id", userData.agency_id);
  } else if (searchParams.get("agency")) {
    query = query.eq("agency_id", searchParams.get("agency"));
  }

  // Apply search and filters
  if (searchParams.get("search")) {
    query = query.ilike("vehicle_id", `%${searchParams.get("search")}%`);
  }

  if (searchParams.get("type")) {
    query = query.eq("type_id", searchParams.get("type"));
  }

  if (searchParams.get("officer")) {
    query = query.eq("officer_id", searchParams.get("officer"));
  }

  if (searchParams.get("team")) {
    query = query.eq("team_id", searchParams.get("team"));
  }

  if (searchParams.get("route")) {
    query = query.eq("route_id", searchParams.get("route"));
  }

  if (searchParams.get("location")) {
    query = query.eq("location_id", searchParams.get("location"));
  }

  if (searchParams.get("from")) {
    query = query.gte("issued_at", searchParams.get("from"));
  }

  if (searchParams.get("to")) {
    query = query.lte("issued_at", searchParams.get("to"));
  }

  const { data: infringements, error } = await query;

  if (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }

  const exportType = searchParams.get("export") || "csv";

  if (exportType === "csv") {
    // Generate CSV
    const headers = [
      "ID",
      "Vehicle ID",
      "Date & Time",
      "Infringement Type",
      "Category",
      "Fine Amount",
      "Demerit Points",
      "GL Code",
      "Officer",
      "Agency",
      "Team",
      "Route",
      "Location",
      "Notes",
    ];

    const rows = (infringements || []).map((inf: any) => [
      inf.id,
      inf.vehicle_id,
      new Date(inf.issued_at).toLocaleString(),
      `${inf.type?.code} - ${inf.type?.name}`,
      inf.type?.category?.name || "",
      inf.type?.fine_amount || "",
      inf.type?.demerit_points || "",
      inf.type?.gl_code || "",
      inf.officer?.position || "",
      inf.agency?.name || "",
      inf.team?.name || "",
      inf.route?.name || "",
      inf.location ? `${inf.location.name} (${inf.location.type})` : "",
      inf.notes || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="infringements-${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } else if (exportType === "pdf") {
    // For PDF, we'll return a simple HTML that can be printed
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Infringements Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; font-weight: bold; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .header { margin-bottom: 20px; }
    .date { color: #666; font-size: 14px; }
    @media print {
      button { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Traffic Infringements Report</h1>
    <p class="date">Generated: ${new Date().toLocaleString()}</p>
    <p>Total Records: ${infringements?.length || 0}</p>
    <button onclick="window.print()">Print / Save as PDF</button>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Vehicle ID</th>
        <th>Date & Time</th>
        <th>Type</th>
        <th>Category</th>
        <th>Fine</th>
        <th>Officer</th>
        <th>Location</th>
      </tr>
    </thead>
    <tbody>
      ${(infringements || [])
        .map(
          (inf: any) => `
        <tr>
          <td>${inf.vehicle_id}</td>
          <td>${new Date(inf.issued_at).toLocaleString()}</td>
          <td>${inf.type?.code} - ${inf.type?.name}</td>
          <td>${inf.type?.category?.name || ""}</td>
          <td>R ${inf.type?.fine_amount || "0"}</td>
          <td>${inf.officer?.position || ""}</td>
          <td>${
            inf.location ? `${inf.location.name} (${inf.location.type})` : ""
          }</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  }

  return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
}
