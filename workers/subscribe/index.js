// ─── Basic Auth Validation ─────────────────────────────────
async function validateBasicAuth(request, env) {
  const authHeader = request.headers.get("Authorization") || "";
  
  if (!authHeader.startsWith("Basic ")) {
    return false;
  }
  
  const base64Credentials = authHeader.slice(6); // Remove "Basic "
  const credentials = atob(base64Credentials);
  const [username, password] = credentials.split(":");
  
  // Get credentials from environment variables (set via wrangler secret put)
  const expectedUsername = env.ADMIN_USERNAME || "admin";
  const expectedPassword = env.ADMIN_PASSWORD || "caelis-2026-admin";
  
  return username === expectedUsername && password === expectedPassword;
}

export default {


  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const contentType = request.headers.get("Content-Type") || "";

    // GET: Visitors list (protected by API key)
    if (request.method === "GET") {
      if (path === "/visitors") {
        return handleVisitors(request, env);
      }
      if (path === "/newsletter") {
        return handleNewsletter(request, env);
      }
      return json({ error: "Not found" }, 404);
    }

    // Route: Exhibition visitor registration (JSON)
    if (path === "/visitor" && contentType.includes("json")) {
      return handleVisitor(request, env);
    }

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

// ─── Visitors List API (GET /visitors) ────────────────────────────
async function handleVisitors(request, env) {
  // Use Basic Auth instead of Bearer token
  if (!await validateBasicAuth(request, env)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "WWW-Authenticate": "Basic realm=\"Caelis Admin\"",
      },
    });
  }

  try {
    const list = await env.SUBSCRIBERS.list({ prefix: "visitor-" });
    const visitors = [];

    for (const key of list.keys) {
      const val = await env.SUBSCRIBERS.get(key.name);
      if (val) {
        try { visitors.push(JSON.parse(val)); } catch {}
      }
    }

    // Sort by registration date descending
    visitors.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

    return json({ total: visitors.length, visitors });
  } catch (err) {
    console.error("Visitors list error:", err);
    return json({ error: "Failed to fetch visitors" }, 500);
  }
}

// ─── Exhibition Visitor Registration ─────────────────────────────
async function handleVisitor(request, env) {
  try {
    const body = await request.json();
    const d = body.data || body;

    // Validation
    if (!d.firstName || !d.lastName || !d.email) {
      return json({ error: "First name, last name, and email are required." }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) {
      return json({ error: "Please enter a valid email address." }, 400);
    }

    const email = d.email.trim().toLowerCase();
    const visitorId = "visitor-" + email;

    // Check if already registered
    const existing = await env.SUBSCRIBERS.get(visitorId);
    if (existing) {
      return json({ 
        message: "Welcome back! You already have access to this exhibition.",
        alreadyRegistered: true 
      }, 200);
    }

    const visitorData = {
      type: "exhibition_visitor",
      firstName: d.firstName.trim(),
      lastName: d.lastName.trim(),
      email: email,
      country: d.country || "",
      role: d.role || "",
      interests: d.interests || [],
      source: d.source || "",
      wantsNewsletter: d.wantsNewsletter === true,
      notes: d.notes || "",
      exhibition: d.exhibition || "jaime-sancorlo-reach-out",
      registeredAt: new Date().toISOString(),
      userAgent: request.headers.get("User-Agent") || "",
      ip: request.headers.get("CF-Connecting-IP") || "",
      ipCountry: request.headers.get("CF-IPCountry") || "",
      ipCity: request.cf?.city || "",
      ipRegion: request.cf?.region || "",
    };

    await env.SUBSCRIBERS.put(visitorId, JSON.stringify(visitorData));

    // Also add to newsletter list if opted in
    if (d.wantsNewsletter) {
      const subId = "newsletter-" + email;
      const existingSub = await env.SUBSCRIBERS.get(subId);
      if (!existingSub) {
        await env.SUBSCRIBERS.put(subId, JSON.stringify({
          firstName: d.firstName.trim(),
          lastName: d.lastName.trim(),
          email: email,
          country: d.country || "",
          source: "exhibition_" + (d.exhibition || "reach-out"),
          subscribedAt: new Date().toISOString(),
        }));
      }
    }

    // Send notification email to gallery
    if (env.RESEND_API_KEY) {
      await sendEmail(env, {
        to: "info@caelis.cn",
        subject: "New Exhibition Visitor: " + d.firstName + " " + d.lastName,
        html: `<h2>New Exhibition Visitor</h2>
          <p><strong>Exhibition:</strong> ${d.exhibition || "Reach Out — Jaime Sancorlo"}</p>
          <hr style="margin: 16px 0; border-color: #eee;" />
          <p><strong>Name:</strong> ${d.firstName} ${d.lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Country:</strong> ${d.country || "Not specified"}</p>
          <p><strong>Role:</strong> ${d.role || "Not specified"}</p>
          <p><strong>Interests:</strong> ${Array.isArray(d.interests) ? d.interests.join(", ") : (d.interests || "Not specified")}</p>
          <p><strong>Source:</strong> ${d.source || "Not specified"}</p>
          <p><strong>Newsletter:</strong> ${d.wantsNewsletter ? "Yes ✓" : "No"}</p>
          <p><strong>Notes:</strong> ${d.notes || "None"}</p>
          <hr style="margin: 16px 0; border-color: #eee;" />
          <p style="color:#999;font-size:12px;">Registered at ${new Date().toISOString()}</p>`,
      }).catch(() => {});
    }

    return json({ 
      message: "Welcome to the exhibition! You now have full access.",
      alreadyRegistered: false 
    }, 200);
  } catch (err) {
    console.error("Visitor registration error:", err);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
}

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

    const existing = await env.SUBSCRIBERS.get("newsletter-" + email);
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

    await env.SUBSCRIBERS.put("newsletter-" + email, subscriber);

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

// ─── Newsletter Subscribers List (GET /newsletter) ─────────────────
async function handleNewsletter(request, env) {
  // Use Basic Auth instead of Bearer token
  if (!await validateBasicAuth(request, env)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "WWW-Authenticate": "Basic realm=\"Caelis Admin\"",
      },
    });
  }

  try {
    const list = await env.SUBSCRIBERS.list({ prefix: "newsletter-" });
    const subscribers = [];

    for (const key of list.keys) {
      const val = await env.SUBSCRIBERS.get(key.name);
      if (val) {
        try { subscribers.push(JSON.parse(val)); } catch {}
      }
    }

    subscribers.sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt));

    return json({ total: subscribers.length, subscribers });
  } catch (err) {
    console.error("Newsletter list error:", err);
    return json({ error: "Failed to fetch newsletter subscribers" }, 500);
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
