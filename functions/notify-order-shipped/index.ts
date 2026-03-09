import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { order } = await req.json();

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order data required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const customerFirstName = order.customer_name?.split(' ')[0] || 'Customer';
    const orderRef = `#${String(order.id).padStart(8, '0')}`;

    const itemsHtml = order.items.map((item: any) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
          <strong>${item.name}</strong><br/>
          <span style="color: #666; font-size: 14px;">Qty: ${item.quantity}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
          £${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 30px; text-align: center;">
                    <div style="display: inline-block; background-color: #FCD34D; width: 60px; height: 60px; border-radius: 50%; margin-bottom: 20px; line-height: 60px; font-size: 28px;">
                      📦
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Your Order is On Its Way!</h1>
                    <p style="margin: 10px 0 0 0; color: #FCD34D; font-size: 16px;">Order ${orderRef}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">Hi ${customerFirstName},</p>
                    <p style="margin: 0 0 30px 0; font-size: 16px; color: #333; line-height: 1.6;">
                      Great news! Your order has been dispatched and is on its way to you. Here's a summary of what's coming:
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                      <thead>
                        <tr>
                          <th style="text-align: left; padding-bottom: 12px; border-bottom: 2px solid #1a1a1a; color: #1a1a1a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Item</th>
                          <th style="text-align: right; padding-bottom: 12px; border-bottom: 2px solid #1a1a1a; color: #1a1a1a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                        <tr>
                          <td style="padding-top: 20px; font-weight: 600; font-size: 18px; color: #1a1a1a;">Total Paid</td>
                          <td style="padding-top: 20px; text-align: right; font-weight: 600; font-size: 18px; color: #1a1a1a;">£${order.total.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div style="background-color: #f9f9f9; border-left: 4px solid #FCD34D; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                      <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Delivering To:</h3>
                      <p style="margin: 0; font-size: 16px; color: #333; line-height: 1.6;">
                        ${order.customer_name}<br/>
                        ${order.delivery_address.replace(/\n/g, '<br/>')}
                      </p>
                    </div>
                    <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
                      Your order should arrive within <strong>3-5 working days</strong>. If you have any questions, please contact us at
                      <a href="mailto:info@plymouthnaloxone.co.uk" style="color: #1a1a1a; text-decoration: underline;">info@plymouthnaloxone.co.uk</a>
                    </p>
                    <p style="margin: 0; font-size: 16px; color: #333; line-height: 1.6;">Thank you for supporting Plymouth Naloxone Project!</p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #e5e5e5;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;"><strong>Plymouth Naloxone Project</strong></p>
                    <p style="margin: 0; font-size: 14px; color: #999;">Saving lives through harm reduction and community support</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const subject = `Your Order is On Its Way! ${orderRef}`;
    let emailStatus = 'sent';
    let errorMessage = '';

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Plymouth Naloxone Project <orders@plymouthnaloxone.co.uk>',
        to: order.customer_email,
        subject,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      emailStatus = 'failed';
      errorMessage = error;
    }

    // Log to email_logs
    await supabase.from('email_logs').insert({
      recipient_email: order.customer_email,
      recipient_name: order.customer_name,
      subject,
      type: 'order_shipped',
      status: emailStatus,
      reference_id: String(order.id),
      metadata: { order_ref: orderRef, total: order.total, error: errorMessage || null },
    });

    if (emailStatus === 'failed') {
      throw new Error(`Resend API error: ${errorMessage}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Dispatch email sent' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending dispatch email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
