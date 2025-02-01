"use client";

import Main from "src/layouts/Main";
import { Month } from "src/components/Month";

const TestPage = () => {
  return (
    <Main className="max-h-[100dvh]">
      <div className="container mx-auto">
        <Month />
      </div>
    </Main>
  );
};

export default TestPage;
