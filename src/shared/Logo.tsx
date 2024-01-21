import React from 'react';
import logo from '../assets/logo.png';
import { Image } from '@mantine/core';

interface LogoProps {
    height: number;
}

const Logo = ({ height }: LogoProps) => (
    <Image radius="md" h={height} w="auto" fit="contain" src={logo} />
);

export default Logo;
