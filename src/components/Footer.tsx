import type { FC } from "react";
import Link from "next/link";

const FooterLink: FC<{ href: string }> = ({ href, children }) => (
  <Link href={href} passHref>
    <a className="font-medium text-gray-50 hover:text-gray-300">{children}</a>
  </Link>
);

const Footer: FC<{}> = () => (
  <footer className="w-full text-center p-4 pin-b">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 space-y-4">
      <div className="flex flex-col items-center justify-center">
        <Link href="/" passHref>
          <a className="h-20 w-20 relative cursor-pointer">Messier</a>
        </Link>
      </div>
      <div>
        <h1 className="text-lg tracking-wide font-bold text-gray-300 uppercase">
          Info
        </h1>
        <ul className="mt-4 space-y-2">
          <li className="text-base truncate">
            <FooterLink href="/">Home</FooterLink>
          </li>
          <li className="text-base truncate">
            <FooterLink href="/about">About</FooterLink>
          </li>
          <li className="text-base truncate">
            <FooterLink href="/docs">API Docs</FooterLink>
          </li>
        </ul>
      </div>
      <div>
        <h1 className="text-lg tracking-wide font-bold text-gray-300 uppercase">
          Discord
        </h1>
        <ul className="mt-4 space-y-2">
          <li className="text-base truncate">
            <FooterLink href="/invite">Invite</FooterLink>
          </li>
          <li className="text-base truncate">
            <FooterLink href="/support">Support</FooterLink>
          </li>
          <li className="text-base truncate">
            <FooterLink href="/guidelines">Guidelines</FooterLink>
          </li>
        </ul>
      </div>
      <div>
        <h1 className="text-lg tracking-wide font-bold text-gray-300 uppercase">
          Help Us!
        </h1>
        <ul className="mt-4 space-y-2">
          <li className="text-base truncate">
            <FooterLink href="/help/add">Add Problems</FooterLink>
          </li>
          <li className="text-base truncate">
            <FooterLink href="/help/review">Review Problems</FooterLink>
          </li>
          <li className="text-base truncate">
            <FooterLink href="/help/code">Contribute</FooterLink>
          </li>
        </ul>
      </div>
      <div>
        <h1 className="text-lg tracking-wide font-bold text-gray-300 uppercase">
          Contact
        </h1>
        <ul className="mt-4 space-y-2">
          <li className="text-base truncate">
            <FooterLink href="/contact-us">Contact Us</FooterLink>
          </li>
          <li className="text-base truncate">
            <FooterLink href="/blog">Blog</FooterLink>
          </li>
          <li className="text-base truncate">
            <FooterLink href="/about-us">About Us</FooterLink>
          </li>
        </ul>
      </div>
    </div>
    <div className="text-gray-300 border-t border-gray-200 mt-4 pt-2">
      Copyright © 2021 OPAL. Content and Design may not be reproduced without
      explicit permission of the authors.
    </div>
  </footer>
);

export default Footer;
