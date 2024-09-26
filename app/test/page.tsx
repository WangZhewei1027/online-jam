"use client";

import { useEffect, useState } from "react";

function Child({ setData }: { setData: (value: string) => void }) {
  const index = "sdfsd";
  setData(index);
  return <div>child</div>;
}

export default function Page() {
  const [data, setData] = useState<string>("");

  return (
    <div>
      <button onClick={() => console.log(data)}>button</button>
      <Child setData={setData} />
    </div>
  );
}
