import { describe, expect, it } from "vitest";
import {
  loadStoredRepoHandle,
  persistRepoHandle,
} from "../../site/src/lib/repo-handle-store.js";

type Request<T> = {
  result?: T;
  error?: Error;
  onsuccess: null | ((event: { target: Request<T> }) => void);
  onerror: null | ((event: { target: Request<T> }) => void);
  onupgradeneeded?: null | ((event: { target: Request<T> }) => void);
};

function createRequest<T>() {
  return {
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
  } as Request<T>;
}

function createFakeIndexedDb() {
  const stores = new Map<string, Map<string, unknown>>();

  return {
    open() {
      const request = createRequest<{
        objectStoreNames: { contains: (name: string) => boolean };
        createObjectStore: (name: string) => void;
        transaction: (
          names: [string, ...string[]],
          mode: "readonly" | "readwrite",
        ) => {
          objectStore: (name: string) => {
            put: (value: unknown, key: string) => Request<unknown>;
            get: (key: string) => Request<unknown>;
          };
        };
      }>();

      queueMicrotask(() => {
        request.result = {
          objectStoreNames: {
            contains: (name: string) => stores.has(name),
          },
          createObjectStore: (name: string) => {
            if (!stores.has(name)) {
              stores.set(name, new Map());
            }
          },
          transaction: ([storeName]: [string, ...string[]]) => ({
            objectStore: () => ({
              put: (value: unknown, key: string) => {
                const putRequest = createRequest<unknown>();
                queueMicrotask(() => {
                  stores.get(storeName)?.set(key, value);
                  putRequest.result = value;
                  putRequest.onsuccess?.({ target: putRequest });
                });
                return putRequest;
              },
              get: (key: string) => {
                const getRequest = createRequest<unknown>();
                queueMicrotask(() => {
                  getRequest.result = stores.get(storeName)?.get(key);
                  getRequest.onsuccess?.({ target: getRequest });
                });
                return getRequest;
              },
            }),
          }),
        };

        request.onupgradeneeded?.({ target: request });
        request.onsuccess?.({ target: request });
      });

      return request;
    },
  };
}

describe("repo handle storage", () => {
  it("persists and restores the selected repository handle", async () => {
    const indexedDb = createFakeIndexedDb();
    const handle = { name: "skills" } as FileSystemDirectoryHandle;

    await persistRepoHandle(handle, indexedDb as never);
    await expect(loadStoredRepoHandle(indexedDb as never)).resolves.toBe(handle);
  });
});
