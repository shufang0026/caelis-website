const ADMIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Visitors Admin — Caelis Galeria</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; min-height: 100vh; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    #login-screen { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .login-box { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); width: 100%; max-width: 360px; }
    .login-box h1 { margin-bottom: 24px; font-size: 24px; color: #333; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-size: 14px; color: #666; }
    .form-group input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; }
    .btn { width: 100%; padding: 14px; background: #222; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; }
    .btn:hover { background: #444; }
    .btn-del { padding: 4px 8px; background: #ffebee; color: #c62828; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
    .btn-del:hover { background: #ffcdd2; }
    #dashboard { display: none; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header h1 { font-size: 24px; color: #333; }
    .logout-btn { padding: 8px 16px; background: #eee; color: #333; border: none; border-radius: 6px; cursor: pointer; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .stat-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .stat-card .label { font-size: 14px; color: #888; margin-bottom: 4px; }
    .stat-card .value { font-size: 32px; font-weight: 600; color: #222; }
    .section { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 24px; overflow: hidden; }
    .section-header { padding: 16px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
    .section-header h2 { font-size: 18px; color: #333; }
    table { width: 100%; border-collapse: collapse; display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; }
    thead, tbody { display: table; width: 100%; table-layout: auto; }
    th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #f0f0f0; white-space: nowrap; font-size: 13px; }
    th:last-child, td:last-child { position: sticky; right: 0; background: inherit; box-shadow: -2px 0 4px rgba(0,0,0,0.04); }
    .mismatch { background: #fee; }
    .ip-location { font-size: 12px; color: var(--muted, #888); white-space: nowrap; }
    .ip-location .cc { font-weight: 600; color: #333; font-size: 11px; background: #f0f0f0; padding: 1px 6px; border-radius: 3px; margin-right: 4px; }
    .match-yes { color: #2e7d32; font-weight: 600; }
    .match-no { color: #c62828; font-weight: 600; }
    .match-null { color: #999; }
    .spam-row { background: #fef0f0; }
    .spam { color: #c00; }
    .empty { padding: 40px; text-align: center; color: #888; }
    .btn-export { padding: 6px 14px; background: #fff; color: #333; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; font-size: 13px; margin-left: 12px; }
    .btn-export:hover { background: #f0f0f0; }
    .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; margin-right: 4px; background: #e8f0fe; color: #1a56db; }
    .tag.src { background: #fef3e2; color: #b45309; }
    .tag.nl { background: #e6f4ea; color: #137333; }
    .tag.nl-no { background: #f5f5f5; color: #888; }
    .traffic-section { margin-bottom: 24px; }
    .traffic-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; padding: 16px; }
    .traffic-country { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: 8px; background: #fafafa; margin-bottom: 6px; font-size: 13px; }
    .traffic-country .tc-name { display: flex; align-items: center; gap: 8px; font-weight: 500; }
    .traffic-country .tc-count { font-weight: 600; color: #333; background: white; padding: 2px 10px; border-radius: 12px; font-size: 12px; }
    .traffic-bar { height: 4px; border-radius: 2px; background: #e0e0e0; margin-top: 6px; overflow: hidden; }
    .traffic-bar-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, #1a56db, #4285f4); transition: width 0.3s; }
  </style>
</head>
<body>
  <div class="container">
    <div id="login-screen">
      <div class="login-box">
        <h1>Caelis Visitors Admin</h1>
        <form id="login-form">
          <div class="form-group"><label>Username</label><input type="text" id="username" placeholder="admin" value="admin"></div>
          <div class="form-group"><label>Password</label><input type="password" id="password" placeholder="Enter password"></div>
          <button type="submit" class="btn">Sign In</button>
        </form>
      </div>
    </div>
    <div id="dashboard">
      <div class="header"><h1>Visitors & Subscribers</h1><button class="logout-btn" onclick="logout()">Sign Out</button></div>
      <div class="stats"><div class="stat-card"><div class="label">Today's Visitors</div><div class="value" id="today-visitors">-</div></div><div class="stat-card"><div class="label">Today's Newsletter</div><div class="value" id="today-newsletter">-</div></div><div class="stat-card"><div class="label">Total Visitors</div><div class="value" id="visitor-count">-</div></div><div class="stat-card"><div class="label">Total Newsletter</div><div class="value" id="subscriber-count">-</div></div></div>
      <div class="section traffic-section"><div class="section-header"><h2>📊 Today's Traffic</h2><span id="traffic-date"></span></div><div id="traffic-content"><p style="padding:20px;color:#888;text-align:center">Loading...</p></div></div>
      <div class="section"><div class="section-header"><h2>Recent Visitors</h2><button class="btn-export" onclick="downloadCSV('visitors')">Export CSV</button></div><table><thead><tr><th>Name</th><th>Email</th><th>Country</th><th>Details</th><th>IP Location</th><th>Match</th><th>Exhibition</th><th>Date</th><th></th></tr></thead><tbody id="visitors-table"></tbody></table></div>
      <div class="section"><div class="section-header"><h2>Newsletter</h2><button class="btn-export" onclick="downloadCSV('newsletter')">Export CSV</button></div><table><thead><tr><th>Email</th><th>Name</th><th>Country</th><th>Date</th><th></th></tr></thead><tbody id="newsletter-table"></tbody></table></div>
    </div>
  </div>
  <script>
    // Global error handler - catches uncaught errors and shows details
    window.addEventListener('error', function(e) {
      const errMsg = '[JS Error] ' + e.message + ' | file: ' + (e.filename||'?') + ':' + e.lineno;
      alert(errMsg);
    });
    
    const API_BASE = 'https://caelis-subscribe-production.shufang0026.workers.dev';
    const countryFlags = {'ES':'🇪🇸','CN':'🇨🇳','US':'🇺🇸','GB':'🇬🇧','FR':'🇫🇷','DE':'🇩🇪','IT':'🇮🇹','JP':'🇯🇵','KR':'🇰🇷','AU':'🇦🇺','CA':'🇨🇳','NL':'🇳🇱'};
    const CN = {'ES':'Spain','CN':'China','US':'United States','GB':'United Kingdom','FR':'France','DE':'Germany','IT':'Italy','JP':'Japan','KR':'South Korea','AU':'Australia','CA':'Canada','NL':'Netherlands'};
    function cname(c) { return CN[c] || c || ''; }
    function countryMatch(declared, ipCode) { if(!declared || !ipCode) return null; const d = declared.toLowerCase().trim(); const ip = cname(ipCode).toLowerCase(); const ic = ipCode.toLowerCase(); return d.includes(ip) || ip.includes(d) || d === ic || (d.length===2 && d===ipCode); }
    function b64e(str) { return btoa(unescape(encodeURIComponent(str))); }
    function parseCreds() { try { return atob(localStorage.getItem('cg_creds')||'').split(':'); } catch(e) { return ['admin','']; } }
    function doLogin(e) { e.preventDefault(); const user = document.getElementById('username').value||'admin'; const pass = document.getElementById('password').value; if(!pass) return alert('Password required'); localStorage.setItem('cg_creds', b64e(user+':'+pass)); location.reload(); }
    function logout() { localStorage.removeItem('cg_creds'); location.reload(); }
    async function apiCall(ep, opts={}) { const creds = localStorage.getItem('cg_creds') || ''; const headers = {'Authorization':'Basic '+creds,'Content-Type':'application/json',...(opts.headers||{})}; const res = await fetch(API_BASE+ep, {...opts, headers}); if(!res.ok) throw new Error(res.status); return res.json(); }
    async function loadData() {
      try {
        const [v,n,t] = await Promise.all([apiCall('/admin/visitors'),apiCall('/admin/newsletter'),apiCall('/admin/traffic')]);
        document.getElementById('visitor-count').textContent = v.total;
        document.getElementById('subscriber-count').textContent = n.total;
        document.getElementById('today-visitors').textContent = t.todayVisitors || 0;
        document.getElementById('today-newsletter').textContent = t.todayNewsletter || 0;
        document.getElementById('traffic-date').textContent = new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
        // Render traffic by country
        if(t.countries && t.countries.length){var maxC=Math.max(...t.countries.map(function(c){return c.count;}));var html='<div class=traffic-grid>';
        t.countries.forEach(function(c){var pct=maxC>0?Math.round(c.count/maxC*100):0;html+='<div class=traffic-country><span class=tc-name>'+(countryFlags[c.code]||'')+' '+c.name+'</span><span class=tc-count>'+c.count+' visitor'+(c.count!==1?'s':'')+'</span></div><div class=traffic-bar><div class=traffic-bar-fill style=width:'+pct+'%></div></div>';});
        html+='</div>';document.getElementById('traffic-content').innerHTML=html;}else{document.getElementById('traffic-content').innerHTML='<p style="padding:20px;color:#888;text-align:center">No traffic data for today</p>';}
        function ipLoc(x) { if(!x.ip) return String.fromCharCode(45); return '<span class=cc>'+(countryFlags[x.ipCountry]||'')+' '+(x.ipCountry||'')+'</span> '+(x.ipCity||'')+(x.ipRegion?', '+x.ipRegion:''); }
        function matchBadge(x) { if(!x.country||!x.ipCountry) return '<span class=match-null>—</span>'; return countryMatch(x.country, x.ipCountry)?'<span class=match-yes>✓ Match</span>':'<span class=match-no>✗ Mismatch</span>'; }
        document.getElementById('visitors-table').innerHTML = v.visitors.length ? v.visitors.map(function(x){var m=countryMatch(x.country,x.ipCountry);var details=[];if(x.role)details.push('<span class=tag>'+x.role+'</span>');if(x.source)details.push('<span class=tag src>'+x.source+'</span>');details.push(x.wantsNewsletter?'<span class=tag nl>✓ Newsletter</span>':'<span class=tag nl-no>✗ No NL</span>');return '<tr'+(m===false?' class=mismatch':'')+'><td>'+x.firstName+' '+x.lastName+'</td><td>'+x.email+'</td><td>'+(countryFlags[x.country]||'')+' '+x.country+'</td><td>'+details.join(String.fromCharCode(32))+'</td><td class=ip-location>'+ipLoc(x)+'</td><td>'+matchBadge(x)+'</td><td>'+x.exhibition+'</td><td>'+new Date(x.registeredAt).toLocaleDateString()+'</td><td><button class="btn-del" data-type="visitor">🗑</button></td></tr>';}).join('') : '<tr><td colspan="9" class="empty">No visitors</td></tr>';
        document.getElementById('newsletter-table').innerHTML = n.subscribers.length ? n.subscribers.map(x => '<tr class="'+(x.email.includes('@wshu')?'spam-row':'')+'"><td class="'+(x.email.includes('@wshu')?'spam':'')+'">'+x.email+'</td><td>'+x.firstName+' '+x.lastName+'</td><td>'+(countryFlags[x.country]||'')+' '+x.country+'</td><td>'+new Date(x.subscribedAt).toLocaleDateString()+'</td><td><button class="btn-del" data-type="newsletter">🗑</button></td></tr>').join('') : '<tr><td colspan="5" class="empty">No subscribers</td></tr>';
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
      } catch(e) { if(e.message==='401'){alert('Invalid credentials');localStorage.removeItem('cg_creds');}else{alert('Error: '+e.message);} }
    }
    document.getElementById('login-form').addEventListener('submit',doLogin);
    if(localStorage.getItem('cg_creds'))loadData();
    // Event delegation for delete buttons
    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('.btn-del');
      if (!btn) return;
      const row = btn.closest('tr');
      const type = btn.dataset.type || 'visitor';
      const email = type === 'newsletter' ? row.cells[0].textContent.trim() : row.cells[1].textContent.trim();
      if (!confirm('Delete ' + email + '?')) return;
      try {
        await apiCall('/' + type + '?email=' + encodeURIComponent(email), {method:'DELETE'});
        loadData();
      } catch(err) { alert('Delete failed: ' + err.message); }
    });
    
    // CSV Export function
    function downloadCSV(type) {
      const creds = localStorage.getItem('cg_creds') || '';
      const headers = type === 'visitors' 
        ? ['Name','Email','Country','Role','Source','Newsletter','IP Location','Match','Exhibition','Date']
        : ['Email','Name','Country','Date'];
      const ep = type === 'visitors' ? '/admin/visitors' : '/admin/newsletter';
      
      fetch(API_BASE + ep, { headers: { 'Authorization': 'Basic ' + creds } })
        .then(r => r.json())
        .then(data => {
          const rows = type === 'visitors' ? (data.visitors||[]) : (data.subscribers||[]);
          const lines = [headers.join(',')];
          rows.forEach(function(r) {
            if (type === 'visitors') {
              const name = (r.firstName||'') + ' ' + (r.lastName||'');
              const ipLoc = [r.ipCountry||'', r.ipCity||'', r.ipRegion||''].filter(Boolean).join(' ');
              const m = !r.country||!r.ipCountry ? '' : (countryMatch(r.country, r.ipCountry)?'Match':'Mismatch');
              lines.push([name, r.email||'', r.country||'', r.role||'', r.source||'', r.wantsNewsletter?'Yes':'No', ipLoc, m, r.exhibition||'', new Date(r.registeredAt).toLocaleDateString()].map(csvEscape).join(','));
            } else {
              lines.push([r.email||'', (r.firstName||'')+' '+(r.lastName||''), r.country||'', new Date(r.subscribedAt).toLocaleDateString()].map(csvEscape).join(','));
            }
          });
          const bom = String.fromCharCode(0xFEFF);
          const blob = new Blob([bom + lines.join(String.fromCharCode(10))], { type: 'text/csv;charset=utf-8' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'caelis-' + type + '-' + new Date().toISOString().slice(0,10) + '.csv';
          a.click();
          URL.revokeObjectURL(a.href);
        })
        .catch(err => alert('Export failed: ' + err.message));
    }
    
    function csvEscape(val) {
      val = String(val||'');
      if (val.includes(',') || val.includes('"') || val.includes(String.fromCharCode(10))) return '"' + val.replace(/"/g, '""') + '"';
      return val;
    }
  </script>
</body>
</html>`;

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
          "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const contentType = request.headers.get("Content-Type") || "";
    // Strip /api prefix for internal routing (when accessed via Cloudflare Pages proxy)
    const routePath = path.startsWith('/api') ? path.slice(4) : path;

    // GET: Admin panel or API
    if (request.method === "GET") {
      if (routePath === "/panel" || routePath === "/admin" || routePath === "/admin/") {
        return new Response(ADMIN_HTML, {
          headers: { "Content-Type": "text/html; charset=utf-8" }
        });
      }
      // API endpoints (both /visitors and /admin/visitors for compatibility)
      if (routePath === "/visitors" || routePath === "/admin/visitors") return handleVisitors(request, env);
      if (routePath === "/newsletter" || routePath === "/admin/newsletter") return handleNewsletter(request, env);
      if (routePath === "/traffic" || routePath === "/admin/traffic") return handleTraffic(request, env);
      return json({ error: "Not found" }, 404);
    }

    // DELETE: Visitor (both /visitor and /admin/visitor for compatibility)
    if ((routePath === "/visitor" || routePath === "/admin/visitor") && request.method === "DELETE") {
      const u = new URL(request.url);
      const email = u.searchParams.get("email");
      if (!email) return json({ error: "Email required" }, 400);
      if (!await validateBasicAuth(request, env)) return new Response("Unauthorized", { status: 401 });
      try {
        await env.SUBSCRIBERS.delete("visitor-" + email);
        return json({ success: true, deleted: email });
      } catch(e) { return json({ error: e.message }, 500); }
    }

    // DELETE: Newsletter subscriber
    if ((routePath === "/newsletter" || routePath === "/admin/newsletter") && request.method === "DELETE") {
      const u = new URL(request.url);
      const email = u.searchParams.get("email");
      if (!email) return json({ error: "Email required" }, 400);
      if (!await validateBasicAuth(request, env)) return new Response("Unauthorized", { status: 401 });
      try {
        await env.SUBSCRIBERS.delete("newsletter-" + email);
        return json({ success: true, deleted: email });
      } catch(e) { return json({ error: e.message }, 500); }
    }

    // Route: Exhibition visitor registration (JSON)
    if (routePath === "/visitor" && contentType.includes("json")) {
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

// ─── Traffic Dashboard (Today's Stats) ────────────────────────
async function handleTraffic(request, env) {
  if (!await validateBasicAuth(request, env)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", "WWW-Authenticate": "Basic realm=\"Caelis Admin\"" } });
  }
  try {
    const today = new Date().toISOString().slice(0,10);
    const [vList, nList] = await Promise.all([
      env.SUBSCRIBERS.list({ prefix: "visitor-" }),
      env.SUBSCRIBERS.list({ prefix: "newsletter-" })
    ]);
    var todayVisitors = 0, todayNewsletter = 0;
    var countryMap = {};
    // Process visitors
    for (const key of vList.keys) {
      var val = await env.SUBSCRIBERS.get(key.name);
      if (!val) continue;
      try { var d = JSON.parse(val); } catch { continue; }
      if ((d.registeredAt||'').slice(0,10) === today) { todayVisitors++; }
      var cc = d.country || d.ipCountry || 'Unknown';
      if (!countryMap[cc]) countryMap[cc] = { code: cc, name: cc, count: 0 };
      countryMap[cc].count++;
    }
    // Process newsletter
    for (const key of nList.keys) {
      var val2 = await env.SUBSCRIBERS.get(key.name);
      if (!val2) continue;
      try { var d2 = JSON.parse(val2); } catch { continue; }
      if ((d2.subscribedAt||'').slice(0,10) === today) { todayNewsletter++; }
      var cc2 = d2.country || d2.ipCountry || 'Unknown';
      if (!countryMap[cc2]) countryMap[cc2] = { code: cc2, name: cc2, count: 0 };
      countryMap[cc2].count++;
    }
    // Sort by count descending
    var countries = Object.values(countryMap).sort(function(a,b){return b.count-a.count;});
    return json({ todayVisitors, todayNewsletter, totalVisitors: vList.keys.length, totalNewsletter: nList.keys.length, date: today, countries });
  } catch (err) {
    console.error("Traffic error:", err);
    return json({ error: err.message }, 500);
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
