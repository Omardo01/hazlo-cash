export type Tab = 'home' | 'discover' | 'balance' | 'share' | 'profile';
export type SheetName = 'action' | 'withdraw' | 'invite' | 'claim';

export type ScreenProps = {
  go: (t: Tab) => void;
  openSheet: (s: SheetName) => void;
  // Cambia cuando algo externo (p.ej. reclamar un código) debe forzar recarga.
  reloadKey?: number;
};
