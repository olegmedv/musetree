import { Readable, writable } from "svelte/store";
import { SectionStore } from "./section";
import { arrayEqual, maybeDerived } from "../utils";

export type MusenetEncoding = number[];
export type EncodingState = { encoding: MusenetEncoding; }
export type EncodingStore = Readable<EncodingState>;

export function createRootEncodingStore(): EncodingStore {
  return writable({ encoding: [] });
}
export function createBranchEncodingStore(parent: EncodingStore, sectionStore: SectionStore): EncodingStore {
  return maybeDerived<[EncodingStore, SectionStore], EncodingState>([parent, sectionStore],
    ([$parent, $sectionStore]) => ({
      encoding: [...$parent.encoding, ...$sectionStore.section.encoding]
    }), { encoding: [] }, (a, b) => arrayEqual(a.encoding, b.encoding));
}

export function createEncodingStore(parent: null | ({ type: "root" }) | (Parameters<typeof createBranchEncodingStore>[0] & { type: "branch" }), sectionStore: SectionStore): EncodingStore {
  if (parent === null) {
    return createRootEncodingStore();
  } else if (parent.type === "root") {
    return createBranchEncodingStore(createRootEncodingStore(), sectionStore);
  } else {
    return createBranchEncodingStore(parent, sectionStore);
  }
}

export function encodingToString(encoding: MusenetEncoding): string {
  return encoding.map(it => it.toString()).join(" ");
}

export function encodingToArray(encoding: string): MusenetEncoding {
  return encoding.split(" ").map(it => parseInt(it));
}