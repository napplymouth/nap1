import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const STATUS_META: Record<string, { label: string; emoji: string; color: string; message: string }> = {
  approved: {
    label: 'Approved',
    emoji: '✅',
    color: '#84cc16',
    message: 'Great news — your naloxone kit request has been <strong>approved</strong>. We\'ll be preparing your kit for dispatch shortly.',
  },
  dispatched: {
    label: 'Dispatched',
    emoji: '🚚',
    color: '#0ea5e9',
    message: 'Your naloxone kit is on its way! It has been <strong>dispatched</strong> and should reach you within a few working days.',
  },
  collected: {
    label: 'Collected',
    emoji: '🎉',
    color: '#22c55e',
    message: 'Your naloxone kit has been marked as <strong>collected</strong>. Thank you — you\'re now equipped to help save a life.',
  },
  declined: {
    label: 'Declined',
    emoji: '❌',
    color: '#ef4444',
    message: 'Unfortunately, your naloxone kit request has been <strong>declined</strong>. Please see the note below for more details, or contact us if you have questions.',
  },
  pending: {
    label: 'Under Review',
    emoji: '🕐',
    color: '#f59e0b',
    message: 'Your naloxone kit request is currently <strong>under review</strong>. We\'ll notify you as soon as there\'s an update.',
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { memberName, memberEmail, status, adminNote, requestId } = await req.json();

    if (!memberEmail || !status) {
      return new Response(JSON.stringify({ error: 'memberEmail and status are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const meta = STATUS_META[status] || {
      label: status,
      emoji: '📋',
      color: '#6b7280',
      message: `Your naloxone kit request status has been updated to <strong>${status}</strong>.`,
    };

    const firstName = memberName?.split(' ')[0] || 'there';
    const refId = requestId ? `#${String(requestId).slice(0, 8).toUpperCase()}` : '';
    const subject = `Naloxone Kit Update: ${meta.label} ${refId}`.trim();

    const noteSection = adminNote
      ? `
        <div style="background-color: #f9fafb; border-left: 4px solid ${meta.color}; padding: 18px 20px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Note from our team</p>
          <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.6;">${adminNote}</p>
        </div>
      `
      : '';

    const stepsHtml = ['Requested', 'Approved', 'Dispatched', 'Collected'].map((step, idx) => {
      const stepStatuses = ['pending', 'approved', 'dispatched', 'collected'];
      const currentIdx = stepStatuses.indexOf(status);
      const isDeclined = status === 'declined';
      const done = !isDeclined && currentIdx >= idx;
      const active = !isDeclined && currentIdx === idx;

      const bgColor = done ? meta.color : '#e5e7eb';
      const textColor = done ? '#ffffff' : '#9ca3af';
      const labelColor = done ? '#374151' : '#9ca3af';

      return `
        <td align="center" style="padding: 0 4px;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background-color: ${bgColor}; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: ${textColor}; ${active ? `box-shadow: 0 0 0 4px ${meta.color}33;` : ''}">
            ${done && !active ? '✓' : idx + 1}
          </div>
          <div style="font-size: 11px; font-weight: 600; color: ${labelColor}; margin-top: 6px; white-space: nowrap;">${step}</div>
        </td>
        ${idx < 3 ? `<td style="padding-bottom: 18px;"><div style="height: 3px; width: 32px; background-color: ${!isDeclined && currentIdx > idx ? meta.color : '#e5e7eb'}; border-radius: 2px;"></div></td>` : ''}
      `;
    }).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 32px; text-align: center;">
                    <div style="display: inline-block; background-color: ${meta.color}; width: 64px; height: 64px; border-radius: 50%; margin-bottom: 18px; line-height: 64px; font-size: 30px; text-align: center;">
                      ${meta.emoji}
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; line-height: 1.3;">Kit Request ${meta.label}</h1>
                    ${refId ? `<p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 13px; font-family: monospace;">Request ${refId}</p>` : ''}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 36px 32px 0 32px;">
                    <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151; line-height: 1.6;">Hi ${firstName},</p>
                    <p style="margin: 0 0 24px 0; font-size: 16px; color: #374151; line-height: 1.6;">${meta.message}</p>
                    ${noteSection}
                    <div style="background-color: #f9fafb; border-radius: 10px; padding: 24px; margin-bottom: 28px;">
                      <p style="margin: 0 0 18px 0; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Your Kit Journey</p>
                      <table cellpadding="0" cellspacing="0" style="width: 100%;">
                        <tr style="vertical-align: top;">
                          ${stepsHtml}
                        </tr>
                      </table>
                    </div>
                    <p style="margin: 0 0 8px 0; font-size: 15px; color: #374151; line-height: 1.6;">
                      If you have any questions, please contact us at
                      <a href="mailto:info@plymouthnaloxone.co.uk" style="color: #1a1a1a; font-weight: 600; text-decoration: underline;">info@plymouthnaloxone.co.uk</a>
                    </p>
                    <p style="margin: 0 0 32px 0; font-size: 15px; color: #374151; line-height: 1.6;">
                      Thank you for being part of the Plymouth Naloxone Project community.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #374151;">Plymouth Naloxone Project</p>
                    <p style="margin: 0; font-size: 13px; color: #9ca3af;">Saving lives through harm reduction and community support</p>
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
    let errorMessage = null;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Plymouth Naloxone Project <info@plymouthnaloxone.co.uk>',
        to: memberEmail,
        subject,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errText = await emailResponse.text();
      emailStatus = 'failed';
      errorMessage = errText;
    }

    // Log the email to the email_logs table
    await supabase.from('email_logs').insert({
      recipient_email: memberEmail,
      recipient_name: memberName || null,
      subject,
      email_type: 'kit_status',
      status: emailStatus,
      related_id: requestId || null,
      related_type: 'naloxone_kit_request',
      admin_note: adminNote || null,
      metadata: { kit_status: status, status_label: meta.label },
    });

    if (emailStatus === 'failed') {
      throw new Error(`Resend API error: ${errorMessage}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: `Kit status email sent (${status})` }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );

  } catch (error) {
    console.error('Error sending kit status email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
