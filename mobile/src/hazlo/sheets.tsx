import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, TextInput, View } from 'react-native';

import { reclamarCodigo, type Reclamo } from '@/lib/services/referrals';
import { HazloMark } from './HazloMark';
import { Icon, IconName } from './icons';
import { C, F, FG, MUTED, R } from './theme';
import type { SheetName, Tab } from './screens/types';

// ── Shell común de bottom sheet ────────────────────────────────────────────────
function SheetShell({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 44 }}>
          <View style={{ width: 36, height: 5, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.18)', alignSelf: 'center', marginBottom: 18 }} />
          {children}
        </Pressable>
      </Pressable>
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
  onClose,
  onNav,
  onOpenSheet,
}: {
  onClose: () => void;
  onNav: (t: Tab) => void;
  onOpenSheet: (s: SheetName) => void;
}) {
  return (
    <SheetShell onClose={onClose}>
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
    </SheetShell>
  );
}

// ── Withdraw sheet ─────────────────────────────────────────────────────────────
const presets = ['25', '50', '100', '245.80'];

function WithdrawSheet({ onClose }: { onClose: () => void }) {
  const [amt, setAmt] = useState('100.00');
  const [stage, setStage] = useState<'amount' | 'success'>('amount');

  return (
    <SheetShell onClose={onClose}>
      {stage === 'amount' ? (
        <>
          <Text style={{ fontFamily: F.bold, fontSize: 20, color: FG, letterSpacing: -0.4, marginBottom: 4 }}>Retirar dinero</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginBottom: 22 }}>A tu cuenta BBVA •• 4421</Text>

          <View style={{ alignItems: 'center', paddingTop: 20, paddingBottom: 8 }}>
            <Text style={{ fontFamily: F.base, fontSize: 12, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.24 }}>Cantidad</Text>
            <Text style={{ fontFamily: F.bold, fontSize: 56, color: FG, letterSpacing: -2.24, marginTop: 4 }}>
              <Text style={{ color: MUTED, fontSize: 32 }}>$</Text>
              {amt}
            </Text>
            <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 4 }}>Disponible: $245.80</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', marginVertical: 18 }}>
            {presets.map((p) => {
              const sel = amt === parseFloat(p).toFixed(2);
              return (
                <Pressable
                  key={p}
                  onPress={() => setAmt(parseFloat(p).toFixed(2))}
                  style={{ height: 34, paddingHorizontal: 14, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: sel ? 0 : 1, borderColor: 'rgba(0,0,0,0.08)', backgroundColor: sel ? C.primary : 'transparent' }}>
                  <Text style={{ fontFamily: F.base, fontSize: 12, color: sel ? '#fff' : FG }}>${p === '245.80' ? 'Todo' : p}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => setStage('success')}
            style={{ height: 52, borderRadius: R.md, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginTop: 6 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Retirar ${amt}</Text>
          </Pressable>
        </>
      ) : (
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <View style={{ width: 72, height: 72, borderRadius: 999, marginBottom: 18, backgroundColor: `${C.primary}18`, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={36} color={C.primary} sw={2.4} />
          </View>
          <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44 }}>¡Retiro enviado!</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 6, textAlign: 'center', lineHeight: 19 }}>
            ${amt} llegarán a tu cuenta{'\n'}en 1–2 días hábiles.
          </Text>
          <Pressable onPress={onClose} style={{ marginTop: 24, alignSelf: 'stretch', height: 52, borderRadius: R.md, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Listo</Text>
          </Pressable>
        </View>
      )}
    </SheetShell>
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

function InviteSheet({ onClose }: { onClose: () => void }) {
  const [genKey, setGenKey] = useState(0);
  const [phase, setPhase] = useState(0);
  const [chars, setChars] = useState<string[]>(Array(FINAL_CODE.length).fill(''));
  const [settled, setSettled] = useState(0);
  const [copied, setCopied] = useState(false);

  const grid = useMemo(() => buildQR(1234 + genKey * 13), [genKey]);

  useEffect(() => {
    setPhase(0);
    setSettled(0);
    setChars(Array(FINAL_CODE.length).fill(''));
    const scramble = setInterval(() => {
      setChars((prev) => prev.map((_, i) => (FINAL_CODE[i] === '-' ? '-' : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)])));
    }, 55);
    const settleTimers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < FINAL_CODE.length; i++) settleTimers.push(setTimeout(() => setSettled((s) => s + 1), 350 + i * 95));
    const toQR = setTimeout(() => {
      clearInterval(scramble);
      setChars(FINAL_CODE.split(''));
      setPhase(1);
    }, 350 + FINAL_CODE.length * 95 + 120);
    const toDone = setTimeout(() => setPhase(2), 350 + FINAL_CODE.length * 95 + 120 + 900);
    return () => {
      clearInterval(scramble);
      settleTimers.forEach(clearTimeout);
      clearTimeout(toQR);
      clearTimeout(toDone);
    };
  }, [genKey]);

  const displayChars = chars.map((ch, i) => (i < settled ? FINAL_CODE[i] : ch));

  return (
    <SheetShell onClose={onClose}>
      <View style={{ alignItems: 'center', marginBottom: 18 }}>
        <Text style={{ fontFamily: F.bold, fontSize: 20, color: FG, letterSpacing: -0.4 }}>Tu código de invitación</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 4 }}>
          Gana <Text style={{ color: C.primary, fontFamily: F.semi }}>$5</Text> cuando un amigo se une.
        </Text>
      </View>

      {/* QR */}
      <View style={{ alignSelf: 'center', padding: 18, borderRadius: R.lg, backgroundColor: '#FAFAFA', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
        <View style={{ width: QR_SIZE * CELL, height: QR_SIZE * CELL }}>
          {phase >= 1 &&
            grid.map((row, rr) => (
              <View key={rr} style={{ flexDirection: 'row' }}>
                {row.map((on, cc) => (
                  <View key={cc} style={{ width: CELL, height: CELL, backgroundColor: on ? '#0D0D0D' : 'transparent' }} />
                ))}
              </View>
            ))}
          {phase >= 2 && (
            <View style={{ position: 'absolute', left: '50%', top: '50%', marginLeft: -20, marginTop: -20, width: 40, height: 40, borderRadius: 10, backgroundColor: '#fff', borderWidth: 2, borderColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center' }}>
              <HazloMark size={20} />
            </View>
          )}
        </View>
      </View>

      {/* Código */}
      <View style={{ marginTop: 18 }}>
        <Text style={{ fontFamily: F.semi, fontSize: 10, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginBottom: 8 }}>
          {phase === 0 ? 'Generando código…' : 'Tu código'}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
          {displayChars.map((ch, i) => {
            const isSettled = i < settled;
            if (ch === '-') return <Text key={i} style={{ fontFamily: F.reg, fontSize: 22, color: MUTED }}>–</Text>;
            return (
              <View key={i} style={{ minWidth: 18, borderRadius: 6, paddingHorizontal: 4, paddingVertical: 2, backgroundColor: isSettled ? `${C.primary}12` : 'transparent' }}>
                <Text style={{ fontFamily: F.bold, fontSize: 22, letterSpacing: 0.88, textAlign: 'center', color: isSettled || phase >= 1 ? C.primary : FG }}>{ch || '·'}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* CTAs */}
      <View style={{ marginTop: 22, opacity: phase >= 2 ? 1 : 0.4 }} pointerEvents={phase >= 2 ? 'auto' : 'none'}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            onPress={() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            style={{ flex: 1, height: 48, borderRadius: R.md, backgroundColor: '#F2F4F7', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name={copied ? 'check' : 'copy'} size={15} color={copied ? C.primary : FG} sw={copied ? 2.4 : 1.8} />
            <Text style={{ fontFamily: F.semi, fontSize: 13, color: FG }}>{copied ? 'Copiado' : 'Copiar código'}</Text>
          </Pressable>
          <Pressable style={{ flex: 1, height: 48, borderRadius: R.md, backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="share" size={15} color="#fff" />
            <Text style={{ fontFamily: F.semi, fontSize: 13, color: '#fff' }}>Compartir</Text>
          </Pressable>
        </View>
        <Pressable onPress={() => setGenKey((k) => k + 1)} style={{ marginTop: 12, height: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Icon name="refresh" size={14} color={MUTED} sw={2} />
          <Text style={{ fontFamily: F.base, fontSize: 12, color: MUTED }}>Regenerar código</Text>
        </Pressable>
      </View>
    </SheetShell>
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
      <SheetShell onClose={onClose}>
        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
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
        </View>
      </SheetShell>
    );
  }

  return (
    <SheetShell onClose={onClose}>
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
    </SheetShell>
  );
}

export function Sheet({
  name,
  onClose,
  onNav,
  onOpenSheet,
}: {
  name: SheetName;
  onClose: () => void;
  onNav: (t: Tab) => void;
  onOpenSheet: (s: SheetName) => void;
}) {
  if (name === 'action') return <ActionSheet onClose={onClose} onNav={onNav} onOpenSheet={onOpenSheet} />;
  if (name === 'withdraw') return <WithdrawSheet onClose={onClose} />;
  if (name === 'claim') return <ClaimSheet onClose={onClose} />;
  return <InviteSheet onClose={onClose} />;
}
