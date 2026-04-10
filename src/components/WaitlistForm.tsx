"use client";

export default function WaitlistForm() {
  return (
    <form
      id="waitlist"
      className="flex flex-col sm:flex-row gap-3 w-full max-w-md"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="tel"
        placeholder="Tu número de WhatsApp"
        className="flex-1 border border-gray-200 rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#2D2B8F]"
      />
      <button
        type="submit"
        className="text-sm font-bold px-6 py-3 rounded-full text-white whitespace-nowrap cursor-pointer"
        style={{ backgroundColor: "var(--brand-orange)" }}
      >
        Quiero entrar
      </button>
    </form>
  );
}
