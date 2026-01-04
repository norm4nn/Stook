import React, { createContext, useContext, useMemo, useRef, useState, useCallback } from 'react';

type Shareables = {
  phone: string;
  linkedin: string;
  favoriteMeme: string;
  bonus: string;
};

type NfcPacket = {
  id: string;
  timestamp: number;
  active: boolean;
  payload: Shareables;
};

type StookContextValue = {
  isActive: boolean;
  toggleActive: (value?: boolean) => void;
  shareables: Shareables;
  updateShareable: <K extends keyof Shareables>(key: K, value: Shareables[K]) => void;
  resetShareables: () => void;
  enqueueMockTap: () => void;
  latestPacket: NfcPacket | null;
  acknowledgePacket: (id: string) => void;
  lastDeliveredPacket: NfcPacket | null;
};

const defaultShareables: Shareables = {
  phone: '+48 789 123 456',
  linkedin: 'linkedin.com/in/szymon',
  favoriteMeme: '“Stook or be shook” gif',
  bonus: 'Instant friend request',
};

const StookContext = createContext<StookContextValue | undefined>(undefined);

const buildPacket = (shareables: Shareables, active: boolean): NfcPacket => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  timestamp: Date.now(),
  active,
  payload: shareables,
});

export function StookProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(true);
  const [shareables, setShareables] = useState<Shareables>(defaultShareables);
  const [latestPacket, setLatestPacket] = useState<NfcPacket | null>(null);
  const [lastDeliveredPacket, setLastDeliveredPacket] = useState<NfcPacket | null>(null);
  const queueRef = useRef<NfcPacket[]>([]);

  const flushQueue = useCallback(() => {
    setLatestPacket((currentPacket) => {
      if (currentPacket) {
        return currentPacket;
      }
      const nextPacket = queueRef.current.shift();
      if (!nextPacket) {
        return currentPacket;
      }
      return nextPacket;
    });
  }, []);

  const toggleActive = (value?: boolean) => {
    setIsActive((prev) => {
      if (typeof value === 'boolean') {
        return value;
      }
      return !prev;
    });
  };

  const updateShareable = <K extends keyof Shareables>(key: K, value: Shareables[K]) => {
    setShareables((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetShareables = () => setShareables(defaultShareables);

  const enqueueMockTap = useCallback(() => {
    queueRef.current.push(buildPacket(shareables, isActive));
    flushQueue();
  }, [shareables, isActive, flushQueue]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      flushQueue();
    }, 1500);

    return () => clearInterval(interval);
  }, [flushQueue]);

  const acknowledgePacket = useCallback((id: string) => {
    setLatestPacket((packet) => {
      if (packet && packet.id === id) {
        setLastDeliveredPacket(packet);
        return null;
      }
      return packet;
    });
  }, []);

  const value = useMemo(
    () => ({
      isActive,
      toggleActive,
      shareables,
      updateShareable,
      resetShareables,
      enqueueMockTap,
      latestPacket,
      acknowledgePacket,
      lastDeliveredPacket,
    }),
    [isActive, shareables, latestPacket, enqueueMockTap, acknowledgePacket, lastDeliveredPacket]
  );

  return <StookContext.Provider value={value}>{children}</StookContext.Provider>;
}

export function useStook() {
  const context = useContext(StookContext);
  if (!context) {
    throw new Error('useStook must be used within StookProvider');
  }

  return context;
}

export type { Shareables };
export type { NfcPacket };
export { defaultShareables as defaultStookShareables };
