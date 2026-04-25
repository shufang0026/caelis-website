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

    try {
      const body = await request.formData();
      const firstName = body.get("firstName")?.trim();
      const lastName = body.get("lastName")?.trim();
      const email = body.get("email")?.trim().toLowerCase();
      const country = body.get("country")?.trim();

      // Validate required fields
      if (!firstName || !lastName || !email) {
        return json({ error: "First name, last name, and email are required." }, 400);
      }

      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ error: "Please enter a valid email address." }, 400);
      }

      // Check for duplicate
      const existing = await env.SUBSCRIBERS.get(email);
      if (existing) {
        return json({ message: "You're already subscribed! Thank you." }, 200);
      }

      // Store subscriber
      const subscriber = JSON.stringify({
        firstName,
        lastName,
        email,
        country: country || "",
        subscribedAt: new Date().toISOString(),
      });

      await env.SUBSCRIBERS.put(email, subscriber);

      return json(
        { message: "Thank you for subscribing to Caelis Galería!" },
        200
      );
    } catch (err) {
      console.error("Subscribe error:", err);
      return json({ error: "Something went wrong. Please try again." }, 500);
    }
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
