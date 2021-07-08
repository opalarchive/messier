import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { FC, useState, useEffect } from "react";
import { Disclosure, Transition } from "@headlessui/react";
import { RiArrowDownSLine, RiArrowRightSLine } from "react-icons/ri";
import properCase from "../bot/utils/properCase";

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
}> = ({ name, args, cooldown, description }) => (
  <div>
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button className="flex w-full justify-between bg-blue-600 rounded px-4 py-2">
            <p>
              <span className="text-white text-lg font-bold tracking-wide">{`&${name}`}</span>
              {!!args
                ? args.map((el, idx) => (
                    <span
                      key={`arg-${idx}`}
                      className="text-yellow-300 text-lg"
                    >
                      {!!el.optional ? ` [${el.name}]` : ` (${el.name})`}
                    </span>
                  ))
                : null}
            </p>
            <span className="pt-1">
              {open ? <RiArrowDownSLine /> : <RiArrowRightSLine />}
            </span>
          </Disclosure.Button>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel>
              <div className="px-4 pt-2">
                <p>{description}</p>
                {!!cooldown ? (
                  <p className="text-gray-400">
                    Cooldown: {cooldown / 1000} seconds
                  </p>
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
      className={`rounded-md w-full text-center text-xl cursor-pointer px-8 py-2 ${
        selected ? "bg-blue-900" : "bg-blue-800"
      }`}
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
    setSelected(((router.query.category as string) || "").toLowerCase());
    setCmds(
      !categories.some((el) => el.toLowerCase() === selected.toLowerCase())
        ? allCommands
        : commands[selected.toLowerCase()]
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
        <h1 className="text-6xl sm:text-6xl font-black my-2.5">Commands</h1>
        <h2 className="text-4xl sm:text-4xl text-center my-2.5">
          List of Messier Commands
        </h2>
      </div>
      <div className="justify-center items-center flex flec-col">
        <div className="p-5 grid gap-4 grid-cols-wait also 1 w-5/6 md:grid-cols-3 lg:grid-cols-4">
          <div className="space-y-4 bg-gray-900 flex col-span-1 flex-col items-center p-4 rounded">
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
          <div className="grid grid-cols-1 md:col-span-2 lg:col-span-3 gap-4">
            {Object.keys(cmds).map((el) => (
              <Command key={`command-${el}`} name={el} {...cmds[el]} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Commands;
