import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { reclamarCodigo, type Reclamo } from '@/lib/services/referrals';
import { getMiSaldo } from '@/lib/services/wallet';
import {
  etiquetaCuenta,
  getCuentas,
  registrarRetiro,
  totalRetirado,
  type CuentaBancaria,
} from '@/lib/simulacion/retiros';
import { HazloMark } from './HazloMark';
import { Icon, IconName } from './icons';
import { DUR, EASE, Fade, PressableScale } from './motion';
import { C, F, FG, MUTED, R } from './theme';
import type { SheetName, Tab } from './screens/types';

// ── Shell común de bottom sheet ────────────────────────────────────────────────
// Un solo Modal por sesión de hoja. Antes cada estado (acciones → reclamar,
// formulario → éxito) devolvía su propio Modal: Android cerraba una ventana
// nativa y abría otra, y eso era el parpadeo. Aquí la ventana se mantiene y
// solo cambia el contenido. La animación es nuestra (animationType="none")
// para que el fondo haga fade y la hoja suba con el mismo timing en Android e
// iOS, y para poder animar también la salida antes de desmontar.
const ALTO_ESTIMADO = 560;

function SheetShell({
  progreso,
  onCerrar,
  children,
}: {
  progreso: Animated.Value;
  onCerrar: () => void;
  children: React.ReactNode;
}) {
  const [alto, setAlto] = useState(0);
  const translateY = progreso.interpolate({ inputRange: [0, 1], outputRange: [alto || ALTO_ESTIMADO, 0] });

  return (
    <Modal visible transparent animationType="none" onRequestClose={onCerrar} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)', opacity: progreso }]}>
            <Pressable style={{ flex: 1 }} onPress={onCerrar} />
          </Animated.View>

          <Animated.View
            onLayout={(e) => setAlto(e.nativeEvent.layout.height)}
            style={{
              transform: [{ translateY }],
              backgroundColor: '#fff',
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              paddingHorizontal: 22,
              paddingTop: 12,
              paddingBottom: 44,
            }}>
            <View style={{ width: 36, height: 5, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.18)', alignSelf: 'center', marginBottom: 18 }} />
            {children}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Action sheet (botón +) ─────────────────────────────────────────────────────
// Cada acción navega a una tab (`to`) o abre otra hoja (`sheet`).
const actions: { t: string; d: string; icon: IconName; to?: Tab; sheet?: SheetName }[] = [
  { t: 'Nueva recomendación', d: 'Comparte un lugar o producto', icon: 'send', to: 'share' },
  { t: 'Reclamar recomendación', d: 'Usa el código que te compartieron', icon: 'qr', sheet: 'claim' },
  { t: 'Invitar amigos', d: 'Comparte tu código personal', icon: 'gift', to: 'share' },
  { t: 'Retirar dinero', d: 'Transfiere a tu cuenta', icon: 'wallet', to: 'balance' },
];

function ActionSheet({
  onNav,
  onOpenSheet,
}: {
  onNav: (t: Tab) => void;
  onOpenSheet: (s: SheetName) => void;
}) {
  return (
    <>
      <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.88, marginBottom: 12 }}>Acciones rápidas</Text>
      <View style={{ gap: 6 }}>
        {actions.map((a) => (
          <Pressable key={a.t} onPress={() => (a.sheet ? onOpenSheet(a.sheet) : a.to ? onNav(a.to) : undefined)} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: R.md }}>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: `${C.primary}15`, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={a.icon} size={20} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>{a.t}</Text>
              <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 1 }}>{a.d}</Text>
            </View>
            <Icon name="chevR" size={16} color={MUTED} />
          </Pressable>
        ))}
      </View>
    </>
  );
}

// ── Withdraw sheet ─────────────────────────────────────────────────────────────
// Simulación gráfica de retiro: cuenta destino → monto → procesando → éxito.
// El dinero no se mueve: el retiro queda en el historial local (ver
// lib/simulacion/retiros.ts) y descuenta del saldo mostrado.
const WITHDRAW_STEPS = ['Validando fondos', 'Enviando a tu cuenta', 'Confirmado'];

