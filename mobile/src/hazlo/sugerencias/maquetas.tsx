import { Text, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { HazloMark } from '../HazloMark';
import { Icon, type IconName } from '../icons';
import { BG, C, F, FG, MUTED, R } from '../theme';
import { FoodTile } from '../ui';

/**
 * Maquetas de pantallas propuestas. Son estáticas a propósito: datos de
 * ejemplo, botones sin acción. Sirven para decidir qué construir; cuando una se
 * apruebe, se construye como pantalla real con datos y se borra de aquí.
 */

const TEAL = '#00A896';
const CARD_BORDE = { borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)' } as const;

// ── Piezas comunes ────────────────────────────────────────────────────────────

function Titulo({ children, sub }: { children: string; sub?: string }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontFamily: F.bold, fontSize: 20, color: FG, letterSpacing: -0.4 }}>{children}</Text>
      {sub ? <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 2 }}>{sub}</Text> : null}
    </View>
  );
}

function Tarjeta({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ borderRadius: R.md, padding: 14, backgroundColor: '#fff', ...CARD_BORDE }, style]}>{children}</View>;
}

function Pill({ texto, color, fondo, icon }: { texto: string; color: string; fondo: string; icon?: IconName }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 9, borderRadius: 999, backgroundColor: fondo }}>
      {icon ? <Icon name={icon} size={11} color={color} sw={2.4} /> : null}
      <Text style={{ fontFamily: F.semi, fontSize: 10.5, color }}>{texto}</Text>
    </View>
  );
}

function Boton({ texto, icon, claro, style }: { texto: string; icon?: IconName; claro?: boolean; style?: ViewStyle }) {
  return (
    <View
      style={[
        { height: 46, borderRadius: R.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
        claro ? { backgroundColor: '#fff', ...CARD_BORDE } : { backgroundColor: C.primary },
        style,
      ]}>
      {icon ? <Icon name={icon} size={16} color={claro ? FG : '#fff'} /> : null}
      <Text style={{ fontFamily: F.semi, fontSize: 13, color: claro ? FG : '#fff' }}>{texto}</Text>
    </View>
  );
}

function FilaIcono({ icon, titulo, sub, derecha, color = C.primary, ultimo }: { icon: IconName; titulo: string; sub?: string; derecha?: React.ReactNode; color?: string; ultimo?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: ultimo ? 0 : 0.5, borderColor: 'rgba(0,0,0,0.06)' }}>
      <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: `${color}18`, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={16} color={color} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 13, color: FG }}>{titulo}</Text>
        {sub ? <Text numberOfLines={2} style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 1, lineHeight: 15 }}>{sub}</Text> : null}
      </View>
      {derecha}
    </View>
  );
}

// ── 1. Ficha del negocio ──────────────────────────────────────────────────────
export function MaquetaFichaNegocio() {
  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View>
        <FoodTile hue={12} height={190} radius={0} />
        <View style={{ position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
          {(['chevR', 'bookmark'] as IconName[]).map((i) => (
            <View key={i} style={{ width: 36, height: 36, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center', transform: i === 'chevR' ? [{ rotate: '180deg' }] : [] }}>
              <Icon name={i} size={17} color={FG} />
            </View>
          ))}
        </View>
      </View>
      <View style={{ padding: 16, marginTop: -22, borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: BG, flex: 1 }}>
        <Text style={{ fontFamily: F.bold, fontSize: 21, color: FG, letterSpacing: -0.4 }}>Tacos El Güero</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 2 }}>Comida · Centro, Villahermosa · 1.2 km</Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
          <Pill texto="★ 4.8 · 32 reseñas" color="#B7791F" fondo="rgba(245,166,35,0.15)" />
          <Pill texto="Abierto · cierra 11 pm" color={TEAL} fondo="rgba(0,168,150,0.12)" />
        </View>

        <View style={{ marginTop: 14, borderRadius: R.md, padding: 14, overflow: 'hidden' }}>
          <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          <Text style={{ fontFamily: F.semi, fontSize: 10.5, color: 'rgba(255,255,255,0.8)', letterSpacing: 0.6 }}>TU BENEFICIO HAZLO CASH</Text>
          <Text style={{ fontFamily: F.bold, fontSize: 15, color: '#fff', marginTop: 4 }}>Refresco gratis de 1 litro con tu primer pedido</Text>
        </View>

        <Tarjeta style={{ marginTop: 12, paddingVertical: 4 }}>
          <FilaIcono icon="home" titulo="Av. Madero 512, Centro" sub="A 6 min en coche" derecha={<Text style={{ fontFamily: F.semi, fontSize: 12, color: C.primary }}>Cómo llegar</Text>} />
          <FilaIcono icon="activity" titulo="Lun a Sáb · 6 pm – 11 pm" sub="Domingo cerrado" ultimo />
        </Tarjeta>

        <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG, marginTop: 14, marginBottom: 6 }}>Reseñas verificadas</Text>
        <Tarjeta>
          <Text style={{ fontFamily: F.semi, fontSize: 12, color: FG }}>Mariana R. · ★★★★★</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginTop: 3, lineHeight: 16 }}>Los de pastor están buenísimos. Me lo recomendó mi primo y sí cumplió.</Text>
        </Tarjeta>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, padding: 12, backgroundColor: '#fff', borderTopWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)' }}>
        <Boton texto="Recomendar" icon="send" claro style={{ flex: 1 }} />
        <Boton texto="Generar orden" icon="qr" style={{ flex: 1 }} />
      </View>
    </View>
  );
}

