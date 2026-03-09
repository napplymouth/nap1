import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { professionalName, professionalEmail, professionType, employerOrganisation } = await req.json();

    if (!professionalName || !professionalEmail) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch all admin emails
    const { data: admins, error: adminError } = await supabaseAdmin
      .from('volunteer_profiles')
      .select('email, full_name')
      .eq('is_admin', true)
      .eq('approval_status', 'approved');

    if (adminError) throw adminError;

    if (!admins || admins.length === 0) {
      return new Response(JSON.stringify({ message: 'No admins found to notify' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      // Log to email_logs as fallback even without Resend
      for (const admin of admins) {
        await supabaseAdmin.from('email_logs').insert({
          recipient_email: admin.email,
          recipient_name: admin.full_name,
          subject: `New Professional Registration: ${professionalName}`,
          body: `A new healthcare professional has registered and is awaiting your approval.\n\nName: ${professionalName}\nEmail: ${professionalEmail}\nProfession: ${professionType}\nEmployer: ${employerOrganisation}\n\nPlease log in to the admin dashboard to review and approve or reject this application.`,
          status: 'pending',
          created_at: new Date().toISOString(),
        });
      }
      return new Response(JSON.stringify({ success: true, message: 'Logged to email_logs (no Resend key configured)' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const dashboardUrl = `${req.headers.get('origin') ?? 'https://your-site.com'}/admin/dashboard`;

    const results = [];
    for (const admin of admins) {
      const emailBody = {
        from: 'NAP Plymouth <noreply@naloxoneadvocates.org>',
        to: [admin.email],
        subject: `New Professional Registration Awaiting Approval — ${professionalName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px;">
            <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background: #0d9488; border-radius: 12px; padding: 12px 20px;">
                  <span style="color: white; font-size: 18px; font-weight: bold;">NAP Plymouth</span>
                </div>
              </div>

              <h2 style="color: #111827; font-size: 20px; margin-bottom: 8px;">New Professional Registration</h2>
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">
                Hi ${admin.full_name}, a new healthcare professional has registered and is awaiting your approval.
              </p>

              <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 13px; width: 140px;">Name</td>
                    <td style="padding: 6px 0; color: #111827; font-size: 13px; font-weight: 600;">${professionalName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Email</td>
                    <td style="padding: 6px 0; color: #111827; font-size: 13px;">${professionalEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Profession</td>
                    <td style="padding: 6px 0; color: #111827; font-size: 13px;">${professionType || 'Not specified'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Employer</td>
                    <td style="padding: 6px 0; color: #111827; font-size: 13px;">${employerOrganisation || 'Not specified'}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${dashboardUrl}" style="display: inline-block; background: #0d9488; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                  Review in Admin Dashboard
                </a>
              </div>

              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                This is an automated notification from NAP Plymouth. Please do not reply to this email.
              </p>
            </div>
          </div>
        `,
      };

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailBody),
      });

      const resData = await res.json();
      results.push({ admin: admin.email, status: res.ok ? 'sent' : 'failed', response: resData });

      // Log to email_logs
      await supabaseAdmin.from('email_logs').insert({
        recipient_email: admin.email,
        recipient_name: admin.full_name,
        subject: `New Professional Registration: ${professionalName}`,
        body: `New professional registration from ${professionalName} (${professionalEmail}) — ${professionType} at ${employerOrganisation}`,
        status: res.ok ? 'sent' : 'failed',
        created_at: new Date().toISOString(),
      });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
