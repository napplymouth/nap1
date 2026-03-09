import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const PAYPAL_API_BASE = Deno.env.get("PAYPAL_MODE") === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET");
const ADMIN_EMAIL = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") || "kelly.anne1@nhs.net";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getPayPalAccessToken() {
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!response.ok) throw new Error("Failed to get PayPal access token");
  const data = await response.json();
  return data.access_token;
}

async function sendAdminNotificationEmail(order: any, items: any[]) {
  if (!RESEND_API_KEY) {
    console.log("RESEND_API_KEY not set — skipping admin email notification.");
    return;
  }

  const itemsHtml = items
    .map(
      (item: any) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${item.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">£${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const total = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#facc15;padding:24px 32px;">
        <h1 style="margin:0;font-size:22px;color:#111827;">🛒 New Order Received</h1>
        <p style="margin:6px 0 0;color:#374151;font-size:14px;">Order ID: <strong>#${order.id.slice(0,8).toUpperCase()}</strong></p>
      </div>
      <div style="padding:24px 32px;">
        <h2 style="font-size:16px;color:#374151;margin-bottom:8px;">Customer Details</h2>
        <p style="margin:4px 0;font-size:14px;color:#4b5563;"><strong>Name:</strong> ${order.customer_name}</p>
        <p style="margin:4px 0;font-size:14px;color:#4b5563;"><strong>Email:</strong> ${order.email}</p>
        <p style="margin:4px 0;font-size:14px;color:#4b5563;"><strong>Phone:</strong> ${order.address?.phone || "N/A"}</p>
        <p style="margin:4px 0;font-size:14px;color:#4b5563;"><strong>Address:</strong> ${order.address?.line1 || ""}${order.address?.line2 ? ", " + order.address.line2 : ""}, ${order.address?.city || ""}, ${order.address?.county || ""}, ${order.address?.postcode || ""}</p>

        <h2 style="font-size:16px;color:#374151;margin:24px 0 8px;">Order Items</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:8px 12px;text-align:left;color:#6b7280;font-weight:600;">Product</th>
              <th style="padding:8px 12px;text-align:center;color:#6b7280;font-weight:600;">Qty</th>
              <th style="padding:8px 12px;text-align:right;color:#6b7280;font-weight:600;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="margin-top:16px;padding:12px 16px;background:#f9fafb;border-radius:8px;display:flex;justify-content:space-between;">
          <span style="font-size:15px;font-weight:700;color:#111827;">Total Paid</span>
          <span style="font-size:15px;font-weight:700;color:#16a34a;">£${total.toFixed(2)}</span>
        </div>

        <div style="margin-top:24px;text-align:center;">
          <a href="https://plymouthnaloxone.co.uk/admin/dashboard" style="display:inline-block;padding:12px 28px;background:#111827;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">View in Admin Dashboard</a>
        </div>
      </div>
      <div style="padding:16px 32px;background:#f9fafb;text-align:center;font-size:12px;color:#9ca3af;">
        Plymouth Naloxone Training · Automated order notification
      </div>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Plymouth Naloxone Orders <orders@plymouthnaloxone.co.uk>",
        to: [ADMIN_EMAIL],
        subject: `New Order #${order.id.slice(0,8).toUpperCase()} — £${total.toFixed(2)} from ${order.customer_name}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend admin email error:", err);
    } else {
      console.log("Admin notification email sent to", ADMIN_EMAIL);
    }
  } catch (e) {
    console.error("Failed to send admin notification email:", e);
  }
}

async function sendCustomerReceiptEmail(order: any, items: any[]) {
  if (!RESEND_API_KEY) {
    console.log("RESEND_API_KEY not set — skipping customer receipt email.");
    return;
  }

  if (!order.email) {
    console.log("No customer email — skipping customer receipt.");
    return;
  }

  const total = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
  const orderRef = order.id.slice(0, 8).toUpperCase();

  const itemsHtml = items
    .map(
      (item: any) =>
        `<tr>
          <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;">${item.name}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;text-align:center;font-size:14px;color:#374151;">${item.quantity}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;text-align:right;font-size:14px;color:#374151;">£${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const addressLine = [
    order.address?.line1,
    order.address?.line2,
    order.address?.city,
    order.address?.county,
    order.address?.postcode,
  ]
    .filter(Boolean)
    .join(", ");

  const html = `
    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      
      <!-- Header -->
      <div style="background:#111827;padding:32px;text-align:center;">
        <h1 style="margin:0;font-size:24px;color:#facc15;letter-spacing:-0.5px;">Plymouth Naloxone Training</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#9ca3af;">Order Confirmation</p>
      </div>

      <!-- Thank you banner -->
      <div style="background:#f0fdf4;padding:24px 32px;border-bottom:1px solid #dcfce7;text-align:center;">
        <p style="margin:0;font-size:18px;font-weight:700;color:#15803d;">✅ Thank you for your order, ${order.customer_name.split(" ")[0]}!</p>
        <p style="margin:8px 0 0;font-size:14px;color:#4b5563;">Your payment was successful. We'll be in touch shortly with dispatch details.</p>
      </div>

      <div style="padding:28px 32px;">

        <!-- Order reference -->
        <div style="background:#f9fafb;border-radius:8px;padding:14px 18px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Order Reference</span>
          <span style="font-size:15px;font-weight:700;color:#111827;">#${orderRef}</span>
        </div>

        <!-- Items table -->
        <h2 style="font-size:15px;font-weight:700;color:#111827;margin:0 0 12px;">Items Ordered</h2>
        <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #f3f4f6;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:10px 16px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Item</th>
              <th style="padding:10px 16px;text-align:center;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Qty</th>
              <th style="padding:10px 16px;text-align:right;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <!-- Total -->
        <div style="margin-top:12px;padding:14px 16px;background:#111827;border-radius:8px;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:15px;font-weight:700;color:#ffffff;">Total Paid</span>
          <span style="font-size:18px;font-weight:800;color:#facc15;">£${total.toFixed(2)}</span>
        </div>

        <!-- Delivery address -->
        ${addressLine ? `
        <div style="margin-top:24px;">
          <h2 style="font-size:15px;font-weight:700;color:#111827;margin:0 0 10px;">Delivery Address</h2>
          <div style="background:#f9fafb;border-radius:8px;padding:14px 18px;">
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${order.customer_name}<br/>${addressLine}</p>
            ${order.address?.phone ? `<p style="margin:8px 0 0;font-size:13px;color:#6b7280;">📞 ${order.address.phone}</p>` : ""}
          </div>
        </div>
        ` : ""}

        <!-- What happens next -->
        <div style="margin-top:28px;padding:18px 20px;background:#fffbeb;border-left:4px solid #facc15;border-radius:0 8px 8px 0;">
          <h3 style="margin:0 0 8px;font-size:14px;font-weight:700;color:#92400e;">What happens next?</h3>
          <ul style="margin:0;padding-left:18px;font-size:13px;color:#78350f;line-height:1.8;">
            <li>Our team will review and process your order</li>
            <li>You'll receive a dispatch notification once your items are on their way</li>
            <li>If you have any questions, reply to this email or contact us at <a href="mailto:info@plymouthnaloxone.co.uk" style="color:#92400e;">info@plymouthnaloxone.co.uk</a></li>
          </ul>
        </div>

      </div>

      <!-- Footer -->
      <div style="padding:20px 32px;background:#f9fafb;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:13px;color:#374151;font-weight:600;">Plymouth Naloxone Training</p>
        <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">This is an automated receipt — please keep it for your records.</p>
        <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">
          <a href="https://plymouthnaloxone.co.uk" style="color:#6b7280;text-decoration:none;">plymouthnaloxone.co.uk</a>
        </p>
      </div>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Plymouth Naloxone Training <orders@plymouthnaloxone.co.uk>",
        to: [order.email],
        subject: `Your Order Receipt #${orderRef} — Plymouth Naloxone Training`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend customer receipt error:", err);
    } else {
      console.log("Customer receipt email sent to", order.email);
    }
  } catch (e) {
    console.error("Failed to send customer receipt email:", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderID, customer, items } = await req.json();

    if (!orderID) {
      return new Response(
        JSON.stringify({ error: "Missing orderID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("PayPal Capture Error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to capture PayPal order", details: errorData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const captureData = await response.json();

    if (captureData.status !== "COMPLETED") {
      return new Response(
        JSON.stringify({ error: "Payment not completed", status: captureData.status }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    const { data: order, error: dbError } = await supabase
      .from("orders")
      .insert({
        customer_name: customer.name,
        email: customer.email,
        address: {
          line1: customer.address || "",
          line2: customer.addressLine2 || "",
          city: customer.city || "",
          county: customer.county || "",
          postcode: customer.postcode || "",
          phone: customer.phone || "",
        },
        items: items,
        total: total,
        status: "paid",
        payment_method: "paypal",
        payment_reference: orderID,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database Error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save order", details: dbError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send both emails in parallel (non-blocking)
    await Promise.all([
      sendAdminNotificationEmail(order, items),
      sendCustomerReceiptEmail(order, items),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        orderID: orderID,
        captureID: captureData.purchase_units[0].payments.captures[0].id,
        order: order,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
