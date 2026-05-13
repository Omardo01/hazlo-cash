"use client";

import Image from "next/image";
import WaitlistForm from "@/components/WaitlistForm";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  Share2,
  ShoppingBag,
  Wallet,
  Star,
  Building2,
  Users,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Mail,
} from "lucide-react";

/* ─── datos ─────────────────────────────────────────────── */

const steps = [
  {
    icon: Share2,
    step: "01",
    title: "Comparte tu código",
    description:
      "Conoces una taquería increíble, un plomero confiable, una estilista top. Comparte tu QR o link con quien lo necesite.",
    bg: "bg-[#1A1840]/10",
    text: "text-[#1A1840]",
    label: "text-[#1A1840]",
  },
  {
    icon: ShoppingBag,
    step: "02",
    title: "Ellos contratan",
    description:
      "Tu contacto usa tu código para contratar el servicio dentro de Hazlo Cash. Tú no tienes que hacer nada más.",
    bg: "bg-[#E55000]/10",
    text: "text-[#E55000]",
    label: "text-[#E55000]",
  },
  {
    icon: Wallet,
    step: "03",
    title: "Tú cobras",
    description:
      "Cuando se confirma el servicio, tu comisión llega automáticamente a tu wallet. Retira cuando quieras.",
    bg: "bg-[#F5A623]/10",
    text: "text-[#F5A623]",
    label: "text-[#F5A623]",
  },
];

const roles = [
  {
    icon: Star,
    role: "Embajador",
    tagline: "Ganas recomendando",
    description:
      "Recomienda negocios y servicios que ya conoces. Cada recomendación exitosa se convierte en dinero real en tu wallet.",
    accent: "#F5A623",
  },
  {
    icon: Users,
    role: "Cliente",
    tagline: "Encuentras con confianza",
    description:
      "Accede a servicios recomendados por gente real. Con reseñas verificadas, pagos protegidos y beneficios exclusivos.",
    accent: "#E55000",
  },
  {
    icon: Building2,
    role: "Negocio",
    tagline: "Creces sin gastar en ads",
    description:
      "Recibe clientes nuevos por recomendación real. Solo pagas comisión cuando el servicio se concreta. Cero riesgo.",
    accent: "#FFFFFF",
  },
];

const tacoSteps = [
  {
    label: "1",
    title: "Omar conoce una taquería increíble",
    description:
      "Va seguido a «Tacos El Güero» y sabe que son los mejores de la colonia. Los recomienda en Hazlo Cash.",
    color: "#2D2B8F",
  },
  {
    label: "2",
    title: "Le comparte su código a un amigo",
    description:
      "Le manda su QR por WhatsApp: «Prueba estos tacos, ve de mi parte y te dan una coca gratis.»",
    color: "#00A896",
  },
  {
    label: "3",
    title: "El amigo va, come y paga en la plataforma",
    description:
      "Llega a la taquería, da el código de Omar, recibe su beneficio, y la transacción se registra automáticamente.",
    color: "#F5A623",
  },
  {
    label: "$",
    title: "Omar recibe su comisión. Todos ganan.",
    description:
      "La taquería ganó un cliente. El amigo comió increíble con beneficio extra. Omar cobró por recomendar. Hazlo Cash facilitó todo.",
    color: "#2D2B8F",
  },
];

/* ─── page ─────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen bg-white overflow-hidden">
      <Nav />
      <HeroSection />
      <TaglineStrip />
      <ComoFunciona />
      <ParaQuien />
      <HistoriaTacos />
      <CTAFinal />
      <Footer />
    </main>
  );
}

/* ─── Nav ────────────────────────────────────────────────── */

