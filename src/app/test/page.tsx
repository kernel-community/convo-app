"use client";

import Main from "src/layouts/Main";
import { Month } from "src/components/Month";
import { ProposeSheet } from "src/components/ProposeSheet";
import { Suspense } from "react";

const TestPage = () => {
  return (
    <Main className="max-h-[100dvh]">
      <div className="container mx-auto">
        <div className="flex items-center justify-between pb-6">
          <h1 className="font-heading text-3xl font-bold">Calendar</h1>
          <ProposeSheet />
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <Month />
        </Suspense>
      </div>
    </Main>
  );
};

export default TestPage;
