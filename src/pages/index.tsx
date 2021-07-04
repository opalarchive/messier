import Head from "next/head";
import type { FC } from "react";
import Image from "next/image";
import Link from "../components/Link";

const ImageComponent: FC<{ imageSrc?: string; imageAlt?: string }> = ({
  imageSrc = "",
  imageAlt,
}) => (
  <div className="shadow-img m-auto lg:max-w-xl max-w-2xl">
    <Image
      src={imageSrc}
      layout="responsive"
      width="902"
      height="601"
      alt={imageAlt}
    />
  </div>
);

const Section: FC<{
  imageSrc?: string;
  imageAlt?: string;
  align?: "left" | "right";
  backgroundColor?: string;
  showBorder?: boolean;
  id?: string;
}> = ({
  children,
  imageSrc = "",
  imageAlt,
  align = "right",
  backgroundColor = "",
  showBorder = true,
  id,
}) => (
  <div
    className={`relative px-4 md:py-10 py-8 ${
      showBorder ? "z-10" : `bg-${backgroundColor}`
    }`}
    id={id}
  >
    {showBorder && <div className={`zig-zag-border bg-${backgroundColor}`} />}
    <div className="grid grid-cols-4 gap-10 lg:grid-cols-8 z-10 col">
      {align === "left" && (
        <div
          className={`col-span-4 h-auto w-full ${
            align === "left" ? "hidden lg:block" : ""
          }`}
        >
          <ImageComponent imageSrc={imageSrc} imageAlt={imageAlt} />
        </div>
      )}
      <div className="col-span-4 h-auto flex justify-center items-center">
        <div className="lg:max-w-xl max-w-2xl">{children}</div>
      </div>
      <div
        className={`col-span-4 h-auto w-full ${
          align === "left" ? "block lg:hidden" : ""
        }`}
      >
        <ImageComponent imageSrc={imageSrc} imageAlt={imageAlt} />
      </div>
    </div>
  </div>
);

export default function Home() {
  return (
    <>
      <Head>
        <title>Messier</title>
        <meta
          name="description"
          content="This is the homepage for the Messier Discord bot, a bot that is capable of displaying math problems from various math contests along with their TeX code and other metadata."
        />
      </Head>
      <div className="my-16 mx-4 flex justify-center items-center flex-col">
        <h1 className="text-7xl sm:text-9xl font-black tracking-wide my-3">
          Messier
        </h1>
        <h2 className="text-4xl sm:text5xl font-bold text-gray-300 max-w-3xl my-3 text-center">
          The go-to Discord bot for retrieving math problems, creating
          groupsolves, and more!
        </h2>
        <div className="p-5 grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div className="rounded-md grid-1 shadow">
            <a
              href="#"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-2xl md:px-10"
            >
              Invite Me!
            </a>
          </div>
          <div className="mt-3 grid-1 sm:mt-0 sm:ml-3">
            <a
              href="#"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-2xl md:px-10"
            >
              Read More!
            </a>
          </div>
        </div>
      </div>
      <Section
        imageSrc="/image.jpeg"
        align="left"
        backgroundColor="blue-900"
        id="problems"
        imageAlt="Mountain Background"
      >
        <div className="pl-2">
          <h1 className="text-4xl sm:text-5xl tracking-tight font-extrabold text-gray-200 py-6">
            <span className="block xl:inline">Access problems on the go</span>
          </h1>
          <span className="text-xl sm:text-2xl text-gray-300">
            <span className="block xl:inline">
              With Messier, grab problems anytime from our database of over 1000
              problems from select contests. You&apos;re one command away.&nbsp;
              <Link className="text-yellow-500" href="/about">
                <span className="sr-only">Learn more about us</span>
                Learn More
              </Link>
            </span>
          </span>
        </div>
      </Section>
      <div className="py-8 lg:py-16 bg-red-900 z--2" id="tex">
        <Section
          imageSrc="/image.jpeg"
          showBorder={false}
          imageAlt="Mountain Background"
        >
          <div className="pl-2">
            <h1 className="text-4xl sm:text-5xl tracking-tight font-extrabold text-gray-200 py-6">
              <span className="block xl:inline">
                Obtain well-maintained TeX code
              </span>
            </h1>
            <span className="text-xl sm:text-2xl text-gray-300">
              <span className="block xl:inline">
                To save you from typing redundant TeX code, Messier provides
                well-maintained TeX source for all its problems, using under 10
                packages!&nbsp;
                <Link className="text-green-400" href="/about">
                  <span className="sr-only">Learn more about us</span>
                  Learn More
                </Link>
              </span>
            </span>
          </div>
        </Section>
      </div>
      <Section
        imageSrc="/image.jpeg"
        showBorder={true}
        align="left"
        backgroundColor="purple-900"
        id="collaborate"
        imageAlt="Mountain Background"
      >
        <div className="pl-2">
          <h1 className="text-4xl sm:text-5xl tracking-tight font-extrabold text-gray-200 py-6">
            <span className="block xl:inline">Collaborate with friends</span>
          </h1>
          <span className="text-xl sm:text-2xl text-gray-300">
            <span className="block xl:inline">
              With our groupsolve and PoTD commands, solving and sharing math
              problems over Discord has never been easier to do!&nbsp;
              <Link className="text-yellow-500" href="/commands">
                <span className="sr-only">View all commands</span>
                Learn More
              </Link>
            </span>
          </span>
        </div>
      </Section>
      <div className="py-8 lg:py-16 bg-green-900 z--2" id="api">
        <Section
          imageSrc="/image.jpeg"
          showBorder={false}
          imageAlt="Mountain Background"
        >
          <div className="pl-2">
            <h1 className="text-4xl sm:text-5xl tracking-tight font-extrabold text-gray-200 py-6">
              <span className="block xl:inline">Use our built-in API</span>
            </h1>
            <span className="text-xl sm:text-2xl text-gray-300">
              <span className="block xl:inline">
                Sometimes, Discord isn&apos;t your destination - maybe you have
                a different endpoint. No worries - we&apos;ve got you covered
                with our Official API.&nbsp;
                <Link className="text-blue-400" href="/docs">
                  <span className="sr-only">View the API Docs</span>
                  Learn More
                </Link>
              </span>
            </span>
          </div>
        </Section>
      </div>
    </>
  );
}
