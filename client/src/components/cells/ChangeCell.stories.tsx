import type { Meta, StoryObj } from '@storybook/react';
import { ChangeCell } from './ChangeCell';
import React, { useState, useEffect } from 'react';

const meta = {
  title: 'Cell Renderers/ChangeCell',
  component: ChangeCell,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ChangeCell>;

export default meta;
type Story = StoryObj<typeof meta>;

// Live updating wrapper
const LiveChangeWrapper = ({ initialChange }: { initialChange: number }) => {
  const [change, setChange] = useState(initialChange);

  useEffect(() => {
    const interval = setInterval(() => {
      setChange((prev) => prev + (Math.random() - 0.5));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return <ChangeCell changePercent={change} />;
};

export const PositiveStatic: Story = {
  args: {
    changePercent: 2.5,
  },
};

export const NegativeStatic: Story = {
  args: {
    changePercent: -1.25,
  },
};

export const LiveFlashing: Story = {
  render: () => <LiveChangeWrapper initialChange={0} />,
  args: { changePercent: 0 } as any,
};
