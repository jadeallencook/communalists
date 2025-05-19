import type { Preview } from '@storybook/react';
import '../src/app/globals.css';
import { ThemeProvider } from '../src/contexts/theme';
import React from 'react';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => {
      return (
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Story />
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