// ── 2. Centro de avisos ───────────────────────────────────────────────────────
export function MaquetaAvisos() {
  const hoy: { icon: IconName; t: string; s: string; color: string; nuevo?: boolean }[] = [
    { icon: 'dollar', t: '¡Ganaste $10.00!', s: 'Tacos El Güero confirmó una venta que recomendaste.', color: TEAL, nuevo: true },
    { icon: 'qr', t: 'Ana usó tu código', s: 'HAZLO-OD42 · Orden #1042 en proceso', color: C.primary, nuevo: true },
    { icon: 'wallet', t: 'Tu retiro llegó', s: '$200.00 a BBVA •4821', color: '#2D2B8F' },
  ];
  const semana: { icon: IconName; t: string; s: string; color: string }[] = [
    { icon: 'star', t: 'Subiste a nivel Plata', s: 'Ahora ganas más por cada venta.', color: '#B7791F' },
    { icon: 'gift', t: 'Nuevo negocio cerca', s: 'Café Aroma · 2x1 en café los lunes', color: C.primary },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: BG, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Titulo sub="2 sin leer">Avisos</Titulo>
        <Text style={{ fontFamily: F.semi, fontSize: 12, color: C.primary }}>Marcar leídos</Text>
      </View>
      <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, letterSpacing: 0.6, marginBottom: 6 }}>HOY</Text>
      <Tarjeta style={{ paddingVertical: 2 }}>
        {hoy.map((a, i) => (
          <FilaIcono
            key={a.t}
            icon={a.icon}
            titulo={a.t}
            sub={a.s}
            color={a.color}
            ultimo={i === hoy.length - 1}
            derecha={a.nuevo ? <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: C.primary }} /> : null}
          />
        ))}
      </Tarjeta>
      <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, letterSpacing: 0.6, marginTop: 16, marginBottom: 6 }}>ESTA SEMANA</Text>
      <Tarjeta style={{ paddingVertical: 2 }}>
        {semana.map((a, i) => (
          <FilaIcono key={a.t} icon={a.icon} titulo={a.t} sub={a.s} color={a.color} ultimo={i === semana.length - 1} />
        ))}
      </Tarjeta>
    </View>
  );
}

// ── 3. Bienvenida (primera vez) ───────────────────────────────────────────────
export function MaquetaBienvenida() {
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'space-between', overflow: 'hidden' }}>
      <LinearGradient colors={['#1A1840', '#2D2B8F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <Text style={{ alignSelf: 'flex-end', fontFamily: F.semi, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Saltar</Text>
      <View style={{ alignItems: 'center' }}>
        <View style={{ width: 170, height: 170, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}>
          <HazloMark size={96} />
        </View>
        <Text style={{ fontFamily: F.semi, fontSize: 11, color: '#F5A623', letterSpacing: 1.2, marginTop: 28 }}>PASO 1 DE 3 · RECOMIENDA</Text>
        <Text style={{ fontFamily: F.bold, fontSize: 24, color: '#fff', textAlign: 'center', letterSpacing: -0.5, marginTop: 8 }}>Recomienda los lugares que ya te gustan</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 13, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: 10, lineHeight: 19 }}>
          Comparte tu código con amigos. Cuando compren, tú ganas dinero y ellos se llevan un beneficio.
        </Text>
      </View>
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 18 }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ width: i === 0 ? 22 : 7, height: 7, borderRadius: 999, backgroundColor: i === 0 ? C.primary : 'rgba(255,255,255,0.3)' }} />
          ))}
        </View>
        <Boton texto="Siguiente" />
      </View>
    </View>
  );
}

