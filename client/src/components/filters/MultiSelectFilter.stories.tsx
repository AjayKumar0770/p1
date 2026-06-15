import type { Meta, StoryObj } from '@storybook/react';
import { MultiSelectFilter } from './MultiSelectFilter';

const meta = {
  title: 'Filters/MultiSelectFilter',
  component: MultiSelectFilter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MultiSelectFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SectorFilter: Story = {
  args: {
    label: 'Select Sectors',
    options: [
      { label: 'Technology', value: 'tech' },
      { label: 'Healthcare', value: 'health' },
      { label: 'Financials', value: 'finance' },
      { label: 'Energy', value: 'energy' },
      { label: 'Consumer Discretionary', value: 'consumer' },
    ],
    initialSelected: ['tech', 'finance'],
  },
};
