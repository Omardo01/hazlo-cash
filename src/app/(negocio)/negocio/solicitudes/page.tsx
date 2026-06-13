import { redirect } from "next/navigation";
import { getVisitasDelNegocio } from "@/lib/services/referrals";
import { SolicitudesView } from "./SolicitudesView";

// Server Component: las visitas llegan filtradas por RLS —
// el negocio solo ve las de sus propios códigos.
export default async function SolicitudesPage() {
  const visitas = await getVisitasDelNegocio();

  if (visitas === null) redirect("/auth/login");

  return <SolicitudesView visitas={visitas} />;
}
