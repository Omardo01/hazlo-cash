import { getCodigoConNegocio } from "@/lib/services/referrals";
import { ReferralView, type ReferralViewData } from "./ReferralView";

// Deep link de referido: /r/HAZLO-OD42
// Server Component: resuelve el código contra la BD y delega la UI al cliente.
export default async function ReferralPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: rawCode } = await params;
  const code = decodeURIComponent(rawCode).toUpperCase();

  const resultado = await getCodigoConNegocio(code);

  const data: ReferralViewData | null = resultado
    ? {
        negocio: resultado.negocio.nombre,
        categoria: resultado.negocio.categoria,
        direccion: resultado.negocio.direccion,
        oferta: resultado.negocio.oferta,
        recomendador: resultado.recomendador,
      }
    : null;

  return <ReferralView code={code} data={data} />;
}
