import { useUIStore } from '../uiStore';

/** Мобильный вид — только по ручному тогглу (mobileMode), без автоопределения. */
export const useIsMobile = () => useUIStore(s => s.mobileMode);