// ── 4. Detalle de una comisión ────────────────────────────────────────────────
export function MaquetaDetalleComision() {
  const pasos = [
    { t: 'Compartiste tu código', s: '2 oct · 7:12 pm por WhatsApp' },
    { t: 'Ana reclamó la recomendación', s: '4 oct · 8:03 pm · Orden #1042' },
    { t: 'El negocio confirmó la venta', s: '4 oct · 8:41 pm · venta de $186.00' },
    { t: 'Comisión acreditada', s: '4 oct · 8:41 pm · ya está en tu saldo' },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: BG, padding: 16 }}>
      <View style={{ alignItems: 'center', paddingVertical: 10 }}>
        <View style={{ width: 54, height: 54, borderRadius: 999, backgroundColor: 'rgba(0,168,150,0.14)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={26} color={TEAL} sw={2.6} />
        </View>
        <Text style={{ fontFamily: F.bold, fontSize: 34, color: FG, letterSpacing: -1.2, marginTop: 10 }}>+$10.00</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED }}>Comisión · Tacos El Güero</Text>
      </View>
      <Tarjeta style={{ marginTop: 10 }}>
        {pasos.map((p, i) => (
          <View key={p.t} style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: TEAL, marginTop: 3 }} />
              {i < pasos.length - 1 && <View style={{ width: 2, flex: 1, minHeight: 18, backgroundColor: 'rgba(0,168,150,0.3)' }} />}
            </View>
            <View style={{ flex: 1, paddingBottom: i < pasos.length - 1 ? 10 : 0 }}>
              <Text style={{ fontFamily: F.semi, fontSize: 12.5, color: FG }}>{p.t}</Text>
              <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 1 }}>{p.s}</Text>
            </View>
          </View>
        ))}
      </Tarjeta>
      <Tarjeta style={{ marginTop: 12 }}>
        {[
          ['Regla del negocio', '$10 fijos por venta'],
          ['Código usado', 'HAZLO-OD42'],
          ['Folio', '#1042'],
        ].map(([k, v]) => (
          <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
            <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED }}>{k}</Text>
            <Text style={{ fontFamily: F.semi, fontSize: 12, color: FG }}>{v}</Text>
          </View>
        ))}
      </Tarjeta>
      <View style={{ flex: 1 }} />
      <Boton texto="Volver a recomendarlo" icon="send" />
    </View>
  );
}

