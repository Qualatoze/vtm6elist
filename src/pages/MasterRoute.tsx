import { MasterPage1 } from '../components/MasterPage1';
import { MasterPage2 } from '../components/MasterPage2';
import { MasterPage4 } from '../components/MasterPage4';
import { useIsMobile } from '../hooks/useIsMobile';

export const MasterRoute = () => {
  const isMobile = useIsMobile();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      <MasterPage1 />
      <MasterPage2 />
      <MasterPage4 />
    </div>
  );
};
