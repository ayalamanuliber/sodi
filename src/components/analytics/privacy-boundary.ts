/** Public demo routes contain fictitious/local data; every other wedding route is private. */
export function isPrivateAnalyticsUrl(value: string, base = "https://sodi.com.ar") {
  try {
    const url = new URL(value, base);
    const path = decodeURIComponent(url.pathname).replace(/\/+$/, "") || "/";
    if (/^\/(?:invitacion|api)(?:\/|$)/.test(path)) return true;
    if (path.startsWith("/boda/") && !["/boda/prueba", "/boda/prueba/panel"].includes(path)) return true;
    return [...url.searchParams.keys()].some((key) => /^(?:i|code|token|email|nombre|phone|telefono|password)$/i.test(key)) || Boolean(url.hash && /(?:token|invite|code)=/i.test(url.hash));
  } catch { return true; }
}

/** Install before any tracker. Crossing the boundary gets a fresh document, not an SPA view.
 * Removing React Script components cannot unload SDK listeners already installed by vendors.
 * Capture links before Next handles them; history interception also covers router.push/replace.
 * As no history entry crosses the boundary in this document, back/forward restores separate
 * documents (including bfcache), rather than reusing a public document's loaded SDKs.
 */
export function installAnalyticsNavigationBoundary(target: Window) {
  const documentIsPrivate = isPrivateAnalyticsUrl(target.location.href);
  function crosses(url?: string | URL | null) {
    if (url == null) return false;
    const destination = new URL(String(url), target.location.href);
    return destination.origin === target.location.origin && isPrivateAnalyticsUrl(destination.href) !== documentIsPrivate;
  }
  for (const method of ["pushState", "replaceState"] as const) {
    type HistoryMethod = History[typeof method];
    const wrap = (next: HistoryMethod): HistoryMethod => function (this: History, data, unused, url) {
      if (crosses(url)) {
        const destination = new URL(String(url), target.location.href).href;
        if (method === "pushState") target.location.assign(destination);
        else target.location.replace(destination);
        return;
      }
      next.call(this, data, unused, url);
    };
    let guarded = wrap(target.history[method]);
    Object.defineProperty(target.history, method, {
      configurable: true,
      get: () => guarded,
      // Vendors often wrap history after loading. Keep our check OUTSIDE their
      // wrapper so even a vendor that inspects the URL argument before invoking
      // the original method never receives a private destination.
      set: (next: HistoryMethod) => { guarded = wrap(next); },
    });
  }
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const element = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!(element instanceof HTMLAnchorElement) || element.target && element.target !== "_self" || element.hasAttribute("download")) return;
    if (crosses(element.href)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      target.location.assign(element.href);
    }
  };
  target.document.addEventListener("click", onClick, true);
  return () => {
    target.document.removeEventListener("click", onClick, true);
    // Do not remove a wrapper installed afterwards by Next or a vendor.
    // This guard deliberately lives for the whole document, matching SDK lifetime.
  };
}
