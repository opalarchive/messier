import { RiSearchLine } from "react-icons/ri";
import type { FC } from "react";

const Search: FC<{}> = () => (
  <div className="p-2 bg-gray-700 rounded shadow flex">
    <span className="p-2 flex items-center justify-start items-center">
      <RiSearchLine />
    </span>
    <input
      className="w-full rounded bg-gray-700 ml-1"
      type="text"
      placeholder="Search..."
    ></input>
  </div>
);

export default Search;
