import type { Meta, StoryObj } from '@storybook/react';
import { PriceCell } from './PriceCell';
import React, { useState, useEffect } from 'react';

const meta = {
  title: 'Cell Renderers/PriceCell',
  component: PriceCell,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PriceCell>;

export default meta;
type Story = StoryObj<typeof meta>;

// Live updating wrapper
const LivePriceWrapper = ({ initialPrice }: { initialPrice: number }) => {
  const [price, setPrice] = useState(initialPrice);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrice((prev) => prev + (Math.random() - 0.5) * 5);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return <PriceCell price={price} />;
};

export const Static: Story = {
  args: {
    price: 150.25,
  },
};

export const LiveFlashing: Story = {
  render: () => <LivePriceWrapper initialPrice={150.25} />,
  args: { price: 150.25 } as any,
};