function WithdrawSheet({ onClose, onAbrirCuentas }: { onClose: () => void; onAbrirCuentas: () => void }) {
  const [saldo, setSaldo] = useState(0);
  const [amt, setAmt] = useState(0);
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
  const [cuentaId, setCuentaId] = useState<string | null>(null);
  const [eligiendo, setEligiendo] = useState(false);
  const [stage, setStage] = useState<'cargando' | 'amount' | 'processing' | 'success'>('cargando');
  const [step, setStep] = useState(0);

  // Saldo real de la BD (RLS) menos lo ya retirado en la simulación, y las
  // cuentas registradas en este teléfono.
  useEffect(() => {
    let vivo = true;
    (async () => {
      const [s, retirado, cs] = await Promise.all([getMiSaldo(), totalRetirado(), getCuentas()]);
      if (!vivo) return;
      const disponible = Math.max(0, s - retirado);
      setSaldo(disponible);
      setAmt(disponible);
      setCuentas(cs);
      setCuentaId(cs.find((c) => c.predeterminada)?.id ?? cs[0]?.id ?? null);
      setStage('amount');
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const cuenta = cuentas.find((c) => c.id === cuentaId) ?? null;

  // Etapa "procesando": un paso cada 900ms y al final se guarda el movimiento.
  useEffect(() => {
    if (stage !== 'processing') return;
    if (step >= WITHDRAW_STEPS.length) {
      const done = setTimeout(() => {
        if (cuenta) registrarRetiro(amt, cuenta);
        setStage('success');
      }, 500);
      return () => clearTimeout(done);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [stage, step, amt, cuenta]);

  const presets: [string, number][] = [
    ['25%', Math.round(saldo * 0.25 * 100) / 100],
    ['50%', Math.round(saldo * 0.5 * 100) / 100],
    ['Todo', saldo],
  ];
  const montoValido = amt > 0 && amt <= saldo && !!cuenta;
  const progreso = Math.min(100, (step / WITHDRAW_STEPS.length) * 100);

  if (stage === 'cargando') {
    return (
      <View style={{ paddingVertical: 48, alignItems: 'center' }}>
        <ActivityIndicator color={C.primary} />
      </View>
    );
  }

  return (
    <>
      {stage === 'amount' && (
        <Fade key="amount">
          <Text style={{ fontFamily: F.bold, fontSize: 20, color: FG, letterSpacing: -0.4, marginBottom: 4 }}>Retirar dinero</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginBottom: 18 }}>
            {cuenta ? 'Elige cuánto quieres sacar.' : 'Primero registra dónde quieres recibirlo.'}
          </Text>

          {/* Cuenta destino */}
          {cuenta ? (
            <>
              <PressableScale
                onPress={() => cuentas.length > 1 && setEligiendo((v) => !v)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: R.md, backgroundColor: '#F7F7F6', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)' }}>
                <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: `${C.primary}15`, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="wallet" size={18} color={C.primary} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily: F.semi, fontSize: 13.5, color: FG }}>{etiquetaCuenta(cuenta)}</Text>
                  <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 1 }}>{cuenta.titular}</Text>
                </View>
                {cuentas.length > 1 && <Text style={{ fontFamily: F.semi, fontSize: 11.5, color: C.primary }}>Cambiar</Text>}
              </PressableScale>

              {eligiendo && (
                <Fade key="cuentas" desde={8} style={{ marginTop: 8, gap: 6 }}>
                  {cuentas
                    .filter((c) => c.id !== cuentaId)
                    .map((c) => (
                      <PressableScale
                        key={c.id}
                        onPress={() => {
                          setCuentaId(c.id);
                          setEligiendo(false);
                        }}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: R.sm, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)' }}>
                        <Icon name="wallet" size={15} color={MUTED} />
                        <Text style={{ flex: 1, fontFamily: F.base, fontSize: 12.5, color: FG }}>{etiquetaCuenta(c)}</Text>
                      </PressableScale>
                    ))}
                </Fade>
              )}
            </>
          ) : (
            <PressableScale
              onPress={onAbrirCuentas}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: R.md, backgroundColor: '#0D0D0D' }}>
              <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="plus" size={19} color="#fff" sw={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: F.semi, fontSize: 14, color: '#fff' }}>Registrar mi cuenta</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>CLABE a nombre del titular</Text>
              </View>
              <Icon name="chevR" size={16} color="rgba(255,255,255,0.5)" />
            </PressableScale>
          )}

          <View style={{ alignItems: 'center', paddingTop: 22, paddingBottom: 8 }}>
            <Text style={{ fontFamily: F.base, fontSize: 12, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.24 }}>Cantidad</Text>
            <Text style={{ fontFamily: F.bold, fontSize: 56, color: FG, letterSpacing: -2.24, marginTop: 4 }}>
              <Text style={{ color: MUTED, fontSize: 32 }}>$</Text>
              {amt.toFixed(2)}
            </Text>
            <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 4 }}>Disponible: ${saldo.toFixed(2)}</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', marginVertical: 18 }}>
            {presets.map(([label, val]) => {
              const sel = amt === val && val > 0;
              return (
                <PressableScale
                  key={label}
                  onPress={() => setAmt(val)}
                  style={{ height: 34, paddingHorizontal: 16, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: sel ? 0 : 1, borderColor: 'rgba(0,0,0,0.08)', backgroundColor: sel ? C.primary : 'transparent' }}>
                  <Text style={{ fontFamily: F.base, fontSize: 12, color: sel ? '#fff' : FG }}>{label}</Text>
                </PressableScale>
              );
            })}
          </View>

          <PressableScale
            disabled={!montoValido}
            onPress={() => {
              setStep(0);
              setStage('processing');
            }}
            style={{ height: 52, borderRadius: R.md, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginTop: 6, opacity: montoValido ? 1 : 0.4 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Retirar ${amt.toFixed(2)}</Text>
          </PressableScale>
          <Text style={{ fontFamily: F.reg, fontSize: 10, color: MUTED, textAlign: 'center', marginTop: 10 }}>
            Simulación · aún no hay dispersión bancaria real.
          </Text>
        </Fade>
      )}

      {stage === 'processing' && (
        <Fade key="processing" style={{ paddingVertical: 6 }}>
          <Text style={{ fontFamily: F.bold, fontSize: 20, color: FG, letterSpacing: -0.4, textAlign: 'center' }}>Procesando retiro</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, textAlign: 'center', marginTop: 4, marginBottom: 22 }}>
            ${amt.toFixed(2)} → {cuenta ? etiquetaCuenta(cuenta) : ''}
          </Text>

          {/* Barra de progreso */}
          <View style={{ height: 6, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: 22 }}>
            <BarraProgreso pct={progreso} />
          </View>

          {/* Pasos */}
          <View style={{ gap: 14 }}>
            {WITHDRAW_STEPS.map((label, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 30, height: 30, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? '#00A896' : active ? `${C.primary}18` : 'rgba(0,0,0,0.05)' }}>
                    {done ? (
                      <Icon name="check" size={16} color="#fff" sw={3} />
                    ) : active ? (
                      <ActivityIndicator size="small" color={C.primary} />
                    ) : (
                      <Text style={{ fontFamily: F.bold, fontSize: 12, color: MUTED }}>{i + 1}</Text>
                    )}
                  </View>
                  <Text style={{ fontFamily: F.semi, fontSize: 14, color: done || active ? FG : MUTED }}>{label}</Text>
                </View>
              );
            })}
          </View>
        </Fade>
      )}

      {stage === 'success' && (
        <Fade key="success" style={{ alignItems: 'center', paddingVertical: 24 }}>
          <View style={{ width: 72, height: 72, borderRadius: 999, marginBottom: 18, backgroundColor: 'rgba(0,168,150,0.15)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={36} color="#00A896" sw={2.4} />
          </View>
          <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44 }}>¡Retiro enviado!</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 6, textAlign: 'center', lineHeight: 19 }}>
            ${amt.toFixed(2)} llegarán a tu {cuenta ? etiquetaCuenta(cuenta) : 'cuenta'}{'\n'}en 1–2 días hábiles.
          </Text>
          <PressableScale onPress={onClose} style={{ marginTop: 24, alignSelf: 'stretch', height: 52, borderRadius: R.md, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Listo</Text>
          </PressableScale>
        </Fade>
      )}
    </>
  );
}

