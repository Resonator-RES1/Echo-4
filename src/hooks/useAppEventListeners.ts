import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../stores/useProjectStore';

export function useAppEventListeners(
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setIsMobile: React.Dispatch<React.SetStateAction<boolean>>
) {
  const navigate = useNavigate();
  const isZenMode = useProjectStore(state => state.isZenMode);
  const setIsZenMode = useProjectStore(state => state.setIsZenMode);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  useEffect(() => {
    const handleToggleSearch = () => {
      setIsSearchOpen(prev => !prev);
    };
    window.addEventListener('toggle-global-search', handleToggleSearch);
    return () => window.removeEventListener('toggle-global-search', handleToggleSearch);
  }, [setIsSearchOpen]);

  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log('Navigate event received:', customEvent.detail);
      if (customEvent.detail === 'settings') {
        navigate('/settings');
      } else if (customEvent.detail === 'welcome') {
        navigate('/');
      } else if (customEvent.detail === 'manuscript') {
        navigate('/manuscript');
      } else if (customEvent.detail === 'workspace') {
        navigate('/workspace');
      } else if (customEvent.detail === 'timeline') {
        navigate('/timeline');
      } else if (customEvent.detail === 'lore') {
        navigate('/lore');
      } else if (customEvent.detail === 'voices') {
        navigate('/voices');
      } else if (customEvent.detail === 'suite') {
        navigate('/suite');
      }
    };
    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, [navigate]);

  // Zen Mode Esc listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode, setIsZenMode]);
}
