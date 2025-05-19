import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming';

const theme = create({
  base: 'dark',
  brandTitle: '★ Communalists',
  brandUrl: 'https://github.com/jadeallencook/communalists',
  brandTarget: '_blank',
});

addons.setConfig({
  theme: theme,
});
