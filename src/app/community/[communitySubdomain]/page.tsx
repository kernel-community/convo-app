import Main from "../../../layouts/Main";
import { prisma } from "../../../utils/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CommunityDetails from "../../../components/Community/CommunityDetails";

type Props = {
  params: Promise<{ communitySubdomain: string }>;
};

export const revalidate = 3600; // revalidate every hour

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { communitySubdomain } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.convo.cafe";

  try {
    // Fetch the community data
    const community = await prisma.community.findUnique({
      where: { subdomain: communitySubdomain },
      include: {
        slack: true,
        events: {
          where: { isDeleted: false },
          take: 1,
        },
      },
    });

    if (!community) {
      notFound();
    }

    const metaTitle = `${community.displayName} | Convo Cafe`;
    const metaDescription =
      community.description ||
      `Join the ${community.displayName} community on Convo Cafe`;

    return {
      title: metaTitle,
      description: metaDescription,
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: `${baseUrl}/community/${communitySubdomain}`,
        siteName: "Convo Cafe",
        locale: "en_US",
        type: "profile",
      },
      twitter: {
        card: "summary",
        title: metaTitle,
        description: metaDescription,
      },
    };
  } catch (error) {
    notFound();
  }
}

async function CommunityPage({ params }: Props) {
  const { communitySubdomain } = await params;
  const community = await prisma.community.findUnique({
    where: { subdomain: communitySubdomain },
    include: {
      slack: true,
      events: {
        where: { isDeleted: false },
        orderBy: { startDateTime: "desc" },
        take: 10,
      },
    },
  });

  if (!community) {
    notFound();
  }

  return (
    <Main className="container">
      <CommunityDetails community={community} />
    </Main>
  );
}

export default CommunityPage;
