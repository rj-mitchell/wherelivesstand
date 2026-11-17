// In-app links: real <a href> elements (so they open in new tabs, can be copied and work without the
// app), which the app intercepts for ordinary clicks.
import React, { createContext, useContext } from 'react';

export type Navigate = (href: string, opts?: { replace?: boolean }) => void;

export const NavContext = createContext<Navigate>(href => {
  window.location.assign(href);
});

export const useNavigate = () => useContext(NavContext);

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export const Link: React.FC<LinkProps> = ({ href, onClick, ...rest }) => {
  const navigate = useNavigate();
  return (
    <a
      href={href}
      onClick={e => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(href);
      }}
      {...rest}
    />
  );
};
