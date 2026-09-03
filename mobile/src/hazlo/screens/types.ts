// 'home2' es la variante de Inicio en evaluación (estilo fintech oscuro).
export type Tab = 'home' | 'home2' | 'discover' | 'balance' | 'share' | 'profile';
export type SheetName = 'action' | 'withdraw' | 'invite' | 'claim';

export type ScreenProps = {
  go: (t: Tab) => void;
  openSheet: (s: SheetName) => void;
  // Cambia cuando algo externo (p.ej. reclamar un código) debe forzar recarga.
  reloadKey?: number;
};
