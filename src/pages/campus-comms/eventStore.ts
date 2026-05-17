// Module-level store — persists across route changes within the same session.
// Both EventManagement and CreateEvent import from here.

import { type EventRow } from "../../types/interfaces";
import { SEED_EVENTS } from "../../types/mockData";


const _extra: EventRow[] = [];

export const getEvents = (): EventRow[] => [...SEED_EVENTS, ..._extra];

export const addEvent = (event: Omit<EventRow, "id" | "sNo">): EventRow => {
  const newEvent: EventRow = {
    ...event,
    id:  String(Date.now()),
    sNo: SEED_EVENTS.length + _extra.length + 1,
  };
  _extra.push(newEvent);
  return newEvent;
};
