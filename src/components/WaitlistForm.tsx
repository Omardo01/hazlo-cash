"use client";

export default function WaitlistForm({ dark = false }: { dark?: boolean }) {
  return (
    <form
      id="waitlist"
      className="flex flex-col sm:flex-row gap-3 w-full max-w-md"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="tel"
        placeholder="Tu número de WhatsApp"
        className={`flex-1 rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#FE7801] ${
          dark
            ? "bg-white/10 border border-white/20 text-white placeholder:text-white/40 backdrop-blur-md focus:ring-offset-transparent"
            : "border border-gray-200 text-foreground"
        }`}
      />
      <button
        type="submit"
        className="text-sm font-bold px-6 py-3 rounded-full text-white whitespace-nowrap cursor-pointer hover:opacity-90 transition-opacity"
        style={{ background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)" }}
      >
        Quiero entrar
      </button>
    </form>
  );
}
