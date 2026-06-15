import React, { useState, useRef, useEffect } from 'react';

export interface ChangeCellProps {
  changePercent: number;
}

export const ChangeCell = React.memo(({ changePercent }: ChangeCellProps) => {
  const [flashClass, setFlashClass] = useState("");
  const prevPctRef = useRef<number | null>(null);

  useEffect(() => {
    if (changePercent === undefined) return;
    if (prevPctRef.current !== null && prevPctRef.current !== changePercent) {
      const isUp = changePercent > prevPctRef.current;
      setFlashClass(isUp ? "flash-up" : "flash-down");
      const timer = setTimeout(() => setFlashClass(""), 300);
      return () => clearTimeout(timer);
    }
    prevPctRef.current = changePercent;
  }, [changePercent]);

  const isPositive = changePercent >= 0;

  return (
    <span
      className={`inline-block px-1 rounded transition-colors duration-300 font-mono font-semibold ${
        isPositive ? "text-emerald-500" : "text-rose-500"
      } ${flashClass}`}
    >
      {isPositive ? "+" : ""}
      {changePercent.toFixed(2)}%
    </span>
  );
});

ChangeCell.displayName = "ChangeCell";
