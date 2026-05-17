// Module-level store — persists across route changes within the same session.
// Both FeedManagement and CreateFeed import from here.

import { type FeedRow } from "../../types/interfaces";
import { SEED_FEEDS } from "../../types/mockData";


// Extra feeds added at runtime (created via CreateFeed)
const _extra: FeedRow[] = [];

export const getFeeds = (): FeedRow[] => [...SEED_FEEDS, ..._extra];

export const addFeed = (feed: Omit<FeedRow, "id" | "sNo">): FeedRow => {
  const newFeed: FeedRow = {
    ...feed,
    id:  String(Date.now()),
    sNo: SEED_FEEDS.length + _extra.length + 1,
  };
  _extra.push(newFeed);
  return newFeed;
};