// La barra crece con transform (native driver) en vez de animar el ancho:
// animar layout salta en Android.
function BarraProgreso({ pct }: { pct: number }) {
  const escala = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    Animated.timing(escala, { toValue: pct / 100, duration: DUR.slow, easing: EASE.out, useNativeDriver: true }).start();
  }, [escala, pct]);
  return (
    <Animated.View
      style={{
        height: '100%',
        width: '100%',
        borderRadius: 999,
        backgroundColor: C.primary,
        transform: [{ scaleX: escala }, { translateX: 0 }],
        alignSelf: 'flex-start',
      }}
    />
  );
}

// ── Invite sheet (código + QR) ─────────────────────────────────────────────────
const SCRAMBLE = 'ABCDEFGHIJKLMNPQRSTUVWXYZ23456789';
const FINAL_CODE = 'JAVI-2K4N';
const QR_SIZE = 25;
const CELL = 7;

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildQR(seed: number): boolean[][] {
  const rng = mulberry32(seed);
  const g: (string | null)[][] = Array.from({ length: QR_SIZE }, () => Array(QR_SIZE).fill(null));
  const finder = (rr: number, cc: number) => {
    for (let i = 0; i < 7; i++)
      for (let j = 0; j < 7; j++) {
        const inside = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        const ring = i === 0 || i === 6 || j === 0 || j === 6;
        g[rr + i][cc + j] = ring || inside ? 'F' : 'B';
      }
  };
  finder(0, 0);
  finder(0, QR_SIZE - 7);
  finder(QR_SIZE - 7, 0);
  const align = (rr: number, cc: number) => {
    for (let i = 0; i < 5; i++)
      for (let j = 0; j < 5; j++) {
        const ring = i === 0 || i === 4 || j === 0 || j === 4;
        const center = i === 2 && j === 2;
        g[rr + i][cc + j] = ring || center ? 'F' : 'B';
      }
  };
  align(QR_SIZE - 9, QR_SIZE - 9);
  for (let i = 8; i < QR_SIZE - 8; i++) {
    if (g[6][i] == null) g[6][i] = i % 2 === 0 ? 'F' : 'B';
    if (g[i][6] == null) g[i][6] = i % 2 === 0 ? 'F' : 'B';
  }
  for (let r = 0; r < QR_SIZE; r++)
    for (let c = 0; c < QR_SIZE; c++) if (g[r][c] == null) g[r][c] = rng() > 0.5 ? 'D' : 'B';
  return g.map((row) => row.map((cell) => cell === 'F' || cell === 'D'));
}

