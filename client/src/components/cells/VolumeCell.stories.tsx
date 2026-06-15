import type { Meta, StoryObj } from '@storybook/react';
import { VolumeCell } from './VolumeCell';
import React, { useState, useEffect } from 'react';

const meta = {
  title: 'Cell Renderers/VolumeCell',
  component: VolumeCell,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof VolumeCell>;

export default meta;
type Story = StoryObj<typeof meta>;

// Live updating wrapper
const LiveVolumeWrapper = ({ initialVolume }: { initialVolume: number }) => {
  const [volume, setVolume] = useState(initialVolume);

  useEffect(() => {
    const interval = setInterval(() => {
      setVolume((prev) => prev + Math.floor(Math.random() * 5000));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return <VolumeCell volume={volume} />;
};

export const Static: Story = {
  args: {
    volume: 1250000,
  },
};

export const LiveFlashing: Story = {
  render: () => <LiveVolumeWrapper initialVolume={1000000} />,
  args: { volume: 1000000 } as any,
};
