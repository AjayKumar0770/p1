import type { Meta, StoryObj } from '@storybook/react';
import StockChart from '../StockChart';
import React, { useEffect, useState } from 'react';

const meta = {
  title: 'Components/StockChart',
  component: StockChart,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StockChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// Generate dummy data
const generateDummyData = () => {
  let price = 150;
  return Array.from({ length: 150 }, (_, i) => {
    price += (Math.random() - 0.5) * 5;
    return {
      time: new Date(Date.now() - (150 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      open: price - Math.random() * 2,
      high: price + Math.random() * 2,
      low: price - Math.random() * 3,
      close: price,
      volume: Math.floor(Math.random() * 1000000),
    };
  });
};

const MockedStockChart = ({ symbol }: { symbol: string }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (url: any, options: any) => {
      if (typeof url === 'string' && url.includes('/api/history')) {
        return {
          ok: true,
          json: async () => generateDummyData(),
        } as any;
      }
      return originalFetch(url, options);
    };
    
    // Use timeout to prevent synchronous update warning in effect
    setTimeout(() => setReady(true), 0);
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  if (!ready) return null;

  return (
    <div style={{ height: '800px', width: '100%', padding: '20px', backgroundColor: '#0f172a' }}>
      <StockChart symbol={symbol} />
    </div>
  );
};

export const Default: Story = {
  render: () => <MockedStockChart symbol="AAPL" />,
  args: { symbol: 'AAPL' } as any,
};
