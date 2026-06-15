import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from './Toggle';
import React, { useState } from 'react';

const meta = {
  title: 'UI Primitives/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stateful wrapper for interactive story
const StatefulToggle = (args: any) => {
  const [checked, setChecked] = useState(args.checked || false);
  return <Toggle {...args} checked={checked} onChange={(e) => setChecked(e.target.checked)} />;
};

export const Default: Story = {
  render: (args) => <StatefulToggle {...args} />,
  args: {
    label: 'Enable Feature',
    checked: false,
  },
};

export const Checked: Story = {
  render: (args) => <StatefulToggle {...args} />,
  args: {
    label: 'Active Feature',
    checked: true,
  },
};
