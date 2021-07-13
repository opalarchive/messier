import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { FC, useState, useEffect } from "react";
import { Disclosure, Transition } from "@headlessui/react";
import { RiArrowDownSLine, RiArrowRightSLine } from "react-icons/ri";
import properCase from "../bot/utils/properCase";
import clsx from "clsx";

let commands = {};

try {
  commands = require("../../commands.json");
} catch (e) {
  console.log("No commands found.");
}

const allCommands = {};
Object.keys(commands).forEach((el) =>
  Object.keys(commands[el]).forEach(
    (cmd) => (allCommands[cmd] = commands[el][cmd])
  )
);

type Argument = {
  name: string;
  optional: boolean;
};

const Command: FC<{
  name: string;
  args?: Argument[];
  cooldown?: number;
  description: string;
  aliases: string[];
}> = ({ name, args, cooldown, description, aliases }) => (
  <div>
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button className="w-full bg-blue-700 rounded-t rounded-b-none px-4 py-2">
            <div className="flex w-full justify-between text-left">
              <div className="w-11/12">
                <div>
                  <span className="text-white text-lg font-extrabold tracking-wide">
                    {name}
                  </span>
                  {!!args
                    ? args.map((el, idx) => (
                        <span
                          key={`arg-${idx}`}
                          className="text-yellow-300 text-lg font-semibold"
                        >
                          {!!el.optional ? ` [${el.name}]` : ` (${el.name})`}
                        </span>
                      ))
                    : null}
                </div>
                <div
                  className={clsx(
                    "text-white text-opacity-70 font-md leading-5",
                    {
                      "mb-2 mt-2": open,
                      truncate: !open,
                    }
                  )}
                >
                  Aliases: {aliases.join(", ")}
                </div>
                <div
                  className={clsx("text-sm w-full text-left", {
                    truncate: !open,
                  })}
                >
                  {description}
                </div>
              </div>
              <span className="pt-6">
                {open ? (
                  <RiArrowDownSLine size={24} />
                ) : (
                  <RiArrowRightSLine size={24} />
                )}
              </span>
            </div>
          </Disclosure.Button>
          <Transition
            enter="transition duration-500 ease-out"
            enterFrom="transform h-0 opacity-0"
            enterTo="transform h-full opacity-100"
            leave="transition duration-400 ease-out"
            leaveFrom="transform h-full opacity-100"
            leaveTo="transform h-0 opacity-0"
          >
            <Disclosure.Panel>
              <div className="px-4 py-2 bg-indigo-900 bg-opacity-20	">
                <div className="mt-2">
                  <h2 className="text-white font-bold text-lg">Usage</h2>
                  <span className="ml-1 text-gray-200">{`&${name} `}</span>
                  {!!args
                    ? args.map((el, idx) => (
                        <span key={`arg-${idx}`} className="text-yellow-400">
                          {!!el.optional ? ` [${el.name}]` : ` (${el.name})`}
                        </span>
                      ))
                    : null}
                </div>
                {!!cooldown ? (
                  <div className="mt-4">
                    <h2 className="text-white font-bold text-lg">Cooldown</h2>
                    <div className="ml-1">{cooldown / 1000} seconds</div>
                  </div>
                ) : null}
              </div>
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  </div>
);

const Category: FC<{ selected?: boolean; name: string }> = ({
  name,
  selected,
}) => (
  <Link
    href={{
      query: name === "All" ? {} : { category: name.toLowerCase() },
    }}
    shallow
    passHref
  >
    <a
      className={clsx(
        "rounded-md w-full text-center text-xl cursor-pointer px-8 py-2",
        {
          "bg-blue-900": selected,
          "bg-blue-800": !selected,
        }
      )}
    >
      {name}
    </a>
  </Link>
);

const categories = Object.keys(commands).map((el) => properCase(el));

const Commands: FC<{}> = () => {
  const router = useRouter();
  const [selected, setSelected] = useState<string>("");
  const [cmds, setCmds] = useState(allCommands);

  useEffect(() => {
    const newSelected = ((router.query.category as string) || "").toLowerCase();
    setSelected(newSelected);
    setCmds(
      !categories.some((el) => el.toLowerCase() === newSelected.toLowerCase())
        ? allCommands
        : commands[newSelected.toLowerCase()]
    );
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
      <div className="py-16 px-4 flex bg-blue-800 justify-center items-center flex-col">
        <h1 className="text-6xl sm:text-6xl font-black my-2.5 font-sans">
          Commands
        </h1>
        <h2 className="text-4xl sm:text-4xl text-center my-2.5">
          List of Messier Commands
        </h2>
      </div>
      <div className="justify-center items-start px-5 py-10 space-x-5 sm:flex">
        <div className="space-y-4 bg-gray-900 flex col-span-1 flex-col items-center p-4 rounded grid">
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
        <div className="grid grid-cols-1 md:col-span-2 lg:col-span-3 gap-5">
          {Object.keys(cmds)
            .sort()
            .map((el) => (
              <Command key={`command-${el}`} name={el} {...cmds[el]} />
            ))}
        </div>
      </div>
    </>
  );
};

export default Commands;
