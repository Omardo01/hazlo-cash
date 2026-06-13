import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F3F0]">
      {/* Fondo decorativo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #2D2B8F 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #00A896 0%, transparent 70%)" }}
        />
      </div>

      {/* Header minimal */}
      <header className="relative z-10 flex items-center justify-center pt-8 pb-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/hazlo.svg" alt="Hazlo Cash" width={32} height={32} className="h-8 w-8" />
          <span className="text-[15px] font-black tracking-tight text-brand-dark">
            Hazlo <span className="text-brand-gradient">Cash</span>
          </span>
        </Link>
      </header>

      {/* Contenido */}
      <main className="relative z-10 flex-1 flex items-start justify-center px-4 pt-6 pb-12">
        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center pb-6">
        <p className="text-[11px] text-muted-foreground">
          Al continuar aceptas nuestros{" "}
          <Link href="/terminos" className="underline underline-offset-2 hover:text-foreground transition-colors">
            Términos de servicio
          </Link>{" "}
          y{" "}
          <Link href="/privacidad" className="underline underline-offset-2 hover:text-foreground transition-colors">
            Política de privacidad
          </Link>
          .
        </p>
      </footer>
    </div>
  );
}
