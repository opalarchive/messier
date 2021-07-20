import Search from "../components/Search";
import type { FC } from "react";

const search: FC<{}> = () => {
  return (
    <>
      <div className="flex w-full align-center justify-center">
        <Search />
      </div>
    </>
  );
};

export default search;
