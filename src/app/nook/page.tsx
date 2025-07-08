import React from "react";
import Main from "src/layouts/Main";
import { isFellow } from "src/lib/flags";

export default async function NookPage() {
  const hasFellowAccess = await isFellow();

  console.log("Fellow access status:", hasFellowAccess);

  return (
    <Main>
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="text-lg text-gray-600">This is a placeholder page</p>
          <p className="text-sm text-green-600">
            Fellow access granted {JSON.stringify(hasFellowAccess)}
          </p>
        </div>
      </div>
    </Main>
  );
}
