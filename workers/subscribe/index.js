export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Only accept POST
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const contentType = request.headers.get("Content-Type") || "";

    // Route: Newsletter subscription (FormData)
    if (contentType.includes("form-data")) {
      return handleSubscribe(request, env);
    }

    // Route: Shop inquiry / order (JSON)
    if (contentType.includes("json")) {
      return handleInquiry(request, env);
    }

    return json({ error: "Unsupported content type" }, 400);
  },
};

// ─── Newsletter Subscription ────────────────────────────────────
async function handleSubscribe(request, env) {
  try {
    const body = await request.formData();
    const firstName = body.get("firstName")?.trim();
    const lastName = body.get("lastName")?.trim();
    const email = body.get("email")?.trim().toLowerCase();
    const country = body.get("country")?.trim();

    if (!firstName || !lastName || !email) {
      return json({ error: "First name, last name, and email are required." }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "Please enter a valid email address." }, 400);
    }

    const existing = await env.SUBSCRIBERS.get(email);
    if (existing) {
      return json({ message: "You're already subscribed! Thank you." }, 200);
    }

    const subscriber = JSON.stringify({
      firstName,
      lastName,
      email,
      country: country || "",
      subscribedAt: new Date().toISOString(),
    });

    await env.SUBSCRIBERS.put(email, subscriber);

    // Also send notification email to gallery
    if (env.RESEND_API_KEY) {
      await sendEmail(env, {
        to: "info@caelis.cn",
        subject: "New Newsletter Subscriber: " + firstName + " " + lastName,
        html: `<h2>New Subscriber</h2>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Country:</strong> ${country || "Not specified"}</p>
          <p><strong>Date:</strong> ${new Date().toISOString()}</p>`,
      }).catch(() => {}); // Don't fail if email fails
    }

    return json({ message: "Thank you for subscribing to Caelis Galería!" }, 200);
  } catch (err) {
    console.error("Subscribe error:", err);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
}

// ─── Shop Inquiry / Order ───────────────────────────────────────
async function handleInquiry(request, env) {
  try {
    const body = await request.json();

    if (body.type !== "inquiry" || !body.data) {
      return json({ error: "Invalid request format." }, 400);
    }

    const d = body.data;
    if (!d.name || !d.email) {
      return json({ error: "Name and email are required." }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) {
      return json({ error: "Please enter a valid email address." }, 400);
    }

    // Store in KV for backup
    const inquiryId = "inquiry-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
    await env.SUBSCRIBERS.put(inquiryId, JSON.stringify({
      type: "inquiry",
      ...d,
      createdAt: new Date().toISOString(),
    }));

    // Send email notification to gallery
    if (env.RESEND_API_KEY) {
      const isInquire = d.itemId && d.itemId.startsWith("aw-");
      const subject = isInquire
        ? "Artwork Inquiry: " + d.item
        : "New Order: " + d.item;

      await sendEmail(env, {
        to: "info@caelis.cn",
        subject: subject,
        html: `<h2>${isInquire ? "Artwork Inquiry" : "New Order"}</h2>
          <p><strong>Item:</strong> ${d.item || "N/A"}</p>
          <hr style="margin: 16px 0; border-color: #eee;" />
          <p><strong>Customer Name:</strong> ${d.name}</p>
          <p><strong>Email:</strong> ${d.email}</p>
          <p><strong>Phone:</strong> ${d.phone || "Not provided"}</p>
          <p><strong>Country:</strong> ${d.country || "Not provided"}</p>
          <p><strong>Message:</strong></p>
          <p style="background:#f9f9f9;padding:12px;border-radius:4px;">${(d.message || "No message").replace(/\n/g, "<br>")}</p>
          <hr style="margin: 16px 0; border-color: #eee;" />
          <p style="color:#999;font-size:12px;">Received at ${new Date().toISOString()} | ID: ${inquiryId}</p>`,
      });
    }

    return json({ message: "Thank you! We'll get back to you shortly." }, 200);
  } catch (err) {
    console.error("Inquiry error:", err);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
}

// ─── Email via Resend ───────────────────────────────────────────
async function sendEmail(env, { to, subject, html }) {
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + env.RESEND_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Caelis Galería <noreply@caelis.cn>",
      to: [to],
      subject: subject,
      html: html,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error("Resend error:", err);
  }

  return resp;
}

// ─── Helpers ────────────────────────────────────────────────────
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
