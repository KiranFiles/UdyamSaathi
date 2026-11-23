import { z } from "zod";
import { BusinessProfile, CatalogueItem } from "../src/lib/schemas";
import cache from "../src/data/demo/cached_responses.json";
import { demoFlag, endpoint, isFixture, photo } from "./_lib/http";
import { ask } from "./_lib/llm";
import { prompts } from "./_lib/prompts";
export default endpoint(
  z.object({
    profile: BusinessProfile,
    images: photo.array().max(3),
    demo: demoFlag,
  }),
  CatalogueItem.array(),
  async ({ profile, images, demo }) => {
    if (!images.length) return [];
    const items = isFixture(demo)
      ? cache.catalogue
      : await ask(
          CatalogueItem.array().max(20),
          prompts.catalogue,
          { activity: profile.activity, language: profile.language },
          images,
        );
    return items.map((item) => ({ ...item, imageUrl: "" }));
  },
);