// Cuadrícula decorativa dibujada como UN solo path SVG. Antes eran 625 Views
// anidadas (25×25): en Android eso costaba varios frames y por eso el QR
// "brincaba" al aparecer en medio de la animación del código.
function QrDecorativo({ grid, size }: { grid: boolean[][]; size: number }) {
  const d = useMemo(
    () => grid.map((row, r) => row.map((on, c) => (on ? `M${c} ${r}h1v1h-1z` : '')).join('')).join(''),
    [grid],
  );
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}>
      <Path d={d} fill="#0D0D0D" />
    </Svg>
  );
}

// Fila del código con efecto de "máquina tragamonedas". Vive en su propio
// componente a propósito: hace ~14 re-renders por segundo y, si estuviera en
// el sheet, repintaría el QR y los botones en cada tick — ese era el flasheo.
const TICK_MS = 70;
const SETTLE_MS = 95;

function CodigoScramble({ genKey, listo, onListo }: { genKey: number; listo: boolean; onListo: () => void }) {
  const [chars, setChars] = useState<string[]>(() => Array(FINAL_CODE.length).fill(''));
  const [settled, setSettled] = useState(0);
  const avisar = useRef(onListo);
  useEffect(() => {
    avisar.current = onListo;
  }, [onListo]);

  useEffect(() => {
    setSettled(0);
    setChars(Array(FINAL_CODE.length).fill(''));

    const scramble = setInterval(() => {
      setChars((prev) =>
        prev.map((_, i) => (FINAL_CODE[i] === '-' ? '-' : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)])),
      );
    }, TICK_MS);

    // Cada carácter se "fija" en cascada; al fijarse el último, el sheet pasa
    // a la fase del QR.
    const timers = FINAL_CODE.split('').map((_, i) => setTimeout(() => setSettled((n) => n + 1), 350 + i * SETTLE_MS));
    const fin = setTimeout(() => {
      clearInterval(scramble);
      setChars(FINAL_CODE.split(''));
      avisar.current();
    }, 350 + FINAL_CODE.length * SETTLE_MS + 120);

    return () => {
      clearInterval(scramble);
      timers.forEach(clearTimeout);
      clearTimeout(fin);
    };
  }, [genKey]);

  const visibles = chars.map((ch, i) => (i < settled ? FINAL_CODE[i] : ch));

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
      {visibles.map((ch, i) => {
        const fijo = i < settled;
        if (ch === '-')
          return (
            <Text key={i} style={{ fontFamily: F.reg, fontSize: 22, color: MUTED }}>
              –
            </Text>
          );
        return (
          <View key={i} style={{ minWidth: 18, borderRadius: 6, paddingHorizontal: 4, paddingVertical: 2, backgroundColor: fijo ? `${C.primary}12` : 'transparent' }}>
            <Text style={{ fontFamily: F.bold, fontSize: 22, letterSpacing: 0.88, textAlign: 'center', color: fijo || listo ? C.primary : FG }}>
              {ch || '·'}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function InviteSheet({ onClose }: { onClose: () => void }) {
  const [genKey, setGenKey] = useState(0);
  // 0: generando código · 1: aparece el QR · 2: listo (CTAs activos)
  const [phase, setPhase] = useState(0);

  const grid = useMemo(() => buildQR(1234 + genKey * 13), [genKey]);
  const alTerminarCodigo = useCallback(() => setPhase(1), []);

  useEffect(() => {
    if (phase !== 1) return;
    const t = setTimeout(() => setPhase(2), 900);
    return () => clearTimeout(t);
  }, [phase]);

  const regenerar = () => {
    setPhase(0);
    setGenKey((k) => k + 1);
  };

  return (
    <>
      <View style={{ alignItems: 'center', marginBottom: 18 }}>
        <Text style={{ fontFamily: F.bold, fontSize: 20, color: FG, letterSpacing: -0.4 }}>Tu código de invitación</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 4 }}>
          Gana <Text style={{ color: C.primary, fontFamily: F.semi }}>$5</Text> cuando un amigo se une.
        </Text>
      </View>

      {/* QR: alto reservado desde el inicio para que la hoja no cambie de
          tamaño a media animación. */}
      <View style={{ alignSelf: 'center', padding: 18, borderRadius: R.lg, backgroundColor: '#FAFAFA', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
        <View style={{ width: QR_SIZE * CELL, height: QR_SIZE * CELL }}>
          {phase >= 1 && (
            <Fade key={`qr-${genKey}`}>
              <QrDecorativo grid={grid} size={QR_SIZE * CELL} />
            </Fade>
          )}
          {phase >= 2 && (
            <Fade
              key={`mark-${genKey}`}
              style={{ position: 'absolute', left: '50%', top: '50%', marginLeft: -20, marginTop: -20, width: 40, height: 40, borderRadius: 10, backgroundColor: '#fff', borderWidth: 2, borderColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center' }}>
              <HazloMark size={20} />
            </Fade>
          )}
        </View>
      </View>

      {/* Código */}
      <View style={{ marginTop: 18 }}>
        <Text style={{ fontFamily: F.semi, fontSize: 10, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginBottom: 8 }}>
          {phase === 0 ? 'Generando código…' : 'Tu código'}
        </Text>
        <CodigoScramble genKey={genKey} listo={phase >= 1} onListo={alTerminarCodigo} />
      </View>

      {/* CTAs */}
      <View style={{ marginTop: 22, opacity: phase >= 2 ? 1 : 0.4 }} pointerEvents={phase >= 2 ? 'auto' : 'none'}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <CopiarCodigo />
          <Pressable style={{ flex: 1, height: 48, borderRadius: R.md, backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="share" size={15} color="#fff" />
            <Text style={{ fontFamily: F.semi, fontSize: 13, color: '#fff' }}>Compartir</Text>
          </Pressable>
        </View>
        <Pressable onPress={regenerar} style={{ marginTop: 12, height: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Icon name="refresh" size={14} color={MUTED} sw={2} />
          <Text style={{ fontFamily: F.base, fontSize: 12, color: MUTED }}>Regenerar código</Text>
        </Pressable>
      </View>
    </>
  );
}

// El "copiado" también se aísla para no repintar la hoja entera.
function CopiarCodigo() {
  const [copied, setCopied] = useState(false);
  return (
    <Pressable
      onPress={() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      style={{ flex: 1, height: 48, borderRadius: R.md, backgroundColor: '#F2F4F7', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <Icon name={copied ? 'check' : 'copy'} size={15} color={copied ? C.primary : FG} sw={copied ? 2.4 : 1.8} />
      <Text style={{ fontFamily: F.semi, fontSize: 13, color: FG }}>{copied ? 'Copiado' : 'Copiar código'}</Text>
    </Pressable>
  );
}

// ── Claim sheet (el cliente reclama un código) ─────────────────────────────────
function ClaimSheet({ onClose }: { onClose: () => void }) {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<Reclamo | null>(null);

  const reclamar = async () => {
    setError(null);
    setLoading(true);
    const r = await reclamarCodigo(codigo);
    setLoading(false);
    if (r.ok) setExito(r);
    else setError(r.error);
  };

  if (exito) {
    return (
      <Fade key="exito" style={{ alignItems: 'center', paddingVertical: 8 }}>
        <>
          <View style={{ width: 72, height: 72, borderRadius: 999, marginBottom: 18, backgroundColor: `${C.primary}18`, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={36} color={C.primary} sw={2.4} />
          </View>
          <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44, textAlign: 'center' }}>¡Recomendación lista!</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 6, textAlign: 'center', lineHeight: 19 }}>
            Muestra este folio en <Text style={{ fontFamily: F.semi, color: FG }}>{exito.negocio}</Text> para reclamar
            {exito.oferta ? <Text style={{ fontFamily: F.semi, color: C.primary }}>{` ${exito.oferta}`}</Text> : ' tu beneficio'}.
          </Text>

          <View style={{ marginTop: 22, alignSelf: 'stretch', paddingVertical: 20, borderRadius: R.lg, backgroundColor: '#0D0D0D', alignItems: 'center' }}>
            <Text style={{ fontFamily: F.semi, fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1.2 }}>Tu folio</Text>
            <Text style={{ fontFamily: F.bold, fontSize: 34, color: '#fff', letterSpacing: 3, marginTop: 6 }}>{exito.folio}</Text>
          </View>

          <Pressable onPress={onClose} style={{ marginTop: 22, alignSelf: 'stretch', height: 52, borderRadius: R.md, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Listo</Text>
          </Pressable>
        </>
      </Fade>
    );
  }

  return (
    <>
      <Text style={{ fontFamily: F.bold, fontSize: 20, color: FG, letterSpacing: -0.4, marginBottom: 4 }}>Reclamar recomendación</Text>
      <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginBottom: 20 }}>Escribe o pega el código que te compartieron.</Text>

      <View style={{ borderRadius: R.md, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FAFAFA' }}>
        <TextInput
          placeholder="HAZLO-XXXX"
          placeholderTextColor={MUTED}
          autoCapitalize="characters"
          autoCorrect={false}
          value={codigo}
          onChangeText={setCodigo}
          onSubmitEditing={reclamar}
          returnKeyType="go"
          style={{ fontFamily: F.bold, fontSize: 20, color: FG, letterSpacing: 2, padding: 0, textAlign: 'center' }}
        />
      </View>

      {error && (
        <View style={{ backgroundColor: 'rgba(235,78,0,0.08)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 12 }}>
          <Text style={{ fontFamily: F.base, fontSize: 12.5, color: C.accent }}>{error}</Text>
        </View>
      )}

      <Pressable
        onPress={reclamar}
        disabled={loading}
        style={{ marginTop: 16, height: 52, borderRadius: R.md, backgroundColor: FG, alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Reclamar</Text>}
      </Pressable>
    </>
  );
}

export function Sheet({
  name,
  onClose,
  onNav,
  onOpenSheet,
  onAbrirCuentas,
}: {
  name: SheetName;
  onClose: () => void;
  onNav: (t: Tab) => void;
  onOpenSheet: (s: SheetName) => void;
  /** Cierra la hoja y lleva a la pantalla de cuentas bancarias. */
  onAbrirCuentas: () => void;
}) {
  const progreso = useState(() => new Animated.Value(0))[0];
  const cerrando = useRef(false);

  useEffect(() => {
    Animated.timing(progreso, { toValue: 1, duration: DUR.slow, easing: EASE.out, useNativeDriver: true }).start();
  }, [progreso]);

  // Anima la salida y recién entonces desmonta o navega. Sin esto la hoja
  // desaparecía de golpe, que es la mitad del efecto feo al cerrar.
  const cerrar = useCallback(
    (despues?: () => void) => {
      if (cerrando.current) return;
      cerrando.current = true;
      Animated.timing(progreso, { toValue: 0, duration: DUR.fast + 50, easing: EASE.in, useNativeDriver: true }).start(
        () => (despues ?? onClose)(),
      );
    },
    [progreso, onClose],
  );

  return (
    <SheetShell progreso={progreso} onCerrar={() => cerrar()}>
      {/* La `key` hace que cambiar de hoja entre con fade, siempre dentro del
          mismo Modal. */}
      <Fade key={name}>
        {name === 'action' ? (
          <ActionSheet onNav={(t) => cerrar(() => onNav(t))} onOpenSheet={onOpenSheet} />
        ) : name === 'withdraw' ? (
          <WithdrawSheet onClose={() => cerrar()} onAbrirCuentas={() => cerrar(onAbrirCuentas)} />
        ) : name === 'claim' ? (
          <ClaimSheet onClose={() => cerrar()} />
        ) : (
          <InviteSheet onClose={() => cerrar()} />
        )}
      </Fade>
    </SheetShell>
  );
}
