/**
 * fetch all events in the collection ids
 * "b40af3a5-73bd-49af-a014-fb6f8ecd4893" and "3e5e2ea6-b054-4600-b683-452e68809b51"
 *
 * for b40af3a5-73bd-49af-a014-fb6f8ecd4893, change
 * <a href=""https://convo.cafe/kb8-intro-conversations">here</a>
 * to
 * <a href="https://convo.cafe/collection/b40af3a5-73bd-49af-a014-fb6f8ecd4893">here</a>
 *
 *
 * and for 3e5e2ea6-b054-4600-b683-452e68809b51, change
 * <a href=""https://convo.cafe/kb8-intro-conversations">here</a>
 * to
 * <a href="https://convo.cafe/collection/3e5e2ea6-b054-4600-b683-452e68809b51">here</a>
 *
 */

import { prisma } from "src/utils/db";

const main = async () => {
  const events = await prisma.event.findMany({
    where: {
      collections: {
        some: {
          id: "3e5e2ea6-b054-4600-b683-452e68809b51",
        },
      },
    },
  });
  for (let i = 0; i < events.length; i++) {
    const description = events[i]?.descriptionHtml;
    const updatedDescription = description?.replace(
      `<a href=""https://convo.cafe/kb8-intro-conversations">here</a>`,
      `<a href="https://convo.cafe/collection/3e5e2ea6-b054-4600-b683-452e68809b51">here</a>`
    );
    const updated = await prisma.event.update({
      where: {
        id: events[i]?.id,
      },
      data: {
        descriptionHtml: updatedDescription,
      },
    });
    console.log("updated", updated.id);
  }
};
main();
