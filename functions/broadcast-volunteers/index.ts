import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AUDIENCE_CONFIG: Record<string, { table: "member_profiles" | "volunteer_profiles"; roleField: string | null; roleValue: string | null }> = {
  all_members:     { table: "member_profiles",    roleField: null,          roleValue: null },
  peer_trainers:   { table: "member_profiles",    roleField: "member_role", roleValue: "Peer Trainer" },
  kit_carriers:    { table: "member_profiles",    roleField: "member_role", roleValue: "Kit Carrier" },
  first_responders:{ table: "member_profiles",    roleField: "member_role", roleValue: "First Responder" },
  coordinators:    { table: "member_profiles",    roleField: "member_role", roleValue: "Coordinator" },
  all_volunteers:  { table: "volunteer_profiles", roleField: null,          roleValue: null },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { subject, body, previewOnly, targetAudience = "all_members" } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const config = AUDIENCE_CONFIG[targetAudience] ?? AUDIENCE_CONFIG["all_members"];

    let query = supabase
      .from(config.table)
      .select("email, full_name")
      .eq("approval_status", "approved");

    if (config.roleField && config.roleValue) {
      query = query.eq(config.roleField, config.roleValue);
    }

    const { data: profiles, error: profileError } = await query;

    if (profileError) throw profileError;

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No matching recipients found.", recipientCount: 0, sent: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (previewOnly) {
      return new Response(
        JSON.stringify({ recipientCount: profiles.length }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!subject || !body) {
      return new Response(
        JSON.stringify({ error: "Missing subject or body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY is not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const buildEmailHtml = (name: string, messageBody: string) => {
      const firstName = name ? name.split(" ")[0] : "Member";
      const formattedBody = messageBody
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");

      return `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f3f4f6;margin:0;padding:0;">
          <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <div style="background:#a3e635;padding:28px 32px;">
              <p style="margin:0;font-size:13px;font-weight:700;color:#365314;letter-spacing:0.05em;text-transform:uppercase;">Naloxone Advocates Plymouth</p>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:800;color:#1a2e05;">
                📢 Message from the Team
              </h1>
            </div>
            <div style="padding:32px;">
              <p style="color:#111827;font-size:15px;font-weight:600;margin:0 0 20px;">Hi ${firstName},</p>
              <div style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
                ${formattedBody}
              </div>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                This message was sent to you because you are a registered member with Naloxone Advocates Plymouth.
                If you believe this was sent in error, please contact us.
              </p>
            </div>
          </div>
        </body>
        </html>`;
    };

    const results = await Promise.allSettled(
      profiles.map(async (profile: any) => {
        const html = buildEmailHtml(profile.full_name, body);
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Naloxone Advocates Plymouth <notifications@naloxoneadvocates.org>",
            to: [profile.email],
            subject: subject,
            html,
          }),
        });

        const emailStatus = res.ok ? "sent" : "failed";
        const errorText = res.ok ? null : await res.text();

        // Log each email to email_logs
        await supabase.from("email_logs").insert({
          recipient_name: profile.full_name || null,
          recipient_email: profile.email,
          subject: subject,
          type: "broadcast",
          status: emailStatus,
          metadata: {
            target_audience: targetAudience,
            error: errorText,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to send to ${profile.email}: ${errorText}`);
        }

        return profile.email;
      })
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return new Response(
      JSON.stringify({ message: `Emails sent: ${sent}, failed: ${failed}`, sent, failed, recipientCount: profiles.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
