import React, { useState, useRef, useEffect } from 'react';
import { formatVolume } from '../../utils/formatters';

export interface VolumeCellProps {
  volume: number;
}

export const VolumeCell = React.memo(({ volume }: VolumeCellProps) => {
  const [flashClass, setFlashClass] = useState("");
  const prevVolRef = useRef<number | null>(null);

  useEffect(() => {
    if (volume === undefined) return;
    if (prevVolRef.current !== null && prevVolRef.current !== volume) {
      setFlashClass("flash-up");
      const timer = setTimeout(() => setFlashClass(""), 300);
      return () => clearTimeout(timer);
    }
    prevVolRef.current = volume;
  }, [volume]);

  return (
    <span className={`inline-block px-1 rounded transition-colors duration-300 font-mono text-gray-300 ${flashClass}`}>
      {formatVolume(volume)}
    </span>
  );
});

VolumeCell.displayName = "VolumeCell";
