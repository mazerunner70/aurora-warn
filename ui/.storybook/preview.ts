import type { Preview } from "@storybook/react";
import { fn } from '@storybook/test';

const preview: Preview = {
  parameters: {
    actions: {
      // Remove argTypesRegex
      // Define actions explicitly if needed
      handles: ['click', 'change'], // Example of explicit actions
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
