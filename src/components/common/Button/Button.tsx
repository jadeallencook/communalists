import * as React from 'react';
import styles from './Button.module.css';
import classNames from 'classnames';

namespace Button {
  export type Variant =
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'destructive'
    | 'outline'
    | 'link';
  export type Size = 'small' | 'medium' | 'large';
  export interface Props extends React.ComponentProps<'button'> {
    className?: string;
    variant?: Variant;
    size?: Size;
    asChild?: boolean;
  }
}

const Button = ({
  className,
  asChild = false,
  variant = 'primary',
  size = 'medium',
  ...props
}: Button.Props) => (
  <button
    type="button"
    tabIndex={0}
    className={classNames(
      styles.root,
      styles[variant],
      styles[size],
      className,
    )}
    {...props}
  />
);

export { Button };
