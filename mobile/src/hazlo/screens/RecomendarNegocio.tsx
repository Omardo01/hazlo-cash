import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { invalidar } from '@/lib/datos/cache';
import { K } from '@/lib/datos/consultas';
import { sugerirNegocio } from '@/lib/services/sugerencias';
import { buscarGiros, type Grupo } from '../categorias/catalogo';
import { Buscador, IconoGrupo, TextoResaltado } from '../categorias/piezas';
import { Icon } from '../icons';
import { Fade, PressableScale, STAGGER } from '../motion';
import { C, F, FG, MUTED, R } from '../theme';
import { CampoTexto, Palomita } from './RegistroNegocio';

/**
 * Descubre → "Recomienda un negocio": el usuario propone un negocio que aún no
 * está en Hazlo Cash. Se guarda en `sugerencias_negocio` y le aparece al admin
 * en la pestaña Sugerencias. Pide sesión: el invitado ve la puerta de cuenta.
 */

export interface GiroElegido {
  grupo: Grupo;
  giro: string;
}

interface Datos {
  nombre: string;
  direccion: string;
  contacto: string;
  giro: GiroElegido | null;
}

type Errores = Partial<Record<keyof Datos, string>>;

const MAX_RESULTADOS = 6;

function validar(d: Datos): Errores {
  const e: Errores = {};
  if (d.nombre.trim().length < 2) e.nombre = 'Escribe el nombre';
  if (!d.direccion.trim()) e.direccion = 'Escribe dónde está';
  // El contacto es opcional; si lo escriben, que sea un teléfono completo.
  const digitos = d.contacto.replace(/\D/g, '').replace(/^52(?=\d{10}$)/, '');
  if (d.contacto.trim() && digitos.length !== 10) e.contacto = 'Debe tener 10 dígitos';
  if (!d.giro) e.giro = 'Elige un giro';
  return e;
}

// Un solo giro del catálogo: buscador con sugerencias o la etiqueta elegida.
function ElegirGiro({ valor, onCambio, error }: { valor: GiroElegido | null; onCambio: (g: GiroElegido | null) => void; error?: string }) {
  const [busqueda, setBusqueda] = useState('');
  const resultados = busqueda.trim() ? buscarGiros(busqueda).slice(0, MAX_RESULTADOS) : [];

  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
        <Text style={{ fontFamily: F.base, fontSize: 12, color: FG }}>Giro del negocio</Text>
        {error && !valor && (
          <Fade key={error} style={{ flexShrink: 1 }}>
            <Text numberOfLines={1} style={{ fontFamily: F.base, fontSize: 11, color: C.accent }}>
              {error}
            </Text>
          </Fade>
        )}
      </View>

      {valor ? (
        <Fade key={`${valor.grupo.slug}-${valor.giro}`} desde={8}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 1, borderColor: `${C.primary}40` }}>
            <IconoGrupo grupo={valor.grupo} size={38} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>{valor.giro}</Text>
              <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 1 }}>{valor.grupo.nombre}</Text>
            </View>
            <PressableScale
              onPress={() => {
                setBusqueda('');
                onCambio(null);
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Cambiar giro">
              <Text style={{ fontFamily: F.semi, fontSize: 12, color: C.primary }}>Cambiar</Text>
            </PressableScale>
          </View>
        </Fade>
      ) : (
        <>
          <Buscador valor={busqueda} onCambio={setBusqueda} placeholder="¿A qué se dedica? Tacos, plomero…" />
          {resultados.length > 0 && (
            <View style={{ marginTop: 8, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              {resultados.map((r, i) => (
                <Fade key={`${r.grupo.slug}-${r.giro}`} delay={Math.min(i, 5) * STAGGER} desde={6}>
                  <PressableScale
                    onPress={() => onCambio({ grupo: r.grupo, giro: r.giro })}
                    accessibilityRole="button"
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: 'rgba(13,13,13,0.08)' }}>
                    <IconoGrupo grupo={r.grupo} size={30} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <TextoResaltado texto={r.giro} busqueda={busqueda} style={{ fontFamily: F.semi, fontSize: 13.5, color: FG }} />
                      <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 1 }}>{r.grupo.nombre}</Text>
                    </View>
                    <Icon name="plus" size={16} color={C.primary} sw={2.2} />
                  </PressableScale>
                </Fade>
              ))}
            </View>
          )}
          {busqueda.trim() !== '' && resultados.length === 0 && (
            <Fade key="sin-giros" desde={6}>
              <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 8, paddingHorizontal: 4 }}>
                No encontramos ese giro. Prueba con otra palabra.
              </Text>
            </Fade>
          )}
        </>
      )}
    </View>
  );
}

