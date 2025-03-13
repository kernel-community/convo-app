import { getEmberBySlug } from "src/lib/blog";
import Main from "src/layouts/Main";
import { DateTime } from "luxon";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import BlogBackground from "src/components/BlogBackground";

interface Props {
  params: {
    slug: string;
  };
}

export default function BlogPost({ params }: Props) {
  const ember = getEmberBySlug(params.slug);

  if (!ember) {
    notFound();
  }

  return (
    <Main>
      {/* Background SVG */}
      <BlogBackground />
      <article className="container relative py-16">
        <Link href={"/blog"}>
          <span className="mb-6 flex flex-row gap-2 font-secondary text-muted-foreground underline decoration-dashed underline-offset-4 hover:text-primary">
            <ArrowLeft />
            Hearth
          </span>
        </Link>
        <header className="mb-12">
          <h1 className="mb-4 font-primary text-4xl">{ember.title}</h1>
          <div className="flex gap-2 font-secondary text-muted-foreground">
            {ember.author && (
              <span>
                Written by{" "}
                {ember.authorWebsite ? (
                  <a
                    href={ember.authorWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-dashed underline-offset-4 transition-colors hover:text-primary"
                  >
                    {ember.author}
                  </a>
                ) : (
                  ember.author
                )}
              </span>
            )}
            <span>•</span>
            <span>
              {DateTime.fromISO(ember.date).isValid
                ? DateTime.fromISO(ember.date).toLocaleString(
                    DateTime.DATE_FULL
                  )
                : "Date not available"}
            </span>
          </div>
        </header>
        <div className="hover:prose-a:text-primary/80 prose prose-lg max-w-none font-secondary dark:prose-invert prose-headings:font-primary prose-a:text-primary">
          <ReactMarkdown>{ember.content}</ReactMarkdown>
        </div>
      </article>
    </Main>
  );
}