function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
        scrolled
          ? "bg-white/95 border-border/50"
          : "bg-black/20 border-white/10"
      }`}
    >
      <div className="flex items-center justify-between px-4 sm:px-8 py-3 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Image src="/hazlo.svg" alt="Hazlo Cash" width={32} height={32} className="h-8 w-8 shrink-0" />
          <div className="flex flex-col leading-none">
            <span className={`text-[14px] font-black tracking-tight transition-colors duration-300 ${scrolled ? "text-brand-dark" : "text-white"}`}>
              Hazlo <span className="text-brand-gradient">Cash</span>
            </span>
            <span className="text-[9px] font-bold text-brand-gradient tracking-widest uppercase">
              Recomienda y gana
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="#como-funciona"
            className={`hidden sm:block text-sm font-medium transition-colors duration-300 ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/70 hover:text-white"}`}
          >
            ¿Cómo funciona?
          </a>
          <a
            href="#waitlist"
            className="text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-white hover:opacity-90 transition-opacity whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)" }}
          >
            Únete
          </a>
        </div>
      </div>
    </motion.nav>
  );
}

/* ─── Hero — patrón glowy-waves-hero ────────────────────── */

const WAVES = [
  { offset: 0,              amplitude: 80,  frequency: 0.0028, color: "#F5A623", opacity: 0.55 },
  { offset: Math.PI / 2,   amplitude: 100, frequency: 0.0022, color: "#E55000", opacity: 0.40 },
  { offset: Math.PI,       amplitude: 65,  frequency: 0.0035, color: "#FFC044", opacity: 0.35 },
  { offset: Math.PI * 1.5, amplitude: 85,  frequency: 0.0018, color: "#FF8C00", opacity: 0.25 },
];

const heroVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, staggerChildren: 0.13 },
  },
};
const heroItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let time = 0;
    const smooth = 0.08;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const c = { x: canvas.width / 2, y: canvas.height / 2 };
      mouseRef.current = c;
      targetRef.current = c;
    };

    const onMove = (e: MouseEvent) => { targetRef.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = () => { targetRef.current = { x: canvas.width / 2, y: canvas.height / 2 }; };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    const draw = () => {
      time++;
      mouseRef.current.x += (targetRef.current.x - mouseRef.current.x) * smooth;
      mouseRef.current.y += (targetRef.current.y - mouseRef.current.y) * smooth;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      WAVES.forEach((wave) => {
        ctx.save();
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 3) {
          const dx = x - mouseRef.current.x;
          const dy = canvas.height / 2 - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const inf = Math.max(0, 1 - dist / 280) * 60 *
            Math.sin(time * 0.001 + x * 0.01 + wave.offset);
          const y =
            canvas.height / 2 +
            Math.sin(x * wave.frequency + time * 0.002 + wave.offset) * wave.amplitude +
            Math.sin(x * wave.frequency * 0.4 + time * 0.003) * (wave.amplitude * 0.4) +
            inf;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = wave.color;
        ctx.globalAlpha = wave.opacity;
        ctx.shadowBlur = 40;
        ctx.shadowColor = wave.color;
        ctx.stroke();
        ctx.restore();
      });

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden">
      {/* Canvas de ondas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

      {/* Capa de oscurecimiento central para legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 pointer-events-none" />

      {/* Contenido */}
      <motion.div
        variants={heroVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center px-5 sm:px-8 py-32 max-w-4xl mx-auto w-full"
      >
        {/* Logo */}
        <motion.div variants={heroItem} className="mb-5">
          <Image
            src="/hazlo-nobg-whi.png"
            alt="Hazlo Cash"
            width={480}
            height={200}
            className="h-32 sm:h-44 w-auto"
            priority
          />
        </motion.div>

        {/* Badge */}
        <motion.div variants={heroItem}>
          <span className="inline-flex items-center gap-2 mb-6 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 text-[11px] font-bold tracking-widest text-white/90 uppercase">
            <motion.span
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-[#F5A623] inline-block"
            />
            Próximamente en México
          </span>
        </motion.div>

        {/* Titular */}
        <motion.h1
          variants={heroItem}
          className="text-[2rem] sm:text-5xl lg:text-[5rem] font-black leading-[1.05] tracking-tight text-white mb-5"
        >
          Tu recomendación
          <br />
          <span className="relative inline-block">
            <span
              className="relative z-10"
              className="text-brand-gradient"
            >
              vale dinero
            </span>
          </span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          variants={heroItem}
          className="text-base sm:text-lg text-white/70 max-w-lg leading-relaxed mb-8"
        >
          Hazlo Cash convierte el boca en boca en ingresos reales.
          Recomienda negocios que ya conoces — cada vez que alguien use tu código,{" "}
          <strong className="text-white">tú cobras.</strong>
        </motion.p>

        {/* Waitlist form */}
        <motion.div
          variants={heroItem}
          id="waitlist"
          className="w-full max-w-md scroll-mt-40 mb-3"
        >
          <WaitlistForm dark />
        </motion.div>

        <motion.p variants={heroItem} className="text-[11px] text-white/40 mb-10">
          Sin spam · Te avisamos cuando abramos en tu ciudad
        </motion.p>

        {/* Stats — patrón new-hero-section */}
        <motion.div
          variants={heroItem}
          className="grid grid-cols-3 gap-0 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden w-full max-w-sm sm:max-w-md"
        >
          {[
            { value: "+480", label: "En lista de espera" },
            { value: "3", label: "Ciudades objetivo" },
            { value: "100%", label: "Sin costo de entrada" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center py-4 px-2 ${i < 2 ? "border-r border-white/10" : ""}`}
            >
              <span className="text-xl sm:text-2xl font-black text-white">{stat.value}</span>
              <span className="text-[10px] text-white/50 mt-0.5 text-center leading-tight">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── Tagline strip ──────────────────────────────────────── */

function TaglineStrip() {
  return (
    <div
      className="relative py-5 text-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0A0A0A 0%, #1A1000 50%, #0A0A0A 100%)",
        borderTop: "1px solid rgba(245,166,35,0.2)",
        borderBottom: "1px solid rgba(245,166,35,0.2)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
      <p className="relative text-sm sm:text-base font-black tracking-[0.3em] text-white/90">
        RECOMIENDA · GANA · CRECE
      </p>
    </div>
  );
}

/* ─── Cómo funciona ──────────────────────────────────────── */

function ComoFunciona() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      id="como-funciona"
      ref={ref}
      className="px-4 sm:px-8 py-14 sm:py-24 scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="text-[11px] font-bold tracking-widest text-brand-gradient uppercase">
            Así de fácil
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-dark mt-2">
            Tres pasos. Cero complicaciones.
          </h2>
        </motion.div>

        {/* Feature cards — patrón feature-cards-block */}
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.15, duration: 0.5, ease: "easeOut" }}
            >
              <Card className="group cursor-default border border-border/50 bg-background/50 p-5 sm:p-8 backdrop-blur-xl transition-all duration-500 hover:border-border hover:shadow-lg hover:-translate-y-1 h-full">
                <div
                  className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${step.bg} transition-all duration-300 group-hover:scale-110`}
                >
                  <step.icon className={`h-6 w-6 ${step.text}`} />
                </div>
                <span
                  className={`text-[11px] font-bold tracking-widest ${step.label} uppercase`}
                >
                  PASO {step.step}
                </span>
                <h3 className="mt-2 mb-3 text-xl font-black text-brand-dark tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Para quién ─────────────────────────────────────────── */

function ParaQuien() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      className="relative px-4 sm:px-8 py-14 sm:py-24 overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0A0A0A 0%, #1C0E00 50%, #0A0A0A 100%)",
      }}
    >
      <div className="pointer-events-none absolute top-10 right-10 h-64 w-64 rounded-full bg-[#F5A623]/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-20 h-48 w-48 rounded-full bg-[#E55000]/10 blur-3xl" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-[11px] font-bold tracking-widest text-brand-gradient uppercase">
            Todos ganan
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
            Para todos en la cadena
          </h2>
        </motion.div>

        {/* Glassmorphism cards — patrón glassmorphism-cta-block */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {roles.map((role, index) => (
            <motion.div
              key={role.role}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="h-full"
            >
              <div className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-7 flex flex-col gap-4 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 h-full">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: `${role.accent}22`,
                    color: role.accent,
                  }}
                >
                  <role.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3
                    className="text-lg font-black"
                    style={{ color: role.accent }}
                  >
                    {role.role}
                  </h3>
                  <p className="text-[11px] font-semibold text-white/50 tracking-wide uppercase mt-0.5">
                    {role.tagline}
                  </p>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">
                  {role.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Historia de los tacos ───────────────────────────────── */

const tacoCards = [
  {
    step: "01",
    tag: "El Recomendador",
    emoji: "🌮",
    title: "Omar conoce una taquería increíble",
    description: "Va seguido a «Tacos El Güero» y los registra en Hazlo Cash. Activa su código personal.",
    color: "#1A1840",
    bg: "from-[#1A1840]/8 to-[#1A1840]/3",
    scene: (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-[#1A1840]/10 flex items-center justify-center text-lg">🌮</div>
          <div>
            <div className="h-2.5 w-24 rounded-full bg-[#1A1840]/15" />
            <div className="h-2 w-16 rounded-full bg-gray-200 mt-1.5" />
          </div>
        </div>
        <div className="mt-1 rounded-xl border border-[#1A1840]/10 bg-white p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-[#1A1840]">Tacos El Güero</div>
            <div className="text-[9px] text-gray-400 mt-0.5">Código activo · HAZLO-TG42</div>
          </div>
          <div className="h-7 w-7 rounded-lg bg-[#FE7801] flex items-center justify-center">
            <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: "02",
    tag: "La Recomendación",
    emoji: "📲",
    title: "Comparte su código por WhatsApp",
    description: "«Prueba estos tacos, ve de mi parte y te dan una coca gratis.» Un QR. Dos segundos.",
    color: "#E55000",
    bg: "from-[#E55000]/8 to-[#E55000]/3",
    scene: (
      <div className="flex flex-col gap-2">
        <div className="self-end rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]" style={{ background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)" }}>
          <p className="text-[10px] text-white font-medium leading-relaxed">
            Prueba los tacos 🌮<br />Usa mi código y te dan una <strong>coca gratis</strong>
          </p>
        </div>
        <div className="self-end rounded-2xl rounded-tr-sm px-3 py-1.5 max-w-[60%]" style={{ background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)" }}>
          <p className="text-[10px] text-white font-bold tracking-wider">HAZLO-TG42 ✅</p>
        </div>
        <div className="text-[9px] text-gray-400 self-end">Enviado · WhatsApp</div>
      </div>
    ),
  },
  {
    step: "03",
    tag: "El Cliente",
    emoji: "🧾",
    title: "El amigo va, come y paga en la plataforma",
    description: "Da el código en la caja, recibe su beneficio, y la transacción queda registrada.",
    color: "#F5A623",
    bg: "from-[#F5A623]/8 to-[#F5A623]/3",
    scene: (
      <div className="flex flex-col gap-2">
        <div className="rounded-xl border border-gray-100 bg-white p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-700">Tacos El Güero</span>
            <span className="text-[9px] bg-[#F5A623]/10 text-[#F5A623] font-bold px-2 py-0.5 rounded-full">Código aplicado</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-500">
            <span>2× Taco de pastor</span>
            <span className="font-semibold text-gray-700">$80</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#E55000] mt-1">
            <span>🎁 Coca gratis (HAZLO-TG42)</span>
            <span className="font-semibold">-$20</span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-700">Total</span>
            <span className="text-[11px] font-black text-[#F5A623]">$60</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: "04",
    tag: "El Resultado",
    emoji: "💸",
    title: "Omar recibe su comisión. Todos ganan.",
    description: "La comisión llega automáticamente al wallet de Omar. La taquería ganó un cliente nuevo.",
    color: "#1A1840",
    bg: "from-[#1A1840]/8 to-[#1A1840]/3",
    scene: (
      <div className="flex flex-col gap-2">
        <div className="rounded-xl border border-gray-100 bg-white p-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-base">💰</div>
          <div className="flex-1">
            <div className="text-[10px] font-bold text-gray-700">Comisión recibida</div>
            <div className="text-[9px] text-gray-400">Tacos El Güero · hace un momento</div>
          </div>
          <span className="text-sm font-black text-emerald-500">+$6</span>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 flex items-center justify-between">
          <span className="text-[10px] text-gray-500">Balance total</span>
          <span className="text-sm font-black text-brand-gradient">$1,985</span>
        </div>
      </div>
    ),
  },
];

function HistoriaTacos() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section
      ref={ref}
      className="min-h-screen flex flex-col justify-center px-4 sm:px-8 py-16 sm:py-24 bg-[#f5f5f7]"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-[11px] font-bold tracking-widest text-brand-gradient uppercase">
            Ejemplo real
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-brand-dark mt-2 leading-tight">
            La historia de los tacos
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-500 max-w-sm mx-auto leading-relaxed">
            Así funciona Hazlo Cash en la vida real.
          </p>
        </motion.div>

        {/* Grid 2×2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tacoCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.5, ease: "easeOut" }}
              whileHover={{ y: -3, transition: { duration: 0.18 } }}
              className="group rounded-3xl bg-white border border-gray-200/80 overflow-hidden cursor-default shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Zona visual superior */}
              <div className={`bg-gradient-to-br ${card.bg} px-6 pt-6 pb-5 min-h-[160px] flex flex-col justify-center`}>
                {card.scene}
              </div>

              {/* Divisor */}
              <div className="h-px bg-gray-100" />

              {/* Label inferior */}
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <span
                    className="text-xs font-black tracking-wide"
                    style={{ color: card.color }}
                  >
                    {card.step} · {card.tag}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 mt-0.5 leading-snug">{card.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{card.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Cierre */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2.5 rounded-full border border-gray-200 bg-white px-5 py-2.5 shadow-sm">
            <motion.div
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-[#F5A623]"
            />
            <span className="text-sm font-medium text-gray-500">
              Y el ciclo se repite — todos siguen ganando.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── CTA Final — patrón glassmorphism-cta-block ────────── */

function CTAFinal() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="px-4 sm:px-8 py-14 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <Card className="relative overflow-hidden border border-border/50 bg-background/50 p-12 sm:p-20 text-center backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F5A623]/[0.04] to-transparent" />
            <div className="absolute left-1/4 top-0 h-80 w-80 rounded-full bg-[#F5A623]/[0.04] blur-3xl" />
            <div className="absolute right-1/4 bottom-0 h-60 w-60 rounded-full bg-[#F5A623]/[0.04] blur-3xl" />

            <div className="relative z-10 space-y-6">
              <Image
                src="/hazlo-nobg-black.png"
                alt="Hazlo Cash"
                width={200}
                height={200}
                className="h-28 w-auto mx-auto"
              />
              <h2 className="text-3xl sm:text-5xl font-black text-brand-dark leading-tight tracking-tight">
                ¿Ya tienes a alguien
                <br />
                <span className="text-brand-gradient">en mente?</span>
              </h2>
              <p className="mx-auto max-w-sm text-base text-muted-foreground leading-relaxed">
                Apúntate antes del lanzamiento y sé de los primeros embajadores
                en empezar a cobrar.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <a
                  href="#waitlist"
                  className="inline-flex items-center justify-center gap-2 text-sm sm:text-base font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-white hover:opacity-90 transition-all hover:scale-105 active:scale-100 shadow-lg shadow-[#FE7801]/30"
                  style={{ background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)" }}
                >
                  Quiero ser Embajador
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </a>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center gap-2 text-sm sm:text-base font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-brand-dark border border-border hover:bg-[#F5A623]/10 transition-all"
                >
                  Ver cómo funciona
                </a>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Footer — patrón footer-block (simplificado) ───────── */

function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative border-t border-border bg-card/90 backdrop-blur-xl overflow-hidden">
      <motion.div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-[#F5A623]/10 blur-[100px]"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <Image
              src="/hazlo-nobg-black.png"
              alt="Hazlo Cash"
              width={120}
              height={120}
              className="h-12 w-auto"
            />
          </div>

          {/* Links */}
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacidad
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Términos
            </a>
            <a
              href="mailto:hola@hazlocash.mx"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Mail className="h-3 w-3" />
              Contacto
            </a>
          </div>

          {/* Copyright + scroll arriba */}
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Hazlo Cash · Villahermosa, Tabasco
            </p>
            <button
              onClick={scrollToTop}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-[#FE7801]/5 transition-colors"
              aria-label="Ir arriba"
            >
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
              </motion.div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
