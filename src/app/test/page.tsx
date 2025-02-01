"use client";

import Main from "src/layouts/Main";
import { Month } from "src/components/Month";

const TestPage = () => {
  return (
    <Main className="max-h-[100dvh]">
      <Month className="px-12" />
    </Main>
  );
};

export default TestPage;
