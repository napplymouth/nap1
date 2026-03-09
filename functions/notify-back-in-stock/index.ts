import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'npm:resend@2.0.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { alertId, email, productName, productId } = await req.json();

    if (!email || !productName || !productId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, productName, productId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) throw new Error('RESEND_API_KEY not configured');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const resend = new Resend(resendApiKey);
    const productUrl = `https://naloxoneadvocates.org/shop/${productId}`;
    const subject = `${productName} is Back in Stock! 🎉`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Back in Stock - ${productName}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #84cc16 0%, #22c55e 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Good News! 🎉</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 22px; font-weight: 600;">${productName} is Back in Stock!</h2>
                      <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Great news! The item you requested is now available again. We know you've been waiting, so we wanted to let you know right away.
                      </p>
                      <p style="margin: 0 0 32px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Don't miss out — stock is limited and items can sell out quickly!
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="${productUrl}" style="display: inline-block; background: linear-gradient(135deg, #84cc16 0%, #22c55e 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(132, 204, 22, 0.3);">
                              Shop Now
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 32px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <a href="${productUrl}" style="color: #84cc16; text-decoration: underline;">${productUrl}</a>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 8px 0; color: #111827; font-size: 16px; font-weight: 600;">Naloxone Advocates Plymouth</p>
                      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">Saving lives through education, advocacy, and access to naloxone</p>
                      <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px;">You received this email because you signed up for a back-in-stock alert.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    let emailStatus = 'sent';
    let emailId: string | undefined;
    let errorDetails: any = null;

    const { data, error } = await resend.emails.send({
      from: 'Naloxone Advocates Plymouth <notifications@naloxoneadvocates.org>',
      to: email,
      subject,
      html: htmlContent,
    });

    if (error) {
      emailStatus = 'failed';
      errorDetails = error;
      console.error('Resend error:', error);
    } else {
      emailId = data?.id;
    }

    // Log to email_logs
    await supabase.from('email_logs').insert({
      recipient_email: email,
      recipient_name: null,
      subject,
      type: 'back_in_stock',
      status: emailStatus,
      reference_id: alertId ? String(alertId) : null,
      metadata: { product_name: productName, product_id: productId, resend_id: emailId || null, error: errorDetails || null },
    });

    if (emailStatus === 'failed') {
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: errorDetails }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Back in stock notification sent successfully', emailId, alertId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in notify-back-in-stock function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