// ── 5. Rendimiento de mis códigos ─────────────────────────────────────────────
export function MaquetaRendimiento() {
  const embudo = [
    { l: 'Abrieron tu link', v: 48, color: '#2D2B8F' },
    { l: 'Reclamaron', v: 14, color: C.primary },
    { l: 'Compraron', v: 11, color: TEAL },
  ];
  const max = embudo[0].v;
  return (
    <View style={{ flex: 1, backgroundColor: BG, padding: 16 }}>
      <Titulo sub="Últimos 30 días">Cómo van tus códigos</Titulo>
      <Tarjeta>
        {embudo.map((e, i) => (
          <View key={e.l} style={{ marginBottom: i < embudo.length - 1 ? 12 : 0 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
              <Text style={{ fontFamily: F.base, fontSize: 12, color: FG }}>{e.l}</Text>
              <Text style={{ fontFamily: F.bold, fontSize: 12, color: FG }}>
                {e.v}
                {i > 0 ? <Text style={{ fontFamily: F.reg, color: MUTED }}> · {Math.round((e.v / embudo[i - 1].v) * 100)}%</Text> : null}
              </Text>
            </View>
            <View style={{ height: 10, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${(e.v / max) * 100}%`, borderRadius: 999, backgroundColor: e.color }} />
            </View>
          </View>
        ))}
      </Tarjeta>
      <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG, marginTop: 16, marginBottom: 6 }}>Por negocio</Text>
      <Tarjeta style={{ paddingVertical: 2 }}>
        <FilaIcono icon="home" titulo="Tacos El Güero" sub="9 ventas · 82% de quienes reclaman compran" derecha={<Text style={{ fontFamily: F.bold, fontSize: 12.5, color: TEAL }}>+$90</Text>} />
        <FilaIcono icon="home" titulo="Café Aroma" sub="2 ventas · 40% de quienes reclaman compran" derecha={<Text style={{ fontFamily: F.bold, fontSize: 12.5, color: TEAL }}>+$20</Text>} ultimo />
      </Tarjeta>
      <View style={{ marginTop: 12, flexDirection: 'row', gap: 8, padding: 12, borderRadius: R.md, backgroundColor: 'rgba(245,166,35,0.14)' }}>
        <Icon name="star" size={16} color="#B7791F" />
        <Text style={{ flex: 1, fontFamily: F.reg, fontSize: 11.5, color: '#7A5212', lineHeight: 16 }}>Tip: tus links que mandas por la tarde se reclaman el doble.</Text>
      </View>
    </View>
  );
}

// ── 6. Niveles con beneficios ─────────────────────────────────────────────────
export function MaquetaNiveles() {
  const niveles = [
    { n: 'Bronce', req: 'Desde la 1ª venta', ben: 'Comisión base del negocio', color: '#A0643C', hecho: true },
    { n: 'Plata', req: '5 ventas confirmadas', ben: '+10% en cada comisión · retiros sin mínimo', color: '#7D8590', actual: true },
    { n: 'Oro', req: '15 ventas confirmadas', ben: '+25% en cada comisión · promos exclusivas · insignia en tu perfil', color: '#C9952B' },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: BG, padding: 16 }}>
      <Titulo sub="Solo cuentan ventas dentro de Hazlo Cash">Tu nivel</Titulo>
      <View style={{ borderRadius: R.lg, padding: 16, backgroundColor: '#0D0D0D', marginBottom: 14 }}>
        <Text style={{ fontFamily: F.semi, fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: 0.8 }}>EMBAJADOR PLATA</Text>
        <Text style={{ fontFamily: F.bold, fontSize: 22, color: '#fff', marginTop: 4 }}>11 de 15 ventas</Text>
        <View style={{ height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.15)', marginTop: 10, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: '73%', backgroundColor: C.primary, borderRadius: 999 }} />
        </View>
        <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>Te faltan 4 para Oro y +25% por venta.</Text>
      </View>
      <View style={{ gap: 10 }}>
        {niveles.map((v) => (
          <Tarjeta key={v.n} style={v.actual ? { borderWidth: 1.5, borderColor: C.primary } : undefined}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 34, height: 34, borderRadius: 999, backgroundColor: `${v.color}26`, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={v.hecho ? 'check' : 'star'} size={16} color={v.color} sw={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: F.semi, fontSize: 13.5, color: FG }}>
                  {v.n}
                  {v.actual ? <Text style={{ color: C.primary }}>  · tu nivel</Text> : null}
                </Text>
                <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED }}>{v.req}</Text>
              </View>
            </View>
            <Text style={{ fontFamily: F.base, fontSize: 11.5, color: FG, marginTop: 8, lineHeight: 16 }}>{v.ben}</Text>
          </Tarjeta>
        ))}
      </View>
    </View>
  );
}

// ── 7. Cuenta, privacidad y borrar cuenta ─────────────────────────────────────
export function MaquetaCuenta() {
  const campos = [
    { l: 'Nombre', v: 'Omar Domínguez' },
    { l: 'Teléfono', v: '993 123 4567' },
    { l: 'Correo', v: 'omar@ejemplo.com', bloqueado: true },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: BG, padding: 16 }}>
      <Titulo>Tu cuenta</Titulo>
      <View style={{ alignItems: 'center', marginBottom: 14 }}>
        <View>
          <LinearGradient colors={[C.primary, C.accent]} style={{ width: 76, height: 76, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: F.bold, fontSize: 26, color: '#fff' }}>OD</Text>
          </LinearGradient>
          <View style={{ position: 'absolute', right: -2, bottom: -2, width: 28, height: 28, borderRadius: 999, backgroundColor: '#0D0D0D', borderWidth: 3, borderColor: BG, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="plus" size={12} color="#fff" sw={2.6} />
          </View>
        </View>
      </View>
      {campos.map((c) => (
        <View key={c.l} style={{ marginBottom: 10 }}>
          <Text style={{ fontFamily: F.semi, fontSize: 11.5, color: FG, marginBottom: 4 }}>{c.l}</Text>
          <View style={{ height: 44, borderRadius: R.sm, paddingHorizontal: 12, backgroundColor: c.bloqueado ? 'rgba(0,0,0,0.04)' : '#fff', ...CARD_BORDE, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ flex: 1, fontFamily: F.reg, fontSize: 13, color: c.bloqueado ? MUTED : FG }}>{c.v}</Text>
            {c.bloqueado ? <Text style={{ fontFamily: F.reg, fontSize: 10.5, color: MUTED }}>No editable</Text> : null}
          </View>
        </View>
      ))}
      <Boton texto="Guardar cambios" style={{ marginTop: 4 }} />
      <Tarjeta style={{ marginTop: 14, paddingVertical: 2 }}>
        <FilaIcono icon="settings" titulo="Aviso de privacidad" color={FG} derecha={<Icon name="chevR" size={14} color={MUTED} />} />
        <FilaIcono icon="bookmark" titulo="Términos y condiciones" color={FG} derecha={<Icon name="chevR" size={14} color={MUTED} />} />
        <FilaIcono icon="x" titulo="Eliminar mi cuenta" sub="Se borran tus datos. Tu saldo debe estar en $0." color={C.accent} ultimo />
      </Tarjeta>
    </View>
  );
}

// ── 8. Negocio: créditos y QR de mostrador ────────────────────────────────────
export function MaquetaNegocioCreditos() {
  const historial: { t: string; s: string; v: string; entra: boolean }[] = [
    { t: 'Venta confirmada', s: 'Hoy · Orden #1042 · Omar D.', v: '−1', entra: false },
    { t: 'Venta confirmada', s: 'Hoy · Orden #1039 · Ana P.', v: '−1', entra: false },
    { t: 'Recarga de créditos', s: '28 sep · por Hazlo Cash', v: '+50', entra: true },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: BG, padding: 16 }}>
      <Titulo sub="Tacos El Güero">Créditos</Titulo>
      <View style={{ flexDirection: 'row', gap: 10, padding: 12, borderRadius: R.md, backgroundColor: 'rgba(235,78,0,0.1)', borderWidth: 1, borderColor: 'rgba(235,78,0,0.25)', marginBottom: 12 }}>
        <Icon name="bell" size={18} color={C.accent} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.semi, fontSize: 13, color: C.accent }}>Te quedan 3 créditos</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: '#8A3A12', marginTop: 1, lineHeight: 16 }}>Alcanzan para ~3 ventas. Sin créditos no puedes confirmar ventas.</Text>
          <Text style={{ fontFamily: F.semi, fontSize: 12, color: C.accent, marginTop: 6 }}>Pedir recarga →</Text>
        </View>
      </View>
      <Tarjeta style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <View style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="qr" size={30} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.semi, fontSize: 13, color: FG }}>QR para tu mostrador</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 1, lineHeight: 15 }}>Imprímelo: el cliente lo escanea y entra directo a tu promo.</Text>
        </View>
        <Icon name="share" size={18} color={C.primary} />
      </Tarjeta>
      <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG, marginBottom: 6 }}>Movimientos</Text>
      <Tarjeta style={{ paddingVertical: 2 }}>
        {historial.map((h, i) => (
          <FilaIcono
            key={h.s}
            icon={h.entra ? 'arrowDown' : 'check'}
            titulo={h.t}
            sub={h.s}
            color={h.entra ? TEAL : C.primary}
            ultimo={i === historial.length - 1}
            derecha={<Text style={{ fontFamily: F.bold, fontSize: 13, color: h.entra ? TEAL : FG }}>{h.v}</Text>}
          />
        ))}
      </Tarjeta>
    </View>
  );
}

// ── 9. Estados del sistema: sin conexión, error y contraseña ──────────────────
export function MaquetaEstados() {
  return (
    <View style={{ flex: 1, backgroundColor: BG, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#0D0D0D', alignSelf: 'center' }}>
        <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: '#F5A623' }} />
        <Text style={{ fontFamily: F.semi, fontSize: 11.5, color: '#fff' }}>Sin conexión · mostrando lo último guardado</Text>
      </View>

      <Tarjeta style={{ alignItems: 'center', paddingVertical: 20 }}>
        <View style={{ width: 46, height: 46, borderRadius: 999, backgroundColor: `${C.primary}18`, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="refresh" size={20} color={C.primary} />
        </View>
        <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG, marginTop: 10 }}>No pudimos cargar tus órdenes</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 4, textAlign: 'center', lineHeight: 17 }}>Revisa tu internet. Tu dinero y tus códigos están a salvo.</Text>
        <Boton texto="Reintentar" claro style={{ marginTop: 12, paddingHorizontal: 26 }} />
      </Tarjeta>

      <Tarjeta>
        <Text style={{ fontFamily: F.bold, fontSize: 16, color: FG }}>¿Olvidaste tu contraseña?</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 4, lineHeight: 17 }}>Te mandamos un link a tu correo para crear una nueva.</Text>
        <View style={{ height: 44, borderRadius: R.sm, paddingHorizontal: 12, marginTop: 10, backgroundColor: BG, ...CARD_BORDE, justifyContent: 'center' }}>
          <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED }}>tu@email.com</Text>
        </View>
        <Boton texto="Enviar link" style={{ marginTop: 10 }} />
      </Tarjeta>
    </View>
  );
}
