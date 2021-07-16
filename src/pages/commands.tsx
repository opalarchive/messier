import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { FC, useState, useEffect } from "react";
import { Disclosure, Transition } from "@headlessui/react";
import { RiArrowDownSLine, RiArrowRightSLine } from "react-icons/ri";
import properCase from "../bot/utils/properCase";
import clsx from "clsx";
import type { ValidArgs } from "../bot/classes/Arg";

type Arg = {
  name: string;
  optional?: boolean;
  type?: ValidArgs;
};

type SubCommand = {
  aliases?: string[];
  cooldown?: number;
  staff?: boolean;
  args?: Arg[];
  description: string;
};

type Command = SubCommand & { subcommands?: Record<string, SubCommand> };

let commands: Record<string, Record<string, Command>> = {};

try {
  commands = require("../../commands.json");
  Object.freeze(commands);
} catch (e) {
  console.log("No commands found.");
}

const allCommands = {};
Object.keys(commands).forEach((el) =>
  Object.keys(commands[el]).forEach(
    (cmd) => (allCommands[cmd] = { ...commands[el][cmd], category: el })
  )
);
Object.freeze(allCommands);

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
  subcommands?: Record<string, SubCommand>;
}> = ({ name, args, cooldown, description, aliases, subcommands }) => (
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
                {aliases[0] && (
                  <div
                    className={clsx(
                      "text-white text-opacity-70 font-md leading-5 mb-1 mt-1",
                      {
                        truncate: !open,
                      }
                    )}
                  >
                    Aliases: {aliases.join(", ")}
                  </div>
                )}
                <div
                  className={clsx("text-sm w-full text-left", {
                    truncate: !open,
                  })}
                >
                  {description}
                </div>
              </div>
              <span
                className={clsx({
                  "pt-6": !!aliases[0],
                  "pt-3": !aliases[0],
                })}
              >
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

                {!!subcommands && !!Object.keys(subcommands)[0] ? (
                  <div className="mt-4">
                    <Link
                      href={{ query: { command: name.toLowerCase() } }}
                      shallow
                      passHref
                    >
                      <a>
                        <h2 className="text-white hover:underline font-bold text-lg">
                          Subcommands
                        </h2>
                      </a>
                    </Link>
                    <div className="ml-1">
                      {Object.keys(subcommands).join(", ")}
                    </div>
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
      className={clsx({
        "rounded-md mx-2 my-2 sm:m-0 flex-grow sm:w-full text-center text-xl cursor-pointer px-8 sm:px-12 py-2":
          true,
        "bg-blue-900": selected,
        "bg-blue-800": !selected,
      })}
    >
      {name}
    </a>
  </Link>
);

const categories = Object.keys(commands).map((el) => properCase(el));

const Commands: FC<{}> = () => {
  const router = useRouter();
  const [selected, setSelected] = useState<string>("");
  const [cmds, setCmds] = useState({});

  const getNewCommands = (selected: string, command: string) => {
    if (selected === "command") {
      const obj = Object.assign({}, allCommands[command]);
      if (!obj) return allCommands;
      const subcommands = obj.subcommands;
      delete obj.subcommands;

      const commands = { [command]: obj };
      Object.keys(subcommands).forEach((el) => {
        const subcommand = subcommands[el];

        ["cooldown", "staff", "description"].forEach((key) => {
          if (!subcommand[key]) subcommand[key] = obj[key];
        });

        subcommand.aliases = subcommand.aliases.map(
          (al: string) => `${command} ${al}`
        );

        commands[`${command} ${el}`] = subcommand;
      });
      return commands;
    }
    if (categories.some((el) => el.toLowerCase() === selected.toLowerCase()))
      return commands[selected.toLowerCase()];
    return allCommands;
  };

  useEffect(() => {
    let newSelected = ((router.query.category as string) || "").toLowerCase();
    if (router.query.command as string) newSelected = "command";
    setSelected(newSelected);
    setCmds(
      getNewCommands(newSelected, (router.query.command as string) || "")
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
      <div className="justify-center items-start px-5 py-10 space-y-5 sm:space-y-0 sm:space-x-5 sm:flex sm:flex-none sm:w-11/12 lg:w-5/6 sm:m-auto">
        <div className="flex sm:space-x-0 sm:space-y-4 bg-gray-900 p-2 sm:p-4 rounded sm:grid flex-wrap justify-between">
          <Category
            name="All"
            selected={
              !categories.some(
                (el) => el.toLowerCase() === selected.toLowerCase()
              ) && selected !== "command"
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
        <div className="grid grid-cols-1 w-full gap-5">
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
