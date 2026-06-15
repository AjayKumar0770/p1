import type { Meta, StoryObj } from '@storybook/react';
import { RangeFilter } from './RangeFilter';

const meta = {
  title: 'Filters/RangeFilter',
  component: RangeFilter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RangeFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Market Cap Range ($)',
    min: 0,
    max: 1000000000,
    step: 1000000,
    initialValue: [5000000, 500000000],
  },
};

export const PriceRange: Story = {
  args: {
    label: 'Price Range',
    min: 0,
    max: 500,
    step: 0.5,
    initialValue: [10, 250],
  },
};
