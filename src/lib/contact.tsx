// WhatsApp number for the chat links: digits only, with country code and no "+" (for example 919876543210).
// While this is empty the links open WhatsApp without a recipient, so set it before publishing.
export const whatsappNumber = "";

export const whatsappLink = (text: string) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

export const whatsappGreeting = "Hello Paari Seritech, I would like to know more about your smart sericulture solutions.";

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z" />
      <path
        fill="#25D366"
        d="M9 7.5c.3-.3.8-.3 1 .1l.8 1.5c.1.3.1.6-.1.8l-.6.7c.6 1.1 1.5 2 2.6 2.6l.7-.6c.2-.2.5-.3.8-.1l1.5.8c.4.2.4.7.1 1l-.8.8c-.5.5-1.3.7-2 .5-3.2-1-5.7-3.5-6.7-6.7-.2-.7 0-1.5.5-2z"
      />
    </svg>
  );
}
