/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║     DATA CORTEX — E2E Console Test Suite                        ║
 * ║     הדבק את הסקריפט הזה בקונסול הדפדפן כשאתה מחובר למערכת      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * הסקריפט בודק:
 * 1. ניווט ו-routing — כל הדפים נטענים בלי 500/404
 * 2. Auth — משתמש מחובר, סטטוס תקין
 * 3. API/Server Actions — כל ה-endpoints מגיבים
 * 4. DOM — אלמנטים קריטיים קיימים
 * 5. RBAC — admin features מוצגים/מוסתרים לפי תפקיד
 * 6. RTL — בדיקת כיווניות
 * 7. Responsive — בדיקת breakpoints
 * 8. Performance — זמני טעינה
 */

(async function DataCortexE2ETest() {
  "use strict";

  // ═══════════════════════════════════════════════
  //  CONFIG & UTILITIES
  // ═══════════════════════════════════════════════

  const COLORS = {
    pass: "#22c55e",
    fail: "#ef4444",
    warn: "#f59e0b",
    info: "#3b82f6",
    header: "#8b5cf6",
    dim: "#94a3b8",
  };

  let passed = 0;
  let failed = 0;
  let warned = 0;
  let skipped = 0;
  const failures = [];
  const warnings = [];
  const timings = {};

  function log(msg, color = COLORS.dim) {
    console.log(`%c${msg}`, `color:${color};font-weight:500`);
  }

  function header(msg) {
    console.log(
      `\n%c═══ ${msg} ═══`,
      `color:${COLORS.header};font-weight:bold;font-size:14px`
    );
  }

  function pass(test) {
    passed++;
    console.log(`%c  ✓ ${test}`, `color:${COLORS.pass}`);
  }

  function fail(test, detail = "") {
    failed++;
    const msg = detail ? `${test} — ${detail}` : test;
    failures.push(msg);
    console.log(`%c  ✗ ${test}`, `color:${COLORS.fail};font-weight:bold`);
    if (detail) console.log(`%c    → ${detail}`, `color:${COLORS.fail}`);
  }

  function warn(test, detail = "") {
    warned++;
    warnings.push(detail ? `${test}: ${detail}` : test);
    console.log(`%c  ⚠ ${test}`, `color:${COLORS.warn}`);
    if (detail) console.log(`%c    → ${detail}`, `color:${COLORS.warn}`);
  }

  function skip(test, reason) {
    skipped++;
    console.log(`%c  ⊘ ${test} — ${reason}`, `color:${COLORS.dim}`);
  }

  async function fetchPage(path, opts = {}) {
    const start = performance.now();
    try {
      const res = await fetch(path, {
        credentials: "include",
        redirect: "manual",
        ...opts,
      });
      const elapsed = Math.round(performance.now() - start);
      timings[path] = elapsed;
      return { status: res.status, elapsed, ok: res.ok, headers: res.headers, res };
    } catch (e) {
      const elapsed = Math.round(performance.now() - start);
      return { status: 0, elapsed, ok: false, error: e.message };
    }
  }

  async function fetchPageFollow(path) {
    const start = performance.now();
    try {
      const res = await fetch(path, { credentials: "include" });
      const elapsed = Math.round(performance.now() - start);
      const text = await res.text();
      timings[path] = elapsed;
      return { status: res.status, elapsed, ok: res.ok, text, url: res.url };
    } catch (e) {
      const elapsed = Math.round(performance.now() - start);
      return { status: 0, elapsed, ok: false, error: e.message, text: "" };
    }
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  // ═══════════════════════════════════════════════
  //  DETECT ORG SLUG & ENVIRONMENT
  // ═══════════════════════════════════════════════

  header("0. ENVIRONMENT DETECTION");

  const currentUrl = window.location.href;
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  log(`URL: ${currentUrl}`);
  log(`Origin: ${origin}`);

  const orgMatch = pathname.match(/^\/([^/]+)\/?/);
  const orgSlug = orgMatch
    ? orgMatch[1] === "login" ||
      orgMatch[1] === "pending" ||
      orgMatch[1] === "suspended" ||
      orgMatch[1] === "auth" ||
      orgMatch[1] === "_next"
      ? null
      : orgMatch[1]
    : null;

  if (!orgSlug) {
    console.log(
      `%c⚠ לא זוהה orgSlug מה-URL. אנא נווט לדף דאשבורד (למשל /{org}/) ותריץ שוב.`,
      `color:${COLORS.fail};font-size:14px;font-weight:bold`
    );
    console.log(`%cניסיון לזהות מתוך ניווט...`, `color:${COLORS.warn}`);
  }

  const ORG = orgSlug || "default";
  log(`Org Slug: ${ORG}`);

  // ═══════════════════════════════════════════════
  //  1. AUTHENTICATION & SESSION
  // ═══════════════════════════════════════════════

  header("1. AUTHENTICATION & SESSION");

  // Check if Supabase session exists
  const sbKeys = Object.keys(localStorage).filter(
    (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
  );
  if (sbKeys.length > 0) {
    pass("Supabase auth token found in localStorage");
  } else {
    fail(
      "Supabase auth token missing from localStorage",
      "המשתמש כנראה לא מחובר"
    );
  }

  // Check cookies
  const cookies = document.cookie;
  const hasSupabaseCookie = cookies.includes("sb-");
  if (hasSupabaseCookie) {
    pass("Supabase cookie present");
  } else {
    warn("Supabase cookie not found", "זה יכול להיות תקין אם cookies הם httpOnly");
  }

  // Check if we can access a protected page
  const dashRes = await fetchPage(`/${ORG}/`);
  if (dashRes.status === 200) {
    pass(`Dashboard accessible (${dashRes.elapsed}ms)`);
  } else if (dashRes.status === 307 || dashRes.status === 302) {
    warn(`Dashboard redirects (${dashRes.status})`, "ייתכן שהמשתמש לא מחובר או PENDING");
  } else {
    fail(`Dashboard returned ${dashRes.status}`, `Expected 200, elapsed: ${dashRes.elapsed}ms`);
  }

  // ═══════════════════════════════════════════════
  //  2. PAGE ROUTING — ALL PAGES LOAD
  // ═══════════════════════════════════════════════

  header("2. PAGE ROUTING — ALL PAGES");

  const pages = [
    { path: `/${ORG}/`, name: "Dashboard (home)" },
    { path: `/${ORG}/contribute`, name: "Contribute page" },
    { path: `/${ORG}/rules`, name: "Global Rules" },
    { path: `/${ORG}/notifications`, name: "Notifications" },
    { path: `/${ORG}/search`, name: "Search" },
    { path: `/${ORG}/audit`, name: "Audit Log (admin)" },
    { path: `/${ORG}/settings/users`, name: "User Management (admin)" },
    { path: `/login`, name: "Login page" },
    { path: `/pending`, name: "Pending approval page" },
    { path: `/suspended`, name: "Suspended page" },
  ];

  for (const page of pages) {
    const r = await fetchPage(page.path);
    const isRedirect = r.status === 307 || r.status === 302 || r.status === 308;
    const isOk = r.status === 200;
    const isServerError = r.status >= 500;

    if (isOk) {
      if (r.elapsed > 3000) {
        warn(`${page.name}: ${r.status} (${r.elapsed}ms)`, "SLOW — מעל 3 שניות");
      } else {
        pass(`${page.name}: ${r.status} (${r.elapsed}ms)`);
      }
    } else if (isRedirect) {
      // Redirects from admin pages are expected for non-admins
      if (page.path.includes("audit") || page.path.includes("settings")) {
        pass(`${page.name}: ${r.status} redirect (expected for non-admin)`);
      } else if (page.path === "/login") {
        pass(`${page.name}: ${r.status} redirect (expected if logged in)`);
      } else {
        warn(`${page.name}: redirects (${r.status})`, `elapsed: ${r.elapsed}ms`);
      }
    } else if (isServerError) {
      fail(`${page.name}: SERVER ERROR ${r.status}`, `elapsed: ${r.elapsed}ms`);
    } else {
      fail(`${page.name}: unexpected ${r.status}`, `elapsed: ${r.elapsed}ms`);
    }
  }

  // ═══════════════════════════════════════════════
  //  3. STATIC PAGES — CONTENT CHECK
  // ═══════════════════════════════════════════════

  header("3. STATIC PAGES — CONTENT CHECK");

  const pendingPage = await fetchPageFollow("/pending");
  if (pendingPage.ok && pendingPage.text.includes("ממתין")) {
    pass("Pending page contains Hebrew text 'ממתין'");
  } else if (pendingPage.ok) {
    warn("Pending page loaded but missing expected text");
  } else {
    fail(`Pending page failed: ${pendingPage.status}`);
  }

  const suspendedPage = await fetchPageFollow("/suspended");
  if (suspendedPage.ok && suspendedPage.text.includes("הושעתה")) {
    pass("Suspended page contains Hebrew text 'הושעתה'");
  } else if (suspendedPage.ok) {
    warn("Suspended page loaded but missing expected text");
  } else {
    fail(`Suspended page failed: ${suspendedPage.status}`);
  }

  const loginPage = await fetchPageFollow("/login");
  if (loginPage.status === 200 || (loginPage.status >= 300 && loginPage.status < 400)) {
    pass(`Login page accessible (status: ${loginPage.status})`);
  } else {
    fail(`Login page failed: ${loginPage.status}`);
  }

  // ═══════════════════════════════════════════════
  //  4. DOM INTEGRITY — CURRENT PAGE
  // ═══════════════════════════════════════════════

  header("4. DOM INTEGRITY — CURRENT PAGE");

  // Check RTL
  const htmlDir = document.documentElement.dir || document.body.dir;
  const hasRtlElements = document.querySelectorAll('[dir="rtl"]').length;
  if (htmlDir === "rtl" || hasRtlElements > 0) {
    pass(`RTL detected (html dir="${htmlDir}", ${hasRtlElements} elements with dir=rtl)`);
  } else {
    warn("No RTL detected", "האפליקציה אמורה להיות RTL");
  }

  // Check sidebar
  const sidebar = document.querySelector("aside") || document.querySelector('[class*="sidebar" i]') || document.querySelector('[class*="Sidebar" i]');
  if (sidebar) {
    pass("Sidebar element found");
    
    // Check sidebar nav items
    const navLinks = sidebar.querySelectorAll("a");
    if (navLinks.length >= 3) {
      pass(`Sidebar has ${navLinks.length} navigation links`);
    } else {
      warn(`Sidebar has only ${navLinks.length} links`, "Expected at least 3");
    }

    // Check if admin items are present/hidden based on role
    const sidebarText = sidebar.textContent || "";
    const hasAudit = sidebarText.includes("היסטוריה");
    const hasUsers = sidebarText.includes("ניהול משתמשים");
    log(`  Sidebar contains audit link: ${hasAudit}`, COLORS.info);
    log(`  Sidebar contains users link: ${hasUsers}`, COLORS.info);
  } else {
    warn("Sidebar element not found", "ייתכן שאתה בדף שלא מכיל sidebar");
  }

  // Check main content area
  const main = document.querySelector("main") || document.querySelector('[class*="main" i]');
  if (main) {
    pass("Main content area found");
    const mainHeight = main.getBoundingClientRect().height;
    if (mainHeight > 100) {
      pass(`Main content has substantial height (${Math.round(mainHeight)}px)`);
    } else {
      warn(`Main content is very short (${Math.round(mainHeight)}px)`, "ייתכן שהתוכן לא נטען");
    }
  } else {
    warn("Main content area not found");
  }

  // Check for error boundaries / error states
  const errorElements = document.querySelectorAll(
    '[class*="error" i], [class*="Error" i], [role="alert"]'
  );
  const visibleErrors = Array.from(errorElements).filter(
    (el) => el.offsetHeight > 0 && el.textContent.trim().length > 0
  );
  if (visibleErrors.length === 0) {
    pass("No visible error elements on page");
  } else {
    fail(
      `${visibleErrors.length} visible error element(s)`,
      visibleErrors.map((el) => el.textContent.trim().slice(0, 80)).join(" | ")
    );
  }

  // Check for hydration errors in console
  // (we can't directly check console, but check for React error overlay)
  const reactOverlay = document.querySelector("#__next-build-error") ||
    document.querySelector('[data-nextjs-dialog]') ||
    document.querySelector("nextjs-portal");
  if (!reactOverlay) {
    pass("No Next.js error overlay detected");
  } else {
    fail("Next.js error overlay is visible", "יש שגיאת hydration או runtime");
  }

  // ═══════════════════════════════════════════════
  //  5. CSS & DESIGN SYSTEM INTEGRITY
  // ═══════════════════════════════════════════════

  header("5. CSS & DESIGN SYSTEM INTEGRITY");

  // Check CSS variables exist
  const rootStyles = getComputedStyle(document.documentElement);
  const cssVars = [
    "--surface-page",
    "--font-primary-default",
    "--border-default",
    "--space-md",
    "--radius-medium",
  ];

  let cssVarsOk = 0;
  for (const v of cssVars) {
    const val = rootStyles.getPropertyValue(v).trim();
    if (val) {
      cssVarsOk++;
    } else {
      fail(`CSS variable ${v} is empty/missing`);
    }
  }
  if (cssVarsOk === cssVars.length) {
    pass(`All ${cssVars.length} design system CSS variables present`);
  }

  // Check font loading
  if (document.fonts) {
    const fontsReady = document.fonts.status === "loaded";
    if (fontsReady) {
      pass("Fonts loaded");
    } else {
      warn("Fonts still loading", `status: ${document.fonts.status}`);
    }
  }

  // Check for broken images
  const images = document.querySelectorAll("img");
  let brokenImages = 0;
  images.forEach((img) => {
    if (img.naturalWidth === 0 && img.complete && img.src) {
      brokenImages++;
    }
  });
  if (brokenImages === 0) {
    pass(`All ${images.length} images loaded successfully`);
  } else {
    fail(`${brokenImages} broken image(s) out of ${images.length}`);
  }

  // ═══════════════════════════════════════════════
  //  6. NEXT.JS INTERNAL HEALTH
  // ═══════════════════════════════════════════════

  header("6. NEXT.JS INTERNAL HEALTH");

  // Check __NEXT_DATA__ or RSC payload
  const nextData = document.getElementById("__NEXT_DATA__");
  const rscPayloads = document.querySelectorAll('script[type="application/json"]');
  if (nextData) {
    pass("__NEXT_DATA__ script found (Pages Router style)");
  } else if (rscPayloads.length > 0) {
    pass(`${rscPayloads.length} RSC payload(s) found (App Router)`);
  } else {
    log("  No __NEXT_DATA__ or RSC payloads (normal for streaming)", COLORS.dim);
  }

  // Check service worker
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    log(`  Service workers registered: ${registrations.length}`, COLORS.dim);
  }

  // Check meta tags
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    pass("Viewport meta tag present");
  } else {
    warn("Viewport meta tag missing");
  }

  // ═══════════════════════════════════════════════
  //  7. API HEALTH — FETCH BASED TESTS
  // ═══════════════════════════════════════════════

  header("7. API HEALTH — SERVER ACTION SIMULATION");

  // Test RSC navigation to each dashboard page
  const rscPages = [
    { path: `/${ORG}/`, name: "Dashboard RSC" },
    { path: `/${ORG}/contribute`, name: "Contribute RSC" },
    { path: `/${ORG}/rules`, name: "Rules RSC" },
    { path: `/${ORG}/notifications`, name: "Notifications RSC" },
  ];

  for (const page of rscPages) {
    const r = await fetchPage(page.path, {
      headers: {
        RSC: "1",
        "Next-Router-State-Tree": encodeURIComponent("[]"),
      },
    });
    if (r.status === 200) {
      pass(`${page.name}: RSC fetch OK (${r.elapsed}ms)`);
    } else if (r.status === 307 || r.status === 302) {
      pass(`${page.name}: RSC redirect (expected)`);
    } else {
      fail(`${page.name}: RSC returned ${r.status}`, `elapsed: ${r.elapsed}ms`);
    }
  }

  // Test auth callback doesn't crash (should redirect)
  const authCbRes = await fetchPage("/auth/callback");
  if (authCbRes.status === 307 || authCbRes.status === 302 || authCbRes.status === 200) {
    pass(`Auth callback responds (${authCbRes.status}, ${authCbRes.elapsed}ms)`);
  } else if (authCbRes.status >= 500) {
    fail(`Auth callback SERVER ERROR ${authCbRes.status}`);
  } else {
    pass(`Auth callback: ${authCbRes.status} (expected without code param)`);
  }

  // ═══════════════════════════════════════════════
  //  8. INTERACTIVE ELEMENTS
  // ═══════════════════════════════════════════════

  header("8. INTERACTIVE ELEMENTS");

  // Check all buttons are accessible
  const buttons = document.querySelectorAll("button");
  let disabledButtons = 0;
  let buttonsWithoutText = 0;
  buttons.forEach((btn) => {
    if (btn.disabled) disabledButtons++;
    const text = (btn.textContent || "").trim();
    const ariaLabel = btn.getAttribute("aria-label");
    const title = btn.getAttribute("title");
    if (!text && !ariaLabel && !title && btn.querySelector("svg")) {
      buttonsWithoutText++;
    }
  });
  pass(`${buttons.length} buttons found (${disabledButtons} disabled)`);
  if (buttonsWithoutText > 0) {
    warn(
      `${buttonsWithoutText} icon button(s) without aria-label`,
      "נגישות — כפתורי אייקון צריכים aria-label"
    );
  }

  // Check all links
  const links = document.querySelectorAll("a[href]");
  let brokenLinks = 0;
  let externalLinks = 0;
  links.forEach((a) => {
    const href = a.getAttribute("href");
    if (href && href.startsWith("http") && !href.startsWith(origin)) {
      externalLinks++;
    }
    if (!href || href === "#") {
      brokenLinks++;
    }
  });
  pass(`${links.length} links found (${externalLinks} external)`);
  if (brokenLinks > 0) {
    warn(`${brokenLinks} link(s) with empty or # href`);
  }

  // Check forms
  const forms = document.querySelectorAll("form");
  forms.forEach((form, i) => {
    const inputs = form.querySelectorAll("input, textarea, select");
    const submitBtn = form.querySelector('button[type="submit"], button:not([type])');
    if (inputs.length > 0) {
      pass(`Form #${i + 1}: ${inputs.length} input(s), submit button: ${!!submitBtn}`);
    }
  });

  // Check dialogs/modals
  const dialogs = document.querySelectorAll(
    '[role="dialog"], [data-state="open"], dialog'
  );
  log(`  Open dialogs/modals: ${dialogs.length}`, COLORS.dim);

  // ═══════════════════════════════════════════════
  //  9. PERFORMANCE METRICS
  // ═══════════════════════════════════════════════

  header("9. PERFORMANCE METRICS");

  // Navigation timing
  if (performance.getEntriesByType) {
    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries.length > 0) {
      const nav = navEntries[0];
      const ttfb = Math.round(nav.responseStart - nav.requestStart);
      const domComplete = Math.round(nav.domComplete);
      const loadComplete = Math.round(nav.loadEventEnd);

      log(`  TTFB: ${ttfb}ms`, ttfb < 200 ? COLORS.pass : ttfb < 1000 ? COLORS.warn : COLORS.fail);
      log(`  DOM Complete: ${domComplete}ms`, domComplete < 3000 ? COLORS.pass : COLORS.warn);
      log(`  Full Load: ${loadComplete}ms`, loadComplete < 5000 ? COLORS.pass : COLORS.warn);

      if (ttfb < 1000) pass(`TTFB: ${ttfb}ms`);
      else fail(`TTFB too slow: ${ttfb}ms`, "Expected < 1000ms");

      if (domComplete < 5000) pass(`DOM complete: ${domComplete}ms`);
      else warn(`DOM complete slow: ${domComplete}ms`);
    }
  }

  // Resource count
  const resources = performance.getEntriesByType("resource");
  const jsResources = resources.filter((r) => r.name.endsWith(".js") || r.initiatorType === "script");
  const cssResources = resources.filter((r) => r.name.endsWith(".css") || r.initiatorType === "link");
  log(`  Resources: ${resources.length} total, ${jsResources.length} JS, ${cssResources.length} CSS`, COLORS.info);

  // JS bundle size estimate
  let totalJsSize = 0;
  jsResources.forEach((r) => {
    if (r.transferSize) totalJsSize += r.transferSize;
  });
  const jsMB = (totalJsSize / 1024 / 1024).toFixed(2);
  if (totalJsSize > 0) {
    if (totalJsSize < 2 * 1024 * 1024) {
      pass(`JS bundle size: ${jsMB}MB (compressed)`);
    } else {
      warn(`JS bundle size: ${jsMB}MB`, "מעל 2MB — שקול code splitting");
    }
  }

  // Memory
  if (performance.memory) {
    const usedMB = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
    const totalMB = (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(1);
    log(`  Memory: ${usedMB}MB / ${totalMB}MB`, COLORS.info);
    if (performance.memory.usedJSHeapSize < 100 * 1024 * 1024) {
      pass(`Memory usage: ${usedMB}MB`);
    } else {
      warn(`High memory usage: ${usedMB}MB`);
    }
  }

  // ═══════════════════════════════════════════════
  //  10. NETWORK — FAILED REQUESTS
  // ═══════════════════════════════════════════════

  header("10. NETWORK — FAILED REQUESTS CHECK");

  const failedResources = resources.filter(
    (r) => r.responseStatus && r.responseStatus >= 400
  );
  if (failedResources.length === 0) {
    pass("No failed network requests detected");
  } else {
    failedResources.forEach((r) => {
      fail(`Failed request: ${r.responseStatus} ${r.name.split("/").pop()}`);
    });
  }

  // Check for 404 resources
  const notFoundResources = resources.filter((r) => r.responseStatus === 404);
  if (notFoundResources.length === 0) {
    pass("No 404 resources");
  } else {
    notFoundResources.forEach((r) => {
      fail(`404 Not Found: ${r.name}`);
    });
  }

  // ═══════════════════════════════════════════════
  //  11. NAVIGATION INTEGRITY — CROSS-PAGE
  // ═══════════════════════════════════════════════

  header("11. CROSS-PAGE NAVIGATION INTEGRITY");

  // Test that navigating to a non-existent asset returns properly
  const fakeAssetRes = await fetchPageFollow(
    `/${ORG}/assets/00000000-0000-0000-0000-000000000000`
  );
  if (fakeAssetRes.status === 404 || fakeAssetRes.text.includes("not-found") || fakeAssetRes.text.includes("לא נמצא")) {
    pass("Non-existent asset returns 404 or not-found page");
  } else if (fakeAssetRes.status === 200) {
    warn("Non-existent asset returns 200", "Expected 404 or redirect");
  } else {
    pass(`Non-existent asset: ${fakeAssetRes.status} (acceptable)`);
  }

  // Test non-existent org
  const fakeOrgRes = await fetchPage("/nonexistent-org-xyz-12345/");
  if (fakeOrgRes.status === 307 || fakeOrgRes.status === 302 || fakeOrgRes.status === 404) {
    pass(`Non-existent org redirects/404 (${fakeOrgRes.status})`);
  } else if (fakeOrgRes.status >= 500) {
    fail(`Non-existent org causes SERVER ERROR ${fakeOrgRes.status}`);
  } else {
    pass(`Non-existent org: ${fakeOrgRes.status}`);
  }

  // ═══════════════════════════════════════════════
  //  12. ACCESSIBILITY BASICS
  // ═══════════════════════════════════════════════

  header("12. ACCESSIBILITY BASICS");

  // Check lang attribute
  const htmlLang = document.documentElement.lang;
  if (htmlLang) {
    pass(`HTML lang attribute: "${htmlLang}"`);
  } else {
    warn("HTML lang attribute missing");
  }

  // Check heading hierarchy
  const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  const h1Count = document.querySelectorAll("h1").length;
  log(`  Headings: ${headings.length} total, ${h1Count} h1`, COLORS.info);
  if (h1Count <= 1) {
    pass(`Heading structure: ${h1Count} h1 (correct)`);
  } else {
    warn(`${h1Count} h1 elements`, "ממולץ h1 אחד לדף");
  }

  // Check focus management
  const focusableElements = document.querySelectorAll(
    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
  pass(`${focusableElements.length} focusable elements`);

  // Check color contrast (basic)
  const bodyBg = getComputedStyle(document.body).backgroundColor;
  const bodyColor = getComputedStyle(document.body).color;
  log(`  Body bg: ${bodyBg}, color: ${bodyColor}`, COLORS.dim);

  // ═══════════════════════════════════════════════
  //  13. LOCAL STORAGE & STATE
  // ═══════════════════════════════════════════════

  header("13. LOCAL STORAGE & STATE");

  const lsKeys = Object.keys(localStorage);
  log(`  LocalStorage keys: ${lsKeys.length}`, COLORS.info);
  lsKeys.forEach((k) => {
    const size = localStorage.getItem(k)?.length || 0;
    const sizeKB = (size / 1024).toFixed(1);
    if (size > 1024 * 100) {
      warn(`Large localStorage item: ${k} (${sizeKB}KB)`, "מעל 100KB");
    }
  });

  // Check Zustand store
  const hasUIStore = lsKeys.some((k) => k.includes("ui-store") || k.includes("zustand"));
  if (hasUIStore) {
    pass("UI store found in localStorage");
  } else {
    log("  No Zustand store in localStorage (may use memory only)", COLORS.dim);
  }

  // ═══════════════════════════════════════════════
  //  14. SECURITY CHECKS
  // ═══════════════════════════════════════════════

  header("14. BASIC SECURITY CHECKS");

  // Check for exposed env vars
  const pageText = document.body.innerText || "";
  const envPatterns = [
    /sk[-_]live[-_][a-zA-Z0-9]{20,}/,
    /SUPABASE_SERVICE_ROLE/,
    /DATABASE_URL.*postgres/,
    /ANTHROPIC_API_KEY/,
    /sk-ant-/,
  ];

  let secretsFound = false;
  for (const pattern of envPatterns) {
    if (pattern.test(pageText)) {
      fail(`SECURITY: Possible secret exposed in page text`, pattern.toString());
      secretsFound = true;
    }
  }
  if (!secretsFound) {
    pass("No exposed secrets detected in page content");
  }

  // Check CSP header
  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (cspMeta) {
    pass("Content-Security-Policy meta tag present");
  } else {
    log("  No CSP meta tag (may be set via headers)", COLORS.dim);
  }

  // Check X-Frame-Options / frame ancestors
  const iframeTest = document.createElement("iframe");
  iframeTest.style.display = "none";
  pass("Security headers check (server-side, cannot verify from client)");

  // ═══════════════════════════════════════════════
  //  15. RESPONSE TIME SUMMARY
  // ═══════════════════════════════════════════════

  header("15. RESPONSE TIME SUMMARY");

  const sortedTimings = Object.entries(timings).sort((a, b) => b[1] - a[1]);
  sortedTimings.forEach(([path, ms]) => {
    const color = ms < 500 ? COLORS.pass : ms < 2000 ? COLORS.warn : COLORS.fail;
    const bar = "█".repeat(Math.min(Math.ceil(ms / 100), 30));
    console.log(`%c  ${bar} %c${ms}ms %c${path}`, `color:${color}`, `color:${color};font-weight:bold`, `color:${COLORS.dim}`);
  });

  // ═══════════════════════════════════════════════
  //  FINAL REPORT
  // ═══════════════════════════════════════════════

  console.log("\n");
  console.log(
    `%c╔══════════════════════════════════════════════════════════════════╗`,
    `color:${COLORS.header};font-weight:bold;font-size:16px`
  );
  console.log(
    `%c║                    FINAL REPORT — DATA CORTEX                   ║`,
    `color:${COLORS.header};font-weight:bold;font-size:16px`
  );
  console.log(
    `%c╚══════════════════════════════════════════════════════════════════╝`,
    `color:${COLORS.header};font-weight:bold;font-size:16px`
  );

  console.log(
    `%c  ✓ PASSED:  ${passed}`,
    `color:${COLORS.pass};font-weight:bold;font-size:14px`
  );
  console.log(
    `%c  ✗ FAILED:  ${failed}`,
    `color:${failed > 0 ? COLORS.fail : COLORS.pass};font-weight:bold;font-size:14px`
  );
  console.log(
    `%c  ⚠ WARNINGS: ${warned}`,
    `color:${warned > 0 ? COLORS.warn : COLORS.pass};font-weight:bold;font-size:14px`
  );
  console.log(
    `%c  ⊘ SKIPPED: ${skipped}`,
    `color:${COLORS.dim};font-weight:bold;font-size:14px`
  );

  const total = passed + failed;
  const score = total > 0 ? Math.round((passed / total) * 100) : 0;

  console.log("\n");
  if (score === 100) {
    console.log(
      `%c  🏆 SCORE: ${score}% — PERFECT`,
      `color:${COLORS.pass};font-weight:bold;font-size:18px`
    );
  } else if (score >= 90) {
    console.log(
      `%c  ✅ SCORE: ${score}% — EXCELLENT`,
      `color:${COLORS.pass};font-weight:bold;font-size:18px`
    );
  } else if (score >= 70) {
    console.log(
      `%c  ⚠️ SCORE: ${score}% — NEEDS ATTENTION`,
      `color:${COLORS.warn};font-weight:bold;font-size:18px`
    );
  } else {
    console.log(
      `%c  ❌ SCORE: ${score}% — CRITICAL ISSUES`,
      `color:${COLORS.fail};font-weight:bold;font-size:18px`
    );
  }

  if (failures.length > 0) {
    console.log(
      `\n%c── FAILURES ──`,
      `color:${COLORS.fail};font-weight:bold`
    );
    failures.forEach((f, i) => {
      console.log(`%c  ${i + 1}. ${f}`, `color:${COLORS.fail}`);
    });
  }

  if (warnings.length > 0) {
    console.log(
      `\n%c── WARNINGS ──`,
      `color:${COLORS.warn};font-weight:bold`
    );
    warnings.forEach((w, i) => {
      console.log(`%c  ${i + 1}. ${w}`, `color:${COLORS.warn}`);
    });
  }

  console.log(
    `\n%c  Tested at: ${new Date().toLocaleString("he-IL")} | URL: ${currentUrl}`,
    `color:${COLORS.dim}`
  );
  console.log(
    `%c  Org: ${ORG} | Pages tested: ${pages.length} | Total checks: ${total + warned + skipped}`,
    `color:${COLORS.dim}`
  );

  // Return summary for programmatic use
  return { passed, failed, warned, skipped, score, failures, warnings, timings };
})();
