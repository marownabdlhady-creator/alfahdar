/** Brings a node into view. Callers give the target its own `scroll-mt-*`
    so the fixed header never sits over it, and reduced motion drops the
    smooth easing rather than the scroll itself. */
export function scrollIntoViewSafely(node: HTMLElement | null) {
  if (!node) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  node.scrollIntoView({
    behavior: reduced ? "auto" : "smooth",
    block: "start",
  });
}
