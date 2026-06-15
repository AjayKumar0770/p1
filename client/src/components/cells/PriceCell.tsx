import React, { useState, useRef, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';

export interface PriceCellProps {
  price: number;
}

export const PriceCell = React.memo(({ price }: PriceCellProps) => {
  const [flashClass, setFlashClass] = useState("");
  const prevPriceRef = useRef<number | null>(null);

  useEffect(() => {
    if (price === undefined) return;
    if (prevPriceRef.current !== null && prevPriceRef.current !== price) {
      const isUp = price > prevPriceRef.current;
      setFlashClass(isUp ? "flash-up" : "flash-down");
      const timer = setTimeout(() => setFlashClass(""), 300);
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = price;
  }, [price]);

  return (
    <span className={`inline-block px-1 rounded transition-colors duration-300 font-mono text-white ${flashClass}`}>
      {formatCurrency(price)}
    </span>
  );
});

PriceCell.displayName = "PriceCell";
