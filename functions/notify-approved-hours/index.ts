import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'https://esm.sh/resend@3.2.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const { entryId } = await req.json();

    if (!entryId) {
      return new Response(
        JSON.stringify({ error: 'entryId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the hours entry with volunteer profile
    const { data: entry, error: fetchError } = await supabase
      .from('volunteer_hours')
      .select(`
        *,
        volunteer_profiles!inner(full_name, email)
      `)
      .eq('id', entryId)
      .maybeSingle();

    if (fetchError || !entry) {
      return new Response(
        JSON.stringify({ error: 'Hours entry not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const volunteerName = entry.volunteer_profiles.full_name;
    const volunteerEmail = entry.volunteer_profiles.email;

    if (!volunteerEmail) {
      return new Response(
        JSON.stringify({ error: 'Volunteer email not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format date
    const activityDate = new Date(entry.activity_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Build email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Hours Approved</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px 8px 0 0;">
                      <div style="width: 64px; height: 64px; background-color: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 32px;">✅</span>
                      </div>
                      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">Hours Approved!</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #374151;">
                        Hi <strong>${volunteerName}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #374151;">
                        Great news! Your volunteer hours have been approved by an admin.
                      </p>
                      
                      <!-- Hours Details Card -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 24px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #6b7280; font-weight: 500;">Activity:</td>
                                <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right;">${entry.activity_type}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #6b7280; font-weight: 500;">Date:</td>
                                <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right;">${activityDate}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #6b7280; font-weight: 500;">Hours Approved:</td>
                                <td style="padding: 8px 0; font-size: 18px; color: #10b981; font-weight: 700; text-align: right;">${entry.hours} hours</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 32px; font-size: 16px; line-height: 24px; color: #374151;">
                        Your contribution has been recorded and will count toward your total volunteer hours. Thank you for your dedication!
                      </p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td align="center">
                            <a href="${supabaseUrl.replace('https://', 'https://').split('.supabase.co')[0]}.supabase.co/volunteers/login" 
                               style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                              View My Dashboard
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                      <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 20px;">
                        Keep up the great work! Your volunteer efforts make a real difference.
                      </p>
                    </td>
                  </tr>
                </table>
                
                <!-- Email Footer -->
                <table role="presentation" style="width: 600px; max-width: 100%; margin-top: 20px;">
                  <tr>
                    <td style="text-align: center; padding: 20px;">
                      <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 18px;">
                        This is an automated notification from your volunteer management system.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    // Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Volunteer Portal <noreply@updates.readdy.ai>',
      to: volunteerEmail,
      subject: '✅ Your Volunteer Hours Have Been Approved',
      html: emailHtml,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: emailError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log email to database
    await supabase.from('email_logs').insert({
      recipient_email: volunteerEmail,
      recipient_name: volunteerName,
      email_type: 'hours_approved',
      subject: '✅ Your Volunteer Hours Have Been Approved',
      status: 'sent',
      metadata: {
        entry_id: entryId,
        activity_type: entry.activity_type,
        hours: entry.hours,
        activity_date: entry.activity_date,
        resend_id: emailData?.id
      }
    });

    return new Response(
      JSON.stringify({ success: true, emailId: emailData?.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});