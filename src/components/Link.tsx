import type { FC } from "react";
import NextLink from "next/link";

const Link: FC<{ className?: string; href: string }> = ({
  className,
  children,
  href,
}) => (
  <NextLink href={href} passHref>
    <a className="cursor-pointer hover:border-current border-b-2 border-transparent border-dotted">
      <span className={className}>{children}</span>
    </a>
  </NextLink>
);

export default Link;
