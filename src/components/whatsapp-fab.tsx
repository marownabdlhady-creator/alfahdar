import { CONTACT } from "@/lib/contact";

/** Always-there WhatsApp shortcut. Sits at the RTL end corner (bottom
    left), above page content but below the mobile menu (z-60) and the
    gallery lightbox (z-70), so neither of those has to work around it.

    The number and the prefilled Arabic message live in src/lib/contact.ts. */
export function WhatsappFab() {
  return (
    /* The wrapper carries the entrance so the anchor keeps its transform
       free for the hover lift. */
    <div className="fab-in fixed end-5 bottom-5 z-40">
      <a
        href={CONTACT.whatsapp.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل عبر واتساب"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-ink shadow-[0_12px_30px_-10px_rgba(13,13,13,0.55)] transition-[transform,background-color] duration-fast ease-out hover:scale-105 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7"
        >
          <path d="M20.5 11.7a8.5 8.5 0 0 1-12.4 7.6L3.5 20.5l1.3-4.5A8.5 8.5 0 1 1 20.5 11.7Z" />
          <path d="M9 9.4c.3 2.6 2.6 4.9 5.2 5.2.5 0 1-.4 1-1v-.7l-1.8-.6-.8.8a6.4 6.4 0 0 1-2.1-2.1l.8-.8-.6-1.8h-.7c-.6 0-1 .4-1 1Z" />
        </svg>
      </a>
    </div>
  );
}
