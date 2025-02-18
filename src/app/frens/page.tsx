"use client";

import { Github, MoveUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Main from "src/layouts/Main";
import {
  CoolEmoji,
  HeartEmoji,
  HeartEyesEmoji,
} from "src/components/ui/emojis";
import { useState, memo, useEffect, Suspense } from "react";
import { cn } from "src/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

const contributors = [
  {
    name: "Angela",
    url: "https://x.com/probablyangg",
    contribution: ["dev", "design", "product"],
    image: "",
  },
  {
    name: "Kernel",
    url: "https://kernel.community/",
    contribution: ["sponsor", "kernel", "big daddy"],
    image: "",
  },
  {
    name: "Vivek",
    url: "https://github.com/kernel-community",
    contribution: ["kernel", "product"],
    image: "",
  },
  {
    name: "Aliya",
    url: "https://github.com/kernel-community",
    contribution: ["kernel"],
    image: "",
  },
  {
    name: "Ricy",
    url: "",
    contribution: ["frontend"],
    image: "",
  },
  {
    name: "Alanah",
    url: "",
    contribution: ["design", "logo", "colors"],
    image: "",
  },
  {
    name: "Ash",
    url: "",
    contribution: ["design", "emojis", "logo", "product"],
    image: "",
  },
  {
    name: "Kanika",
    url: "",
    contribution: ["frontend"],
    image: "",
  },
  {
    name: "Aviraj",
    url: "",
    contribution: ["backend"],
    image: "",
  },
  {
    name: "Abhimanyu",
    url: "",
    contribution: ["backend"],
    image: "",
  },
  {
    name: "Claude",
    url: "https://claude.ai",
    contribution: ["everything"],
    image: "",
  },
];

const ContributionPill = memo(
  ({
    contribution,
    isSelected,
    onClick,
  }: {
    contribution: string;
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full px-3 py-1 font-secondary text-sm transition-all",
        isSelected
          ? "hover:bg-foreground/90 bg-foreground text-background hover:scale-105"
          : "bg-muted-foreground/10 hover:bg-muted-foreground/20 text-muted-foreground hover:scale-105"
      )}
    >
      {contribution}
    </button>
  )
);

ContributionPill.displayName = "ContributionPill";

const ContributionOptions = {
  code: {
    title: "Code",
    description: "Build convo together. Tech stack: Next.js, Tailwind",
    link: "https://github.com/Kernel-Community/convo-app/issues",
  },
  design: {
    title: "Design",
    description: "Shape the look and feel",
    link: "https://github.com/Kernel-Community/convo-app/issues?q=is%3Aissue+is%3Aopen+label%3Adesign",
  },
  test: {
    title: "Test",
    description: "Book a call to help test the latest features and UX",
    link: "https://cal.com/angelag/convo-cafe",
  },
  donate: {
    title: "Donate",
    description: "Mint a Kernel Seal with a custom ETH amount",
    link: "https://sign.kernel.community/essay?mint=open",
  },
} as const;

type ContributionType = keyof typeof ContributionOptions;

