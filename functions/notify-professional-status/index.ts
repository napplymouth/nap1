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

    const { professionalName, professionalEmail, professionType, employerOrganisation, status } = await req.json();

    if (!professionalName || !professionalEmail || !status) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isApproved = status === 'approved';
    const subject = isApproved
      ? 'Your Professional Account Has Been Approved — NAP Plymouth'
      : 'Update on Your Professional Account Application — NAP Plymouth';

    const loginUrl = `${req.headers.get('origin') ?? 'https://your-site.com'}/professionals/login`;

    const htmlBody = isApproved
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px;">
          <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; background: #0d9488; border-radius: 12px; padding: 12px 20px;">
                <span style="color: white; font-size: 18px; font-weight: bold;">NAP Plymouth</span>
              </div>
            </div>

            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: #d1fae5; border-radius: 50%; margin-bottom: 12px;">
                <span style="font-size: 32px;">✅</span>
              </div>
              <h2 style="color: #065f46; font-size: 22px; margin: 0;">Application Approved!</h2>
            </div>

            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
              Hi <strong>${professionalName}</strong>,
            </p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
              Great news — your application to join the NAP Plymouth Professionals Portal has been <strong style="color: #059669;">approved</strong>. You now have full access to professional resources, naloxone training materials, and the professionals dashboard.
            </p>

            <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <p style="color: #0f766e; font-size: 13px; font-weight: 600; margin: 0 0 8px 0;">Your Account Details</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 5px 0; color: #6b7280; font-size: 13px; width: 140px;">Name</td>
                  <td style="padding: 5px 0; color: #111827; font-size: 13px; font-weight: 600;">${professionalName}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6b7280; font-size: 13px;">Email</td>
                  <td style="padding: 5px 0; color: #111827; font-size: 13px;">${professionalEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6b7280; font-size: 13px;">Profession</td>
                  <td style="padding: 5px 0; color: #111827; font-size: 13px;">${professionType || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6b7280; font-size: 13px;">Organisation</td>
                  <td style="padding: 5px 0; color: #111827; font-size: 13px;">${employerOrganisation || 'Not specified'}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${loginUrl}" style="display: inline-block; background: #0d9488; color: white; text-decoration: none; padding: 13px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                Sign In to Your Dashboard
              </a>
            </div>

            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              This is an automated notification from NAP Plymouth. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px;">
          <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; background: #0d9488; border-radius: 12px; padding: 12px 20px;">
                <span style="color: white; font-size: 18px; font-weight: bold;">NAP Plymouth</span>
              </div>
            </div>

            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: #fee2e2; border-radius: 50%; margin-bottom: 12px;">
                <span style="font-size: 32px;">❌</span>
              </div>
              <h2 style="color: #991b1b; font-size: 22px; margin: 0;">Application Not Approved</h2>
            </div>

            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
              Hi <strong>${professionalName}</strong>,
            </p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
              Thank you for applying to the NAP Plymouth Professionals Portal. After reviewing your application, we are unfortunately unable to approve your account at this time.
            </p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
              If you believe this is an error or would like more information, please contact us directly at <a href="mailto:info@naloxoneadvocates.org" style="color: #0d9488;">info@naloxoneadvocates.org</a> and we will be happy to assist you.
            </p>

            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #7f1d1d; font-size: 13px; margin: 0;">
                <strong>Note:</strong> You may re-apply at any time if your circumstances change or if you have additional information to provide.
              </p>
            </div>

            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              This is an automated notification from NAP Plymouth. Please do not reply to this email.
            </p>
          </div>
        </div>
      `;

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    if (!RESEND_API_KEY) {
      // Log to email_logs as fallback
      await supabaseAdmin.from('email_logs').insert({
        recipient_email: professionalEmail,
        recipient_name: professionalName,
        subject,
        body: isApproved
          ? `Your professional account has been approved. You can now sign in at ${loginUrl}`
          : `Your professional account application was not approved. Contact info@naloxoneadvocates.org for more information.`,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      return new Response(JSON.stringify({ success: true, message: 'Logged to email_logs (no Resend key configured)' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'NAP Plymouth <noreply@naloxoneadvocates.org>',
        to: [professionalEmail],
        subject,
        html: htmlBody,
      }),
    });

    const resData = await res.json();

    // Log to email_logs
    await supabaseAdmin.from('email_logs').insert({
      recipient_email: professionalEmail,
      recipient_name: professionalName,
      subject,
      body: isApproved
        ? `Professional account approved for ${professionalName} (${professionalEmail})`
        : `Professional account rejected for ${professionalName} (${professionalEmail})`,
      status: res.ok ? 'sent' : 'failed',
      created_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ success: true, status: res.ok ? 'sent' : 'failed', response: resData }), {
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
