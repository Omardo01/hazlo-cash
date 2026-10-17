import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Text, View, type ViewStyle } from 'react-native';

import { activarAvisos, apagarAvisos, avisoDePrueba, estadoAvisos, type EstadoAvisos } from '@/lib/services/push';
import { Icon } from './icons';
import { Fade, PressableScale } from './motion';
import { C, F, FG, MUTED, R } from './theme';

const QUE_AVISA = {
  recomendador: 'Te avisamos en cuanto alguien use tu QR y caiga tu comisión.',
  negocio: 'Te avisamos cuando te recarguen créditos o se te estén acabando.',
};

/**
 * Activar los avisos push en este teléfono (app web / PWA). En la app nativa
 * no se pinta. Vuelve a leer el estado al regresar a la app, por si el permiso
 * se cambió en los ajustes del teléfono.
 */
export function TarjetaAvisos({ para, style }: { para: 'recomendador' | 'negocio'; style?: ViewStyle }) {
  const [estado, setEstado] = useState<EstadoAvisos | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [nota, setNota] = useState<{ texto: string; error: boolean } | null>(null);

  const leer = useCallback(() => {
    estadoAvisos().then(setEstado).catch(() => setEstado('no-soportado'));
  }, []);

  useEffect(() => {
    leer();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && leer());
    return () => sub.remove();
  }, [leer]);

  if (!estado || estado === 'nativa') return null;

  // Sin await antes de activarAvisos(): iPhone solo pide permiso desde un toque.
  const activar = async () => {
    setOcupado(true);
    setNota(null);
    const r = await activarAvisos();
    setEstado(r.estado);
    if (r.ok) {
      const p = await avisoDePrueba();
      setNota(p.ok ? { texto: 'Listo. Te mandamos un aviso de prueba.', error: false } : { texto: p.error ?? '', error: true });
    } else if (r.error) {
      setNota({ texto: r.error, error: true });
    }
    setOcupado(false);
  };

  const probar = async () => {
    setOcupado(true);
    setNota(null);
    const p = await avisoDePrueba();
    setNota(p.ok ? { texto: 'Te mandamos un aviso de prueba.', error: false } : { texto: p.error ?? '', error: true });
    setOcupado(false);
  };

  const apagar = async () => {
    setOcupado(true);
    setNota(null);
    await apagarAvisos().catch(() => {});
    leer();
    setOcupado(false);
  };

  const activo = estado === 'activo';
  const contenido = {
    instalar: {
      titulo: 'Instala la app para recibir avisos',
      texto: 'En iPhone los avisos solo llegan con Hazlo Cash en tu pantalla de inicio: toca Compartir → Agregar a inicio y ábrela desde ahí.',
    },
    'no-soportado': { titulo: 'Avisos no disponibles aquí', texto: 'Abre Hazlo Cash en Chrome o Safari de tu teléfono para recibir avisos.' },
    bloqueado: {
      titulo: 'Los avisos están bloqueados',
      texto: 'Los bloqueaste en este teléfono. Actívalos en los ajustes de notificaciones de Hazlo Cash (o los permisos del sitio) y vuelve aquí.',
    },
    apagado: { titulo: 'Activa los avisos', texto: QUE_AVISA[para] },
    activo: { titulo: 'Avisos activados', texto: QUE_AVISA[para] },
  }[estado];

  return (
    <Fade desde={10} style={{ borderRadius: R.md, padding: 16, backgroundColor: activo ? '#fff' : `${C.primary}10`, borderWidth: activo ? 0.5 : 1, borderColor: activo ? 'rgba(0,0,0,0.05)' : `${C.primary}30`, ...style }}>
      <Fade key={estado}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: activo ? `${C.primary}15` : C.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={activo ? 'check' : 'bell'} size={17} color={activo ? C.primary : '#fff'} sw={activo ? 2.4 : 1.9} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>{contenido.titulo}</Text>
            <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, marginTop: 3, lineHeight: 18 }}>{contenido.texto}</Text>
          </View>
        </View>

        {(estado === 'apagado' || activo) && (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            {estado === 'apagado' ? (
              <PressableScale
                onPress={activar}
                disabled={ocupado}
                accessibilityRole="button"
                style={{ flex: 1, height: 44, borderRadius: R.md, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
                {ocupado ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: F.semi, fontSize: 14, color: '#fff' }}>Activar avisos</Text>}
              </PressableScale>
            ) : (
              <>
                <PressableScale
                  onPress={probar}
                  disabled={ocupado}
                  accessibilityRole="button"
                  style={{ flex: 1, height: 42, borderRadius: R.md, backgroundColor: FG, alignItems: 'center', justifyContent: 'center' }}>
                  {ocupado ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: F.semi, fontSize: 13, color: '#fff' }}>Mandar prueba</Text>}
                </PressableScale>
                <PressableScale
                  onPress={apagar}
                  disabled={ocupado}
                  accessibilityRole="button"
                  style={{ height: 42, paddingHorizontal: 16, borderRadius: R.md, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: F.semi, fontSize: 13, color: FG }}>Apagar</Text>
                </PressableScale>
              </>
            )}
          </View>
        )}

        {nota && (
          <Fade key={nota.texto} desde={4}>
            <Text style={{ fontFamily: F.base, fontSize: 12, color: nota.error ? C.accent : MUTED, marginTop: 10, lineHeight: 17 }}>{nota.texto}</Text>
          </Fade>
        )}
      </Fade>
    </Fade>
  );
}
