const dot = '__dot__';
const at = '__at__';

export const encodeEmail = (email: string) =>
    email.replace('@', at).replace('.', dot);

export const decodeEmail = (email: string) =>
    email.replace(at, '@').replace(dot, '.');
