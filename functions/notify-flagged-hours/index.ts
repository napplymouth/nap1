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
    const { entryId, flagReason } = await req.json();

    if (!entryId) {
      return new Response(
        JSON.stringify({ error: "Missing entryId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the hours entry with volunteer profile
    const { data: entry, error: entryError } = await supabase
      .from("volunteer_hours")
      .select(`
        id,
        date,
        activity,
        hours,
        notes,
        flag_reason,
        volunteer_profiles (
          full_name,
          email
        )
      `)
      .eq("id", entryId)
      .maybeSingle();

    if (entryError || !entry) {
      return new Response(
        JSON.stringify({ error: "Hours entry not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const profile = (entry as any).volunteer_profiles;
    if (!profile?.email) {
      return new Response(
        JSON.stringify({ error: "Volunteer email not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY is not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const firstName = profile.full_name ? profile.full_name.split(" ")[0] : "Volunteer";

    const formatDate = (dateStr: string) =>
      new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    const reasonBlock = flagReason?.trim()
      ? `<div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;padding:14px 18px;margin:20px 0;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:0.05em;">Reason from admin</p>
          <p style="margin:0;font-size:14px;color:#7f1d1d;line-height:1.6;">${flagReason.trim().replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br>")}</p>
        </div>`
      : `<div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;padding:14px 18px;margin:20px 0;">
          <p style="margin:0;font-size:14px;color:#7f1d1d;line-height:1.6;">No specific reason was provided. Please log in to your volunteer portal and contact the team for more details.</p>
        </div>`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f3f4f6;margin:0;padding:0;">
        <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <div style="background:#ef4444;padding:28px 32px;">
            <p style="margin:0;font-size:12px;font-weight:700;color:rgba(255,255,255,0.75);letter-spacing:0.06em;text-transform:uppercase;">Naloxone Advocates Plymouth</p>
            <h1 style="margin:8px 0 0;font-size:22px;font-weight:800;color:#ffffff;">
              🚩 Hours Entry Flagged
            </h1>
          </div>

          <!-- Body -->
          <div style="padding:32px;">
            <p style="color:#111827;font-size:15px;font-weight:600;margin:0 0 8px;">Hi ${firstName},</p>
            <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 4px;">
              One of your recent volunteer hours entries has been <strong style="color:#dc2626;">flagged for review</strong> by an admin.
              Flagged entries do not count toward your approved hours total until the issue is resolved.
            </p>

            <!-- Entry card -->
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:20px 0;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Flagged Entry</p>
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:5px 0;color:#6b7280;font-size:13px;width:80px;">📋 Activity</td>
                  <td style="padding:5px 0;color:#111827;font-size:13px;font-weight:600;">${(entry as any).activity}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;color:#6b7280;font-size:13px;">📅 Date</td>
                  <td style="padding:5px 0;color:#111827;font-size:13px;font-weight:600;">${formatDate((entry as any).date)}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;color:#6b7280;font-size:13px;">🕐 Hours</td>
                  <td style="padding:5px 0;color:#111827;font-size:13px;font-weight:600;">${Number((entry as any).hours) % 1 === 0 ? Number((entry as any).hours) : Number((entry as any).hours).toFixed(1)} hrs</td>
                </tr>
              </table>
            </div>

            ${reasonBlock}

            <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 20px;">
              Please log in to your volunteer dashboard to view the full details. If you believe this was flagged in error, reach out to the team directly.
            </p>

            <!-- CTA -->
            <div style="text-align:center;margin:24px 0;">
              <a href="https://naloxoneadvocates.org/volunteers/login"
                style="display:inline-block;background:#111827;color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:50px;text-decoration:none;">
                View My Dashboard
              </a>
            </div>

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
            <p style="color:#9ca3af;font-size:12px;margin:0;line-height:1.6;">
              This notification was sent because you are a registered volunteer with Naloxone Advocates Plymouth.
              If you believe this was sent in error, please contact us.
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
        subject: `🚩 Your hours entry has been flagged — ${(entry as any).activity}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend error: ${err}`);
    }

    return new Response(
      JSON.stringify({ message: `Notification sent to ${profile.email}` }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
