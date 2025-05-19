import { FC } from 'react';
import { Footer as Component } from './Footer';
import { createClient } from '@/prismicio';

const Footer: FC = async () => {
  const client = createClient();
  const { data } = await client.getSingle('footer');
  return <Component {...data} />;
};

export { Footer };
