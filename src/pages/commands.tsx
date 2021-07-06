import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { FC, useState, useEffect } from "react";
import { Disclosure } from "@headlessui/react";
import { RiArrowDownSLine, RiArrowRightSLine } from "react-icons/ri";
import properCase from "../bot/utils/properCase";
import commands from "../../commands.json";

type Argument = {
  name: string;
  optional: boolean;
};

const Command: FC<{
  name: string;
  args?: Argument[];
  cooldown?: Number;
  description: string;
}> = ({ name, args }) => (
  <div>
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button className="flex w-full justify-between">
            <p>
              <span className="text-white">{name}</span>
              {!!args
                ? args.map((el, idx) => (
                    <span key={`arg-${idx}`} className="text-gray-200">
                      {el.name}
                    </span>
                  ))
                : null}
            </p>
            {open ? (
              <RiArrowDownSLine></RiArrowDownSLine>
            ) : (
              <RiArrowRightSLine></RiArrowRightSLine>
            )}
          </Disclosure.Button>
        </>
      )}
    </Disclosure>
  </div>
);

const Category: FC<{ selected?: boolean; name: string }> = ({
  name,
  selected,
}) => (
  <div
    className={`rounded-md w-full text-center text-xl cursor-pointer p-2 ${
      selected ? "bg-green-900" : "bg-green-800"
    }`}
  >
    <Link
      href={{
        query: name === "All" ? {} : { category: name.toLowerCase() },
      }}
      shallow
      passHref
    >
      <a>{name}</a>
    </Link>
  </div>
);

const categories = Object.keys(commands).map((el) => properCase(el));

const Commands: FC<{}> = () => {
  const router = useRouter();
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    setSelected((router.query.category as string) || "");
  }, [router.query]);

  return (
    <>
      <Head>
        <title>Commands | Messier</title>
        <meta
          name="description"
          content="Commands for the Messier Discord bot, a bot which allows you to manage solutions to problems from common math contests."
        />
      </Head>
      <div className="py-16 px-4 flex bg-green-800 justify-center items-center flex-col">
        <h1 className="text-6xl sm:text-6xl font-black my-2.5">Commands</h1>
        <h2 className="text-4xl sm:text-4xl text-center my-2.5">
          List of bot commands for Discord
        </h2>
      </div>
      <div className="justify-center items-center flex flec-col">
        <div className="p-5 grid gap-4 grid-cols-wait also 1 sm:grid-cols-2">
          {/*
           * This is what the categories should look like normally
           */}
          <div className="space-y-4 bg-gray-900 flex flex-col items-center p-4 rounded">
            <Category
              name="All"
              selected={
                !categories.some(
                  (el) => el.toLowerCase() === selected.toLowerCase()
                )
              }
            />
            {categories.map((el) => (
              <Category
                name={el}
                selected={el.toLowerCase() === selected.toLowerCase()}
                key={`${el}-category`}
              />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-2">
            {/*
             * This is what a command with NO subcommands should look like
             */}
            <Command
              name="Rama"
              args={[{ name: "rating", optional: false }]}
              description="Worship our lord Rama"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Commands;
