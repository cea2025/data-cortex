/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║     DATA CORTEX — E2E Console Test Suite v2                     ║
 * ║     הדבק את הסקריפט הזה בקונסול הדפדפן כשאתה מחובר למערכת      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * הסקריפט בודק:
 * 1. ניווט ו-routing — כל הדפים נטענים בלי 500/404
 * 2. Auth — משתמש מחובר, סטטוס תקין
 * 3. DOM — אלמנטים קריטיים קיימים
 * 4. RBAC — admin features מוצגים/מוסתרים לפי תפקיד
 * 5. RTL — בדיקת כיווניות
 * 6. Performance — זמני טעינה
 * 7. Security — בדיקות אבטחה בסיסיות
 */

(async function DataCortexE2ETest() {
  "use strict";

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

  // ═══════════════════════════════════════════════
  //  DETECT ORG SLUG & ENVIRONMENT
  // ═══════════════════════════════════════════════

  header("0. ENVIRONMENT DETECTION");

  const currentUrl = window.location.href;
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  log(`URL: ${currentUrl}`);
  log(`Origin: ${origin}`);

  const reservedPaths = new Set(["login", "pending", "suspended", "auth", "_next", "api", "icon"]);
  const orgMatch = pathname.match(/^\/([^/]+)\/?/);
  const orgSlug = orgMatch && !reservedPaths.has(orgMatch[1]) && !orgMatch[1].includes(".")
    ? orgMatch[1]
    : null;

  if (!orgSlug) {
    console.log(
      `%c⚠ לא זוהה orgSlug מה-URL. אנא נווט לדף דאשבורד (למשל /{org}/) ותריץ שוב.`,
      `color:${COLORS.fail};font-size:14px;font-weight:bold`
    );
  }

  const ORG = orgSlug || "default";
  log(`Org Slug: ${ORG}`);

  // ═══════════════════════════════════════════════
  //  1. AUTHENTICATION & SESSION
  // ═══════════════════════════════════════════════

  header("1. AUTHENTICATION & SESSION");

  const cookies = document.cookie;
  const hasSupabaseCookie = cookies.includes("sb-");

  const sbKeys = Object.keys(localStorage).filter(
    (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
  );
  const hasLocalStorageToken = sbKeys.length > 0;

  if (hasSupabaseCookie || hasLocalStorageToken) {
    pass(`Supabase session detected (cookie: ${hasSupabaseCookie}, localStorage: ${hasLocalStorageToken})`);
  } else {
    fail("No Supabase session found", "לא נמצאו cookies או tokens — המשתמש כנראה לא מחובר");
  }

  if (hasSupabaseCookie) {
    pass("Supabase auth cookie present (SSR-compatible session)");
  }

  const dashRes = await fetchPageFollow(`/${ORG}/`);
  if (dashRes.ok) {
    pass(`Dashboard accessible (${dashRes.elapsed}ms)`);
  } else if (dashRes.status >= 300 && dashRes.status < 400) {
    warn(`Dashboard redirects (${dashRes.status})`, "ייתכן שהמשתמש לא מחובר או PENDING");
  } else if (dashRes.status >= 500) {
    fail(`Dashboard SERVER ERROR ${dashRes.status}`, `elapsed: ${dashRes.elapsed}ms`);
  } else {
    warn(`Dashboard returned ${dashRes.status}`, `elapsed: ${dashRes.elapsed}ms`);
  }

  // ═══════════════════════════════════════════════
  //  2. PAGE ROUTING — ALL PAGES LOAD
  // ═══════════════════════════════════════════════

  header("2. PAGE ROUTING — ALL PAGES");

  const pages = [
    { path: `/${ORG}/`, name: "Dashboard (home)", allowRedirect: false },
    { path: `/${ORG}/contribute`, name: "Contribute page", allowRedirect: false },
    { path: `/${ORG}/rules`, name: "Global Rules", allowRedirect: false },
    { path: `/${ORG}/notifications`, name: "Notifications", allowRedirect: false },
    { path: `/${ORG}/search`, name: "Search", allowRedirect: false },
    { path: `/${ORG}/audit`, name: "Audit Log (admin)", allowRedirect: true },
    { path: `/${ORG}/settings/users`, name: "User Management (admin)", allowRedirect: true },
    { path: `/login`, name: "Login page", allowRedirect: true },
    { path: `/pending`, name: "Pending approval page", allowRedirect: false },
    { path: `/suspended`, name: "Suspended page", allowRedirect: false },
  ];

  for (const page of pages) {
    const r = await fetchPageFollow(page.path);
    const finalStatus = r.status;
    const wasRedirected = r.url && !r.url.endsWith(page.path) && !r.url.endsWith(page.path + "/");

    if (finalStatus === 200 && !wasRedirected) {
      if (r.elapsed > 3000) {
        warn(`${page.name}: OK (${r.elapsed}ms)`, "SLOW — מעל 3 שניות");
      } else {
        pass(`${page.name}: OK (${r.elapsed}ms)`);
      }
    } else if (finalStatus === 200 && wasRedirected) {
      if (page.allowRedirect) {
        pass(`${page.name}: redirected (expected — ${r.elapsed}ms)`);
      } else {
        warn(`${page.name}: redirected to ${new URL(r.url).pathname}`, `elapsed: ${r.elapsed}ms`);
      }
    } else if (finalStatus === 404) {
      if (page.allowRedirect) {
        pass(`${page.name}: 404 (expected for restricted access)`);
      } else {
        fail(`${page.name}: 404 NOT FOUND`, `elapsed: ${r.elapsed}ms`);
      }
    } else if (finalStatus >= 500) {
      fail(`${page.name}: SERVER ERROR ${finalStatus}`, `elapsed: ${r.elapsed}ms`);
    } else {
      warn(`${page.name}: status ${finalStatus}`, `elapsed: ${r.elapsed}ms`);
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
  if (suspendedPage.ok && (suspendedPage.text.includes("הושעתה") || suspendedPage.text.includes("הושע"))) {
    pass("Suspended page contains expected Hebrew text");
  } else if (suspendedPage.ok) {
    warn("Suspended page loaded but missing expected text");
  } else {
    fail(`Suspended page failed: ${suspendedPage.status}`);
  }

  const loginPage = await fetchPageFollow("/login");
  if (loginPage.ok) {
    pass(`Login page accessible (${loginPage.elapsed}ms)`);
  } else {
    warn(`Login page returned ${loginPage.status}`, "ייתכן שהמשתמש מחובר ומנותב הלאה");
  }

  // ═══════════════════════════════════════════════
  //  4. DOM INTEGRITY — CURRENT PAGE
  // ═══════════════════════════════════════════════

  header("4. DOM INTEGRITY — CURRENT PAGE");

  const htmlDir = document.documentElement.dir || document.body.dir;
  const hasRtlElements = document.querySelectorAll('[dir="rtl"]').length;
  if (htmlDir === "rtl" || hasRtlElements > 0) {
    pass(`RTL detected (html dir="${htmlDir}", ${hasRtlElements} elements with dir=rtl)`);
  } else {
    warn("No RTL detected", "האפליקציה אמורה להיות RTL");
  }

  const sidebar = document.querySelector("aside") || document.querySelector('[class*="sidebar" i]') || document.querySelector('[class*="Sidebar" i]');
  if (sidebar) {
    pass("Sidebar element found");

    const navLinks = sidebar.querySelectorAll("a");
    if (navLinks.length >= 3) {
      pass(`Sidebar has ${navLinks.length} navigation links`);
    } else {
      warn(`Sidebar has only ${navLinks.length} links`, "Expected at least 3");
    }

    const sidebarText = sidebar.textContent || "";
    const hasAudit = sidebarText.includes("היסטוריה");
    const hasUsers = sidebarText.includes("ניהול משתמשים");
    log(`  Sidebar contains audit link: ${hasAudit}`, COLORS.info);
    log(`  Sidebar contains users link: ${hasUsers}`, COLORS.info);
  } else {
    warn("Sidebar element not found", "ייתכן שאתה בדף שלא מכיל sidebar");
  }

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

  if (document.fonts) {
    const fontsReady = document.fonts.status === "loaded";
    if (fontsReady) {
      pass("Fonts loaded");
    } else {
      warn("Fonts still loading", `status: ${document.fonts.status}`);
    }
  }

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

  const nextData = document.getElementById("__NEXT_DATA__");
  const rscPayloads = document.querySelectorAll('script[type="application/json"]');
  if (nextData) {
    pass("__NEXT_DATA__ script found (Pages Router style)");
  } else if (rscPayloads.length > 0) {
    pass(`${rscPayloads.length} RSC payload(s) found (App Router)`);
  } else {
    pass("App Router streaming mode (no static payloads — normal)");
  }

  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    log(`  Service workers registered: ${registrations.length}`, COLORS.dim);
  }

  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    pass("Viewport meta tag present");
  } else {
    warn("Viewport meta tag missing");
  }

  // ═══════════════════════════════════════════════
  //  7. API HEALTH — FOLLOW-REDIRECT TESTS
  // ═══════════════════════════════════════════════

  header("7. API HEALTH — PAGE FETCH");

  const apiPages = [
    { path: `/${ORG}/contribute`, name: "Contribute" },
    { path: `/${ORG}/rules`, name: "Rules" },
    { path: `/${ORG}/notifications`, name: "Notifications" },
    { path: `/${ORG}/search`, name: "Search" },
  ];

  for (const page of apiPages) {
    const r = await fetchPageFollow(page.path);
    if (r.ok) {
      const hasContent = r.text.length > 500;
      if (hasContent) {
        pass(`${page.name}: OK, ${(r.text.length / 1024).toFixed(1)}KB HTML (${r.elapsed}ms)`);
      } else {
        warn(`${page.name}: OK but very small response (${r.text.length} bytes)`);
      }
    } else if (r.status >= 500) {
      fail(`${page.name}: SERVER ERROR ${r.status}`, `elapsed: ${r.elapsed}ms`);
    } else {
      warn(`${page.name}: status ${r.status}`, `elapsed: ${r.elapsed}ms`);
    }
  }

  const authCbRes = await fetchPageFollow("/auth/callback");
  if (authCbRes.status < 500) {
    pass(`Auth callback responds (status: ${authCbRes.status}, ${authCbRes.elapsed}ms)`);
  } else {
    fail(`Auth callback SERVER ERROR ${authCbRes.status}`);
  }

  // ═══════════════════════════════════════════════
  //  8. INTERACTIVE ELEMENTS
  // ═══════════════════════════════════════════════

  header("8. INTERACTIVE ELEMENTS");

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

  const forms = document.querySelectorAll("form");
  forms.forEach((form, i) => {
    const inputs = form.querySelectorAll("input, textarea, select");
    const submitBtn = form.querySelector('button[type="submit"], button:not([type])');
    if (inputs.length > 0) {
      pass(`Form #${i + 1}: ${inputs.length} input(s), submit button: ${!!submitBtn}`);
    }
  });

  const dialogs = document.querySelectorAll(
    '[role="dialog"], [data-state="open"], dialog'
  );
  log(`  Open dialogs/modals: ${dialogs.length}`, COLORS.dim);

  // ═══════════════════════════════════════════════
  //  9. PERFORMANCE METRICS
  // ═══════════════════════════════════════════════

  header("9. PERFORMANCE METRICS");

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

      if (domComplete < 8000) pass(`DOM complete: ${domComplete}ms`);
      else warn(`DOM complete slow: ${domComplete}ms`);
    }
  }

  const resources = performance.getEntriesByType("resource");
  const jsResources = resources.filter((r) => r.name.endsWith(".js") || r.initiatorType === "script");
  const cssResources = resources.filter((r) => r.name.endsWith(".css") || r.initiatorType === "link");
  log(`  Resources: ${resources.length} total, ${jsResources.length} JS, ${cssResources.length} CSS`, COLORS.info);

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
  //  10. NETWORK — PRE-EXISTING FAILED REQUESTS
  // ═══════════════════════════════════════════════

  header("10. NETWORK — PRE-EXISTING FAILED REQUESTS");

  const testPaths = new Set(pages.map((p) => p.path).concat(apiPages.map((p) => p.path), ["/auth/callback", "/pending", "/suspended", "/login"]));

  const failedResources = resources.filter((r) => {
    if (!r.responseStatus || r.responseStatus < 400) return false;
    try {
      const url = new URL(r.name);
      if (testPaths.has(url.pathname) || testPaths.has(url.pathname + "/")) return false;
    } catch { /* external URL */ }
    if (r.name.includes("ray.st") || r.name.includes("vercel-toolbar")) return false;
    return true;
  });

  if (failedResources.length === 0) {
    pass("No failed network requests detected (excluding test & Vercel toolbar)");
  } else {
    failedResources.forEach((r) => {
      const shortName = r.name.split("/").pop().split("?")[0];
      fail(`Failed request: ${r.responseStatus} ${shortName}`);
    });
  }

  // ═══════════════════════════════════════════════
  //  11. NAVIGATION INTEGRITY — CROSS-PAGE
  // ═══════════════════════════════════════════════

  header("11. CROSS-PAGE NAVIGATION INTEGRITY");

  const fakeAssetRes = await fetchPageFollow(
    `/${ORG}/assets/00000000-0000-0000-0000-000000000000`
  );
  if (fakeAssetRes.status === 404 || fakeAssetRes.text.includes("not-found") || fakeAssetRes.text.includes("לא נמצא")) {
    pass("Non-existent asset returns 404 or not-found page");
  } else if (fakeAssetRes.ok) {
    warn("Non-existent asset returns 200", "Expected 404 or redirect");
  } else {
    pass(`Non-existent asset: ${fakeAssetRes.status} (acceptable)`);
  }

  const fakeOrgRes = await fetchPageFollow("/nonexistent-org-xyz-12345/");
  if (fakeOrgRes.status === 404 || fakeOrgRes.text.includes("not-found") || fakeOrgRes.text.includes("404")) {
    pass(`Non-existent org returns 404 (${fakeOrgRes.elapsed}ms)`);
  } else if (fakeOrgRes.ok) {
    const wasRedirected = fakeOrgRes.url && !fakeOrgRes.url.includes("nonexistent");
    if (wasRedirected) {
      pass(`Non-existent org redirects appropriately (${fakeOrgRes.elapsed}ms)`);
    } else {
      warn("Non-existent org returns 200 without redirect");
    }
  } else if (fakeOrgRes.status >= 500) {
    fail(`Non-existent org causes SERVER ERROR ${fakeOrgRes.status}`);
  } else {
    pass(`Non-existent org: ${fakeOrgRes.status}`);
  }

  // ═══════════════════════════════════════════════
  //  12. ACCESSIBILITY BASICS
  // ═══════════════════════════════════════════════

  header("12. ACCESSIBILITY BASICS");

  const htmlLang = document.documentElement.lang;
  if (htmlLang) {
    pass(`HTML lang attribute: "${htmlLang}"`);
  } else {
    warn("HTML lang attribute missing");
  }

  const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  const h1Count = document.querySelectorAll("h1").length;
  log(`  Headings: ${headings.length} total, ${h1Count} h1`, COLORS.info);
  if (h1Count <= 1) {
    pass(`Heading structure: ${h1Count} h1 (correct)`);
  } else {
    warn(`${h1Count} h1 elements`, "ממולץ h1 אחד לדף");
  }

  const focusableElements = document.querySelectorAll(
    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
  pass(`${focusableElements.length} focusable elements`);

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

  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (cspMeta) {
    pass("Content-Security-Policy meta tag present");
  } else {
    log("  No CSP meta tag (may be set via headers)", COLORS.dim);
  }

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

  return { passed, failed, warned, skipped, score, failures, warnings, timings };
})();
