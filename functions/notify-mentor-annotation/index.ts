import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { 
      goalId, 
      goalTitle, 
      goalCategory, 
      memberName, 
      memberEmail, 
      mentorNote, 
      isUpdate 
    } = await req.json();

    // Validate required fields
    if (!goalId || !goalTitle || !mentorNote) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: goalId, goalTitle, mentorNote' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let finalMemberEmail = memberEmail;
    let finalMemberName = memberName;

    // Fallback: look up member email if not provided
    if (!finalMemberEmail) {
      const { data: goalData } = await supabase
        .from('peer_support_goals')
        .select('user_id')
        .eq('id', goalId)
        .maybeSingle();

      if (goalData?.user_id) {
        const { data: memberData } = await supabase
          .from('member_profiles')
          .select('email, full_name')
          .eq('user_id', goalData.user_id)
          .maybeSingle();

        if (memberData) {
          finalMemberEmail = memberData.email;
          finalMemberName = memberData.full_name || 'Member';
        }
      }
    }

    if (!finalMemberEmail) {
      return new Response(
        JSON.stringify({ error: 'Could not determine member email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const subject = isUpdate 
      ? 'Your mentor updated their note on your goal — NAP Plymouth'
      : 'Your mentor has added a note to your goal — NAP Plymouth';

    const actionText = isUpdate ? 'updated their note' : 'added a note';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                      NAP Plymouth
                    </h1>
                    <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.95;">
                      Peer Support Progress
                    </p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 24px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                      Hi <strong>${finalMemberName || 'there'}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                      Your mentor has ${actionText} on one of your goals:
                    </p>

                    <!-- Goal Info -->
                    <div style="background-color: #f9fafb; border-left: 4px solid #14b8a6; padding: 20px; margin: 0 0 24px 0; border-radius: 6px;">
                      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                        ${goalCategory || 'Goal'}
                      </p>
                      <p style="margin: 0; color: #111827; font-size: 17px; font-weight: 600; line-height: 1.4;">
                        ${goalTitle}
                      </p>
                    </div>

                    <!-- Mentor Note -->
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; padding: 20px; margin: 0 0 32px 0; border-radius: 8px;">
                      <p style="margin: 0 0 12px 0; color: #92400e; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">
                        📝 Mentor Note
                      </p>
                      <p style="margin: 0; color: #78350f; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">
${mentorNote}
                      </p>
                    </div>

                    <p style="margin: 0 0 28px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                      You can view all your goals and progress in your member dashboard.
                    </p>

                    <!-- CTA Button -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="center">
                          <a href="https://readdy.ai/members/dashboard" style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 2px 4px rgba(20, 184, 166, 0.3);">
                            View My Progress
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                      NAP Plymouth — Peer Support Services
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                      This is an automated notification. Please do not reply to this email.
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

    let emailStatus = 'pending';
    let emailError = null;

    // Send email if Resend API key is configured
    if (RESEND_API_KEY) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'NAP Plymouth <notifications@napplymouth.org>',
            to: [finalMemberEmail],
            subject: subject,
            html: htmlContent,
          }),
        });

        if (resendResponse.ok) {
          emailStatus = 'sent';
        } else {
          const errorData = await resendResponse.json();
          emailStatus = 'failed';
          emailError = JSON.stringify(errorData);
        }
      } catch (error) {
        emailStatus = 'failed';
        emailError = error.message;
      }
    }

    // Log to email_logs
    await supabase.from('email_logs').insert({
      recipient_email: finalMemberEmail,
      subject: subject,
      status: emailStatus,
      error_message: emailError,
      sent_at: emailStatus === 'sent' ? new Date().toISOString() : null,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: emailStatus,
        message: emailStatus === 'sent' 
          ? 'Notification sent successfully' 
          : emailStatus === 'pending'
          ? 'Notification logged (Resend not configured)'
          : 'Notification failed to send'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in notify-mentor-annotation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});