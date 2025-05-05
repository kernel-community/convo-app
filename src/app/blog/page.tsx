import { getAllEmbers } from "src/lib/blog";
import Main from "src/layouts/Main";
import { DateTime } from "luxon";
import Image from "next/image";
import Link from "next/link";
import BlogBackground from "src/components/BlogBackground";

export default function BlogPage() {
  const embers = getAllEmbers();

  return (
    <Main>
      {/* Background SVG */}
      {/* <BlogBackground /> */}
      <div className="container relative px-6 py-6 sm:px-24 sm:py-12">
        <div className="mb-16">
          <h1 className="mb-3 inline-flex items-center gap-4 font-primary text-4xl">
            Hearth{" "}
            <Image
              src="/images/hearth.svg"
              alt="Hearth"
              width={32}
              height={32}
            />
          </h1>
          <p className="max-w-2xl font-secondary text-lg leading-relaxed text-muted-foreground">
            Hearth /härTH/ (<span className="italic">noun</span>): A warm,
            central place for updates
          </p>
          <p className="max-w-2xl font-secondary text-lg leading-relaxed text-muted-foreground">
            Ember /ˈembər/ (<span className="italic">noun</span>): Small but
            meaningful sparks of improvement
          </p>
        </div>
        <div className="space-y-12">
          {embers.map((ember) => (
            <article key={ember.slug} className="group">
              <div className="space-y-3">
                <Link href={`/blog/${ember.slug}`}>
                  <h2 className="font-primary text-2xl transition-colors group-hover:text-primary">
                    {ember.title}
                  </h2>
                </Link>
                <div className="flex gap-2 font-secondary text-sm text-muted-foreground">
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
                {ember.description && (
                  <Link href={`/blog/${ember.slug}`}>
                    <p className="group-hover:text-primary/80 font-secondary text-muted-foreground transition-colors">
                      {ember.description}
                    </p>
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </Main>
  );
}
