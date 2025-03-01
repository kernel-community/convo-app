import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface Ember {
  slug: string;
  title: string;
  date: string;
  description: string;
  content: string;
  author?: string;
  authorWebsite?: string;
}

const postsDirectory = path.join(process.cwd(), "src/content/blog");

export function getAllEmbers(): Ember[] {
  // Get file names under /content/blog
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      // Remove ".md" from file name to get slug
      const slug = fileName.replace(/\.md$/, "");

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      // Use gray-matter to parse the post metadata section
      const { data, content } = matter(fileContents);

      // Combine the data with the slug
      return {
        slug,
        content,
        ...(data as { title: string; date: string; description: string }),
      };
    });

  // Sort posts by date
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getEmberBySlug(slug: string): Ember | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Use gray-matter to parse the post metadata section
    const { data, content } = matter(fileContents);

    // Combine the data with the id and contentHtml
    return {
      slug,
      content,
      ...(data as { title: string; date: string; description: string }),
    };
  } catch (error) {
    return null;
  }
}
