import { Button } from '@/components/atoms/Button';
import { FC } from 'react';

namespace Navbar {
  export interface Props {}
}

const Navbar: FC<Navbar.Props> = ({}) => {
  return (
    <>
      {/* Desktop Menu */}
      <nav className="hidden justify-between lg:flex">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <a className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tighter">
              ★ Communalists
            </span>
          </a>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <a>Login</a>
          </Button>
          <Button asChild size="sm">
            <a>Signup</a>
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="block lg:hidden">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tighter">
              Communalists
            </span>
          </a>
        </div>
      </div>
    </>
  );
};

export { Navbar };
