import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: profile, error: profileError } = await supabase
      .from("volunteer_profiles")
      .select("full_name, email, volunteer_role")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Volunteer profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profile.email) {
      return new Response(
        JSON.stringify({ error: "Volunteer email not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: hours, error: hoursError } = await supabase
      .from("volunteer_hours")
      .select("id, date, activity, hours, notes")
      .eq("user_id", userId)
      .eq("status", "approved")
      .order("date", { ascending: false });

    if (hoursError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch hours" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY is not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const totalHours = (hours || []).reduce((sum: number, h: any) => sum + Number(h.hours), 0);
    const firstName = profile.full_name ? profile.full_name.split(" ")[0] : "Volunteer";

    const formatDate = (dateStr: string) =>
      new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

    const formatHours = (h: number) => (h % 1 === 0 ? h : h.toFixed(1));

    const byMonth: Record<string, { activity: string; date: string; hours: number; notes: string | null }[]> = {};
    for (const entry of (hours || [])) {
      const monthKey = (entry as any).date.slice(0, 7);
      if (!byMonth[monthKey]) byMonth[monthKey] = [];
      byMonth[monthKey].push(entry as any);
    }

    const monthNames = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];

    const formatMonthLabel = (ym: string) => {
      const [y, m] = ym.split("-");
      return `${monthNames[Number(m) - 1]} ${y}`;
    };

    const monthsSorted = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));

    const monthSections = monthsSorted.map((ym) => {
      const entries = byMonth[ym];
      const monthTotal = entries.reduce((s: number, e: any) => s + Number(e.hours), 0);
      const rows = entries.map((e: any) => `
        <tr>
          <td style="padding:8px 12px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;">${e.activity}</td>
          <td style="padding:8px 12px;font-size:13px;color:#6b7280;border-bottom:1px solid #f3f4f6;white-space:nowrap;">${formatDate(e.date)}</td>
          <td style="padding:8px 12px;font-size:13px;font-weight:700;color:#111827;border-bottom:1px solid #f3f4f6;text-align:right;white-space:nowrap;">${formatHours(Number(e.hours))}h</td>
        </tr>
      `).join("");

      return `
        <div style="margin-bottom:24px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <p style="margin:0;font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">${formatMonthLabel(ym)}</p>
            <span style="font-size:12px;font-weight:700;color:#111827;background:#f3f4f6;padding:3px 10px;border-radius:20px;">${formatHours(monthTotal)}h</span>
          </div>
          <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:10px;overflow:hidden;">
            <thead>
              <tr style="background:#f3f4f6;">
                <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;">Activity</th>
                <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;">Date</th>
                <th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;">Hours</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }).join("");

    const emptyState = (hours || []).length === 0
      ? `<div style="text-align:center;padding:32px;background:#f9fafb;border-radius:12px;margin:20px 0;">
          <p style="margin:0;font-size:15px;color:#6b7280;">No approved hours recorded yet.</p>
        </div>`
      : "";

    const ROLE_LABELS: Record<string, string> = {
      peer_trainer: "Peer Trainer",
      outreach_volunteer: "Outreach Volunteer",
      peer_support_worker: "Peer Support Worker",
      events_coordinator: "Events Coordinator",
      content_creator: "Content Creator",
      admin_support: "Admin Support",
    };

    const roleLabel = ROLE_LABELS[profile.volunteer_role] || profile.volunteer_role || "Volunteer";
    const now = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const emailSubject = `⏱️ Your volunteer hours summary — ${formatHours(totalHours)} approved hrs`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f3f4f6;margin:0;padding:0;">
        <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <div style="background:#111827;padding:28px 32px;">
            <p style="margin:0;font-size:12px;font-weight:700;color:rgba(255,255,255,0.5);letter-spacing:0.06em;text-transform:uppercase;">Naloxone Advocates Plymouth</p>
            <h1 style="margin:8px 0 0;font-size:22px;font-weight:800;color:#ffffff;">
              ⏱️ Your Volunteer Hours Summary
            </h1>
          </div>
          <div style="background:#f9fafb;border-bottom:1px solid #e5e7eb;padding:16px 32px;display:flex;align-items:center;gap:16px;">
            <div>
              <p style="margin:0;font-size:15px;font-weight:700;color:#111827;">${profile.full_name}</p>
              <p style="margin:2px 0 0;font-size:13px;color:#6b7280;">${roleLabel}</p>
            </div>
            <div style="margin-left:auto;text-align:right;">
              <p style="margin:0;font-size:11px;color:#9ca3af;">Generated</p>
              <p style="margin:2px 0 0;font-size:13px;font-weight:600;color:#374151;">${now}</p>
            </div>
          </div>
          <div style="padding:32px;">
            <p style="color:#111827;font-size:15px;font-weight:600;margin:0 0 6px;">Hi ${firstName},</p>
            <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 24px;">
              Here is a full summary of your approved volunteer hours with Naloxone Advocates Plymouth.
              Thank you for your continued dedication and hard work!
            </p>
            <div style="background:#facc15;border-radius:14px;padding:20px 24px;margin-bottom:28px;display:flex;align-items:center;justify-content:space-between;">
              <div>
                <p style="margin:0;font-size:12px;font-weight:700;color:#78350f;text-transform:uppercase;letter-spacing:0.05em;">Total Approved Hours</p>
                <p style="margin:4px 0 0;font-size:36px;font-weight:900;color:#111827;line-height:1;">${formatHours(totalHours)}<span style="font-size:18px;font-weight:700;color:#374151;margin-left:4px;">hrs</span></p>
              </div>
              <div style="font-size:48px;opacity:0.3;">⏱️</div>
            </div>
            <h2 style="font-size:15px;font-weight:800;color:#111827;margin:0 0 16px;">Monthly Breakdown</h2>
            ${emptyState}
            ${monthSections}
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;">
            <div style="text-align:center;margin-bottom:24px;">
              <a href="https://naloxoneadvocates.org/volunteers/login"
                style="display:inline-block;background:#111827;color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:50px;text-decoration:none;">
                View My Dashboard
              </a>
            </div>
            <p style="color:#9ca3af;font-size:12px;margin:0;line-height:1.6;text-align:center;">
              This summary was generated by an admin and sent to you as a record of your volunteer contributions.<br>
              Naloxone Advocates Plymouth · <a href="https://naloxoneadvocates.org" style="color:#9ca3af;">naloxoneadvocates.org</a>
            </p>
          </div>
        </div>
      </body>
      </html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Naloxone Advocates Plymouth <notifications@naloxoneadvocates.org>",
        to: [profile.email],
        subject: emailSubject,
        html,
      }),
    });

    const emailStatus = res.ok ? "sent" : "failed";
    const errorText = res.ok ? null : await res.text();

    // Log to email_logs
    await supabase.from("email_logs").insert({
      recipient_name: profile.full_name || null,
      recipient_email: profile.email,
      subject: emailSubject,
      type: "hours_summary",
      status: emailStatus,
      metadata: {
        user_id: userId,
        total_hours: totalHours,
        role: roleLabel,
        error: errorText,
      },
    });

    if (!res.ok) {
      throw new Error(`Resend error: ${errorText}`);
    }

    return new Response(
      JSON.stringify({ message: `Summary sent to ${profile.email}`, totalHours }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
