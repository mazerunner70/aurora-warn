import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Graph from '../Graph';

const meta = {
  title: 'Components/Graph',
  component: Graph,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '600px', height: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Graph>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: [
      { epochtime: 1733554800, value: 5, statusId: 'green' },
      { epochtime: 1733583600, value: 7, statusId: 'amber' },
      { epochtime: 1704240000, value: 3, statusId: 'red' },
      { epochtime: 1704326400, value: 9, statusId: 'yellow' },
    ],
  },
};

export const SinglePoint: Story = {
  args: {
    data: [
      { epochtime: 1704067200, value: 5, statusId: 'green' },
    ],
  },
};

export const NoData: Story = {
  args: {
    data: [],
  },
}; 