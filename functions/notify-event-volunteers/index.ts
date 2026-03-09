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
    const { eventId, type, updatedFields } = await req.json();

    if (!eventId || !type) {
      return new Response(
        JSON.stringify({ error: "Missing eventId or type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .maybeSingle();

    if (eventError || !event) {
      return new Response(
        JSON.stringify({ error: "Event not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: registrations, error: regError } = await supabase
      .from("volunteer_events")
      .select("user_id")
      .eq("event_id", eventId);

    if (regError) throw regError;

    if (!registrations || registrations.length === 0) {
      return new Response(
        JSON.stringify({ message: "No volunteers registered, no emails sent." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userIds = registrations.map((r: any) => r.user_id);

    const { data: profiles, error: profileError } = await supabase
      .from("volunteer_profiles")
      .select("email, full_name")
      .in("user_id", userIds);

    if (profileError) throw profileError;

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No volunteer profiles found." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY is not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formatDate = (dateStr: string) => {
      return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      });
    };

    const isCancelled = type === "cancelled";
    const subjectLine = isCancelled
      ? `Event Cancelled: ${event.name}`
      : `Event Updated: ${event.name}`;

    const buildEmailHtml = (name: string) => {
      const greeting = `Hi ${name || "Volunteer"},`;
      const bodyText = isCancelled
        ? `<p style="color:#374151;font-size:15px;line-height:1.6;">We're sorry to inform you that the following event you registered for has been <strong>cancelled</strong>:</p>`
        : `<p style="color:#374151;font-size:15px;line-height:1.6;">We wanted to let you know that the following event you registered for has been <strong>updated</strong>. Please review the latest details below:</p>`;

      const changesSection = !isCancelled && updatedFields && updatedFields.length > 0
        ? `<div style="background:#fef9c3;border-left:4px solid #eab308;padding:12px 16px;border-radius:6px;margin:16px 0;">
            <p style="margin:0 0 6px;font-weight:700;color:#713f12;font-size:13px;">WHAT CHANGED</p>
            <ul style="margin:0;padding-left:18px;color:#713f12;font-size:13px;">
              ${updatedFields.map((f: string) => `<li>${f}</li>`).join("")}
            </ul>
          </div>`
        : "";

      const eventCard = `
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:20px 0;">
          <h2 style="margin:0 0 12px;font-size:18px;color:#111827;">${event.name}</h2>
          ${event.description ? `<p style="margin:0 0 12px;color:#6b7280;font-size:14px;">${event.description}</p>` : ""}
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;width:90px;">📅 Date</td>
              <td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600;">${formatDate(event.date)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;">🕐 Time</td>
              <td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600;">${event.time}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;">📍 Location</td>
              <td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600;">${event.location}</td>
            </tr>
          </table>
        </div>`;

      const footer = isCancelled
        ? `<p style="color:#6b7280;font-size:13px;">If you have any questions, please don't hesitate to get in touch with us.</p>`
        : `<p style="color:#6b7280;font-size:13px;">Your registration is still active. If you can no longer attend, please log in to your volunteer portal to cancel your registration.</p>`;

      return `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f3f4f6;margin:0;padding:0;">
          <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <div style="background:${isCancelled ? "#ef4444" : "#a3e635"};padding:28px 32px;">
              <p style="margin:0;font-size:13px;font-weight:700;color:${isCancelled ? "rgba(255,255,255,0.8)" : "#365314"};letter-spacing:0.05em;text-transform:uppercase;">Naloxone Advocates Plymouth</p>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:800;color:${isCancelled ? "#ffffff" : "#1a2e05"};">
                ${isCancelled ? "⚠️ Event Cancelled" : "📢 Event Updated"}
              </h1>
            </div>
            <div style="padding:32px;">
              <p style="color:#111827;font-size:15px;font-weight:600;margin:0 0 12px;">${greeting}</p>
              ${bodyText}
              ${changesSection}
              ${eventCard}
              ${footer}
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">This email was sent because you are registered as a volunteer with Naloxone Advocates Plymouth.</p>
            </div>
          </div>
        </body>
        </html>`;
    };

    const results = await Promise.allSettled(
      profiles.map(async (profile: any) => {
        const html = buildEmailHtml(profile.full_name);
        let emailStatus = "sent";
        let errorMsg = "";

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Naloxone Advocates Plymouth <notifications@naloxoneadvocates.org>",
            to: [profile.email],
            subject: subjectLine,
            html,
          }),
        });

        if (!res.ok) {
          const err = await res.text();
          emailStatus = "failed";
          errorMsg = err;
        }

        // Log each email individually
        await supabase.from("email_logs").insert({
          recipient_email: profile.email,
          recipient_name: profile.full_name || null,
          subject: subjectLine,
          type: "event_notify",
          status: emailStatus,
          reference_id: String(eventId),
          metadata: {
            event_name: event.name,
            event_date: event.date,
            notify_type: type,
            error: errorMsg || null,
          },
        });

        if (emailStatus === "failed") {
          throw new Error(`Failed to send to ${profile.email}: ${errorMsg}`);
        }

        return profile.email;
      })
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return new Response(
      JSON.stringify({ message: `Emails sent: ${sent}, failed: ${failed}` }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
