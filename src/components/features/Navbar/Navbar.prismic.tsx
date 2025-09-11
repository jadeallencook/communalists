import { FC } from 'react';
import { Navbar as Component } from './Navbar';
import { createClient } from '@/prismicio';

const Navbar: FC = async () => {
  const client = createClient();
  const { data } = await client.getSingle('navbar');
  return <Component {...data} />;
};

export { Navbar };
