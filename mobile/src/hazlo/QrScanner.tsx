import { useEffect, useRef, useState } from 'react';
import { Modal, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { interpretarQr, type QrVenta } from '@/lib/services/referrals';
import { Icon } from './icons';
import { C, F } from './theme';
import { PressableScale } from './motion';

// Escáner para el negocio: lee el QR del recomendador (código) o de una visita.
export function QrScanner({
  visible,
  onClose,
  onScan,
}: {
  visible: boolean;
  onClose: () => void;
  onScan: (venta: QrVenta) => void;
}) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [invalido, setInvalido] = useState(false);
  const locked = useRef(false); // evita procesar el mismo frame muchas veces
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Al abrir, rearmamos el escáner y pedimos permiso si falta (sin setState aquí).
  useEffect(() => {
    if (visible) {
      locked.current = false;
      if (permission && !permission.granted) requestPermission();
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [visible, permission, requestPermission]);

  const cerrar = () => {
    if (timer.current) clearTimeout(timer.current);
    locked.current = false;
    setInvalido(false);
    onClose();
  };

  // onBarcodeScanned se dispara en cada frame: bloqueamos al PRIMER disparo para
  // no inundar de renders (eso congelaba la UI y reiniciaba la cámara).
  const handleScan = ({ data }: { data: string }) => {
    if (locked.current) return;
    locked.current = true;
    const venta = interpretarQr(data);
    if (venta) {
      onScan(venta); // el padre cierra el modal
      return;
    }
    // QR no válido: avisamos y rearmamos tras un momento para reintentar.
    setInvalido(true);
    timer.current = setTimeout(() => {
      locked.current = false;
      setInvalido(false);
    }, 1800);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={cerrar} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {permission?.granted ? (
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleScan}
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
            <Icon name="qr" size={44} color="#fff" />
            <Text style={{ fontFamily: F.semi, fontSize: 16, color: '#fff', marginTop: 16, textAlign: 'center' }}>Permite el acceso a la cámara</Text>
            <Text style={{ fontFamily: F.reg, fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 6, textAlign: 'center', lineHeight: 19 }}>
              La usamos solo para escanear el QR del cliente y confirmar la venta.
            </Text>
            <PressableScale onPress={() => requestPermission()} style={{ marginTop: 20, height: 48, paddingHorizontal: 24, borderRadius: 14, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: F.semi, fontSize: 14, color: '#fff' }}>Permitir cámara</Text>
            </PressableScale>
          </View>
        )}

        {/* Marco guía (no captura toques) */}
        {permission?.granted && (
          <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 240, height: 240, borderRadius: 28, borderWidth: 3, borderColor: invalido ? '#EB4E00' : 'rgba(255,255,255,0.9)' }} />
            <Text style={{ fontFamily: F.semi, fontSize: 13, color: '#fff', marginTop: 20, textAlign: 'center', paddingHorizontal: 40 }}>
              {invalido ? 'Ese QR no es de Hazlo Cash.' : 'Apunta al QR del recomendador o del cliente'}
            </Text>
          </View>
        )}

        {/* Barra superior con cerrar — al final del árbol y con zIndex alto para
            garantizar que reciba el toque por encima de la cámara y el marco. */}
        <View style={{ position: 'absolute', top: insets.top + 8, left: 0, right: 0, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 30, elevation: 30 }}>
          <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Escanear QR del cliente</Text>
          <PressableScale onPress={cerrar} hitSlop={16} style={{ width: 40, height: 40, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ transform: [{ rotate: '45deg' }] }}>
              <Icon name="plus" size={22} color="#fff" sw={2.4} />
            </View>
          </PressableScale>
        </View>

        {/* Botón Cancelar grande abajo (respaldo garantizado para salir). */}
        <View style={{ position: 'absolute', bottom: insets.bottom + 24, left: 20, right: 20, zIndex: 30, elevation: 30 }}>
          <PressableScale onPress={cerrar} style={{ height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Cancelar</Text>
          </PressableScale>
        </View>
      </View>
    </Modal>
  );
}
