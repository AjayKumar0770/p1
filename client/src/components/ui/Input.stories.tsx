import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta = {
  title: 'UI Primitives/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text here...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Some predefined text',
    onChange: () => {},
  },
};

export const WithError: Story = {
  args: {
    placeholder: 'Enter your email',
    error: 'Invalid email address',
  },
};
