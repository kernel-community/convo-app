import React from "react";
import Main from "src/layouts/Main";
import { isFellow } from "src/lib/flags";
import { CreateResonance } from "src/components/nook/CreateResonance";
import { SimilarProfiles } from "src/components/nook/SimilarProfiles";
import { CommunityProfiles } from "src/components/nook/CommunityProfiles";

export default async function NookPage() {
  const hasFellowAccess = await isFellow();

  console.log("Fellow access status:", hasFellowAccess);

  return (
    <Main>
      <div className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="flex flex-col items-start">
            <h1 className="text-center font-brand text-3xl font-bold">Nook</h1>
            <p className="font-primary text-sm text-green-600">
              Fellow access granted
            </p>
          </div>

          <div className="space-y-16">
            <section className="flex min-h-[50vh] items-center justify-center">
              <CreateResonance />
            </section>

            <section className="w-full">
              <SimilarProfiles />
            </section>

            <section className="w-full">
              <CommunityProfiles />
            </section>
          </div>
        </div>
      </div>
    </Main>
  );
}
