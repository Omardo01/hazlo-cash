import WaitlistForm from "@/components/WaitlistForm";

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <div className="flex flex-col leading-none">
          <span className="text-xl font-black" style={{ color: "var(--brand-purple)" }}>
            Hazlo
          </span>
          <span className="text-2xl font-black italic" style={{ color: "var(--brand-purple)" }}>
            Cash
          </span>
        </div>
        <a
          href="#waitlist"
          className="text-sm font-semibold px-4 py-2 rounded-full text-white"
          style={{ backgroundColor: "var(--brand-purple)" }}
        >
          Únete
        </a>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-12 pb-16 max-w-2xl mx-auto w-full">
        <div
          className="inline-block text-xs font-bold tracking-widest px-4 py-1.5 rounded-full mb-6"
          style={{ backgroundColor: "#F5A62320", color: "var(--brand-orange)" }}
        >
          PRÓXIMAMENTE EN MÉXICO
        </div>

        <h1
          className="text-4xl sm:text-5xl font-black leading-tight mb-4"
          style={{ color: "var(--brand-dark)" }}
        >
          Recomienda lo que conoces.{" "}
          <span style={{ color: "var(--brand-purple)" }}>Gana dinero</span> por eso.
        </h1>

        <p className="text-lg text-gray-500 mb-8 max-w-md">
          Hazlo Cash convierte tus recomendaciones de boca en boca en ingresos reales.
          Cada vez que alguien use tu código, tú cobras.
        </p>

        {/* Waitlist form */}
        <WaitlistForm />

        <p className="text-xs text-gray-400 mt-3">
          Sin spam. Te avisamos cuando abramos en tu ciudad.
        </p>
      </section>

      {/* Tagline strip */}
      <div
        className="py-4 text-center text-sm font-bold tracking-widest text-white"
        style={{ backgroundColor: "var(--brand-teal)" }}
      >
        RECOMIENDA. GANA. CRECE.
      </div>

      {/* Cómo funciona */}
      <section className="px-6 py-16 max-w-5xl mx-auto w-full">
        <h2
          className="text-2xl sm:text-3xl font-black text-center mb-12"
          style={{ color: "var(--brand-dark)" }}
        >
          Así de simple funciona
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <Step
            number="01"
            title="Recomienda"
            description="Conoces una taquería, un plomero, una estilista. Comparte tu código único con quien lo necesite."
          />
          <Step
            number="02"
            title="Ellos contratan"
            description="Tu contacto usa tu código para contratar el servicio a través de Hazlo Cash. Tú no tienes que hacer nada más."
          />
          <Step
            number="03"
            title="Tú cobras"
            description="Cuando se confirma el servicio, tu comisión llega automáticamente a tu wallet. Retira cuando quieras."
          />
        </div>
      </section>

      {/* Para quién */}
      <section
        className="px-6 py-16"
        style={{ backgroundColor: "var(--brand-dark)" }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-center text-white mb-12">
            Para todos en la cadena
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <RoleCard
              emoji="🤝"
              role="Embajador"
              description="Ganas dinero recomendando negocios y servicios que ya conoces y en los que confías."
              accent="var(--brand-orange)"
            />
            <RoleCard
              emoji="🔍"
              role="Cliente"
              description="Encuentras servicios recomendados por gente real, con pagos protegidos dentro de la plataforma."
              accent="var(--brand-teal)"
            />
            <RoleCard
              emoji="🏪"
              role="Negocio"
              description="Recibes clientes nuevos sin gastar en publicidad. Solo pagas comisión cuando se cierra el trato."
              accent="#9B97FF"
            />
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 py-20 text-center max-w-xl mx-auto w-full">
        <h2
          className="text-3xl sm:text-4xl font-black mb-4"
          style={{ color: "var(--brand-dark)" }}
        >
          ¿Ya tienes a alguien en mente?
        </h2>
        <p className="text-gray-500 mb-8">
          Apúntate antes del lanzamiento y sé de los primeros en empezar a cobrar.
        </p>
        <a
          href="#waitlist"
          className="inline-block text-base font-bold px-8 py-4 rounded-full text-white"
          style={{ backgroundColor: "var(--brand-purple)" }}
        >
          Quiero ser Embajador
        </a>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-100 px-6 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Hazlo Cash · Villahermosa, Tabasco, México
      </footer>
    </main>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span
        className="text-4xl font-black leading-none"
        style={{ color: "var(--brand-orange)" }}
      >
        {number}
      </span>
      <h3 className="text-lg font-black" style={{ color: "var(--brand-dark)" }}>
        {title}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function RoleCard({
  emoji,
  role,
  description,
  accent,
}: {
  emoji: string;
  role: string;
  description: string;
  accent: string;
}) {
  return (
    <div className="bg-white/5 rounded-2xl p-6 flex flex-col gap-3">
      <span className="text-3xl">{emoji}</span>
      <h3 className="text-lg font-black" style={{ color: accent }}>
        {role}
      </h3>
      <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
}