function Listo({ datos, recomendaciones, onOtro, onVolver }: { datos: Datos; recomendaciones: number; onOtro: () => void; onVolver: () => void }) {
  return (
    <Fade key="listo" desde={14} style={{ alignItems: 'center', paddingTop: 12 }}>
      <Palomita />
      <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.4, marginTop: 18, textAlign: 'center' }}>
        ¡Gracias por recomendarlo!
      </Text>
      <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 6, textAlign: 'center', lineHeight: 19, paddingHorizontal: 8 }}>
        Vamos a invitar a <Text style={{ fontFamily: F.semi, color: FG }}>{datos.nombre.trim()}</Text> a Hazlo Cash. Cuando se sume, podrás ganar por recomendarlo.
      </Text>
      {recomendaciones > 1 && (
        <Fade delay={STAGGER} desde={8} style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: `${C.primary}14` }}>
          <Icon name="user" size={14} color={C.primary} sw={2.2} />
          <Text style={{ fontFamily: F.semi, fontSize: 12.5, color: C.primary }}>Ya son {recomendaciones} personas que lo recomiendan</Text>
        </Fade>
      )}

      <Fade delay={STAGGER * 2} desde={10} style={{ alignSelf: 'stretch', marginTop: 22, padding: 16, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)', gap: 12 }}>
        {datos.giro && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <IconoGrupo grupo={datos.giro.grupo} size={32} />
            <Text style={{ flex: 1, fontFamily: F.semi, fontSize: 13.5, color: FG }}>{datos.giro.giro}</Text>
          </View>
        )}
        <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED }}>{datos.direccion.trim()}</Text>
        {!!datos.contacto.trim() && <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED }}>{datos.contacto.trim()}</Text>}
      </Fade>

      <Fade delay={STAGGER * 3} desde={10} style={{ alignSelf: 'stretch', marginTop: 22, gap: 10 }}>
        <PressableScale onPress={onVolver} style={{ height: 52, borderRadius: R.md, backgroundColor: FG, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Listo</Text>
        </PressableScale>
        <PressableScale onPress={onOtro} style={{ height: 46, borderRadius: R.md, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: F.semi, fontSize: 13.5, color: C.primary }}>Recomendar otro</Text>
        </PressableScale>
      </Fade>
    </Fade>
  );
}

export function VistaRecomendarNegocio({ giroInicial, onVolver }: { giroInicial?: GiroElegido; onVolver: () => void }) {
  const vacio: Datos = { nombre: '', direccion: '', contacto: '', giro: giroInicial ?? null };
  const [datos, setDatos] = useState<Datos>(vacio);
  const [errores, setErrores] = useState<Errores>({});
  const [intento, setIntento] = useState(false);
  const [etapa, setEtapa] = useState<'form' | 'enviando' | 'listo'>('form');
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [recomendaciones, setRecomendaciones] = useState(0);

  // Tras el primer intento, los errores se recalculan mientras se corrige.
  const set = <K extends keyof Datos>(k: K, v: Datos[K]) => {
    const nuevos = { ...datos, [k]: v };
    setDatos(nuevos);
    if (intento) setErrores(validar(nuevos));
  };

  const enviar = async () => {
    setIntento(true);
    const e = validar(datos);
    setErrores(e);
    if (Object.keys(e).length > 0 || !datos.giro) return;
    setErrorEnvio(null);
    setEtapa('enviando');
    const res = await sugerirNegocio({
      nombre: datos.nombre,
      direccion: datos.direccion,
      contacto: datos.contacto,
      grupo: datos.giro.grupo.slug,
      giro: datos.giro.giro,
    });
    if (!res.ok) {
      setErrorEnvio(res.error ?? 'No pudimos enviarla. Revisa tu conexión e intenta otra vez.');
      setEtapa('form');
      return;
    }
    invalidar(K.adminSugerencias);
    invalidar(K.misSugerencias);
    setRecomendaciones(res.recomendaciones);
    setEtapa('listo');
  };

  if (etapa === 'listo') {
    return (
      <Listo
        datos={datos}
        recomendaciones={recomendaciones}
        onVolver={onVolver}
        onOtro={() => {
          setDatos({ ...vacio, giro: null });
          setErrores({});
          setIntento(false);
          setErrorEnvio(null);
          setEtapa('form');
        }}
      />
    );
  }

  const enviando = etapa === 'enviando';

  return (
    <Fade key="form">
      <Fade delay={STAGGER} desde={14} style={{ borderRadius: R.lg, overflow: 'hidden', padding: 20, marginBottom: 20 }}>
        <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <Icon name="send" size={20} color="#fff" />
        </View>
        <Text style={{ fontFamily: F.bold, fontSize: 22, color: '#fff', letterSpacing: -0.4 }}>Recomienda un negocio</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: 'rgba(255,255,255,0.9)', marginTop: 4, lineHeight: 18 }}>
          ¿Conoces uno bueno que aún no está? Cuéntanos y lo invitamos a Hazlo Cash.
        </Text>
      </Fade>

      <Fade delay={STAGGER * 2} desde={10}>
        <CampoTexto
          label="Nombre del negocio"
          value={datos.nombre}
          onChangeText={(t) => set('nombre', t)}
          placeholder="Ej. Tacos El Güero"
          autoCapitalize="words"
          error={errores.nombre}
        />
        <CampoTexto
          label="Dirección"
          value={datos.direccion}
          onChangeText={(t) => set('direccion', t)}
          placeholder="Calle, colonia o una referencia"
          autoCapitalize="sentences"
          error={errores.direccion}
        />
        <CampoTexto
          label="Contacto"
          hint="Opcional"
          value={datos.contacto}
          onChangeText={(t) => set('contacto', t)}
          placeholder="Teléfono o WhatsApp del negocio"
          keyboardType="phone-pad"
          error={errores.contacto}
        />
        <ElegirGiro valor={datos.giro} onCambio={(g) => set('giro', g)} error={errores.giro} />
      </Fade>

      <Fade delay={STAGGER * 3} desde={10}>
        <PressableScale
          onPress={enviar}
          disabled={enviando}
          style={{ marginTop: 6, height: 52, borderRadius: R.md, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', opacity: enviando ? 0.8 : 1 }}>
          {enviando ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Enviar recomendación</Text>}
        </PressableScale>
        {errorEnvio && (
          <Fade key={errorEnvio} desde={6}>
            <Text style={{ fontFamily: F.base, fontSize: 12, color: C.accent, textAlign: 'center', marginTop: 10, lineHeight: 17 }}>{errorEnvio}</Text>
          </Fade>
        )}
      </Fade>
    </Fade>
  );
}