function FrensContent() {
  const [selectedContribution, setSelectedContribution] = useState<
    string | null
  >(null);
  const [showOptions, setShowOptions] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle URL query params
  useEffect(() => {
    const contribute = searchParams.get("contribute");
    const filter = searchParams.get("filter");

    // Update states based on URL params
    setShowOptions(contribute === "true");
    setSelectedContribution(filter);
  }, [searchParams]);

  const updateURL = (params: {
    contribute?: boolean;
    filter?: string | null;
  }) => {
    const currentParams = new URLSearchParams(window.location.search);

    // Handle contribute param
    if (params.contribute === true) {
      currentParams.set("contribute", "true");
    } else if (params.contribute === false) {
      currentParams.delete("contribute");
    }

    // Handle filter param
    if (params.filter === null) {
      currentParams.delete("filter");
    } else if (params.filter) {
      currentParams.set("filter", params.filter);
    }

    // Build the URL
    const query = currentParams.toString();
    const url = query ? `?${query}` : "/frens";

    router.push(url, { scroll: false });
  };

  const handleContributionClick = (contribution: string | null) => {
    setSelectedContribution(contribution);
    updateURL({ filter: contribution });
  };

  const handleShowOptions = () => {
    setShowOptions(true);
    updateURL({ contribute: true });
  };

  const handleHideOptions = () => {
    setShowOptions(false);
    updateURL({ contribute: false });
  };

  // Get unique contributions
  const uniqueContributions = Array.from(
    new Set(contributors.flatMap((c) => c.contribution))
  ).sort();

  // Filter contributors based on selected contribution
  const filteredContributors = selectedContribution
    ? contributors.filter((c) => c.contribution.includes(selectedContribution))
    : contributors;
  return (
    <Main className="px-6 lg:px-52">
      <div className="flex flex-col items-center space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="flex items-center gap-2 whitespace-nowrap font-primary text-3xl font-semibold italic sm:gap-3 sm:text-4xl lg:text-5xl">
            Frens of Convo
            <Image
              src="/images/logo.png"
              alt="Convo Logo"
              width={40}
              height={40}
              className="-mx-1 h-8 w-8 opacity-80 sm:h-10 sm:w-10"
            />
            <HeartEmoji
              width={45}
              height={45}
              className="-mb-1 -ml-2 sm:-ml-3 sm:h-[65px] sm:w-[65px]"
            />
          </h1>
          <p className="font-secondary text-muted-foreground">
            life is gud with frens :)
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {uniqueContributions.map((contribution) => (
            <ContributionPill
              key={contribution}
              contribution={contribution}
              isSelected={selectedContribution === contribution}
              onClick={() =>
                handleContributionClick(
                  selectedContribution === contribution ? null : contribution
                )
              }
            />
          ))}
        </div>
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleShowOptions}
            className="flex items-center space-x-2 rounded-lg border-2 border-foreground bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <CoolEmoji width={33} height={33} className="-m-2" />
            <span>Join the fun?</span>
          </button>

          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  height: { duration: 0.3, ease: "easeInOut" },
                  opacity: { duration: 0.2 },
                }}
                className="w-full overflow-hidden"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-4 rounded-lg border-2 border-foreground bg-background p-6"
                >
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <h2 className="flex items-center gap-3 font-primary text-2xl font-semibold">
                        choose your adventure
                      </h2>
                      <button
                        onClick={handleHideOptions}
                        className="rounded-full p-2 hover:bg-muted"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="mt-2 font-secondary text-sm text-muted-foreground">
                      we&apos;ll love you no matter what you pick
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(
                      Object.keys(ContributionOptions) as ContributionType[]
                    ).map((type) => (
                      <Link
                        key={type}
                        href={ContributionOptions[type].link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex h-[120px] flex-col rounded-lg border-2 border-foreground p-4 shadow-[4px_4px_0px_0px] shadow-foreground transition-colors hover:bg-muted active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px] active:shadow-foreground"
                      >
                        <div className="flex h-full flex-col">
                          <h3 className="mb-2 font-primary text-lg font-semibold">
                            {ContributionOptions[type].title}
                          </h3>
                          <p className="font-secondary text-sm text-muted-foreground">
                            {ContributionOptions[type].description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredContributors.map((contributor) => (
            <div
              key={contributor.name}
              className="flex flex-col rounded-lg border-2 border-foreground p-6"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-foreground bg-muted">
                  {contributor.image ? (
                    <Image
                      src={contributor.image}
                      alt={`${contributor.name}'s avatar`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-primary text-2xl font-semibold text-muted-foreground">
                      {contributor.name[0]}
                    </div>
                  )}
                </div>
                <div className="w-full">
                  <div className="mb-3 flex items-center justify-center gap-2">
                    <h2 className="font-primary text-lg font-semibold">
                      {contributor.name}
                    </h2>
                    {contributor.url && (
                      <Link
                        href={contributor.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:bg-muted-foreground/10 rounded-md p-1"
                      >
                        <MoveUpRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {contributor.contribution.map((role) => (
                      <ContributionPill
                        key={role}
                        contribution={role}
                        isSelected={selectedContribution === role}
                        onClick={() =>
                          setSelectedContribution(
                            selectedContribution === role ? null : role
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Main>
  );
}

export default function FrensPage() {
  return (
    <Suspense
      fallback={
        <Main className="px-6 lg:px-52">
          <div className="flex flex-col items-center space-y-8">Loading...</div>
        </Main>
      }
    >
      <FrensContent />
    </Suspense>
  );
}
