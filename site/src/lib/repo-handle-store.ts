const DB_NAME = "skill-workbench"
const STORE_NAME = "handles"
const HANDLE_KEY = "selected-repo"

type MinimalRequest<T> = {
  result?: T;
  error?: unknown;
  onsuccess: null | ((event: { target: MinimalRequest<T> }) => void);
  onerror: null | ((event: { target: MinimalRequest<T> }) => void);
}

type MinimalDatabase = {
  objectStoreNames: { contains: (name: string) => boolean };
  createObjectStore: (name: string) => void;
  transaction: (
    storeNames: string[],
    mode: "readonly" | "readwrite",
  ) => {
    objectStore: (name: string) => {
      get: (key: string) => MinimalRequest<unknown>;
      put: (value: unknown, key: string) => MinimalRequest<unknown>;
    };
  };
}

type MinimalIndexedDb = {
  open: (name: string, version: number) => MinimalRequest<MinimalDatabase>;
}

function readRequest<T>(request: MinimalRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = (event) => {
      resolve((event.target.result ?? request.result) as T)
    }
    request.onerror = (event) => {
      reject(event.target.error ?? request.error ?? new Error("IndexedDB request failed."))
    }
  })
}

async function openDatabase(indexedDb: MinimalIndexedDb) {
  const request = indexedDb.open(DB_NAME, 1)

  if ("onupgradeneeded" in request) {
    ;(request as MinimalRequest<MinimalDatabase> & {
      onupgradeneeded: null | ((event: { target: MinimalRequest<MinimalDatabase> }) => void);
    }).onupgradeneeded = (event) => {
      const database = event.target.result
      if (database && !database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME)
      }
    }
  }

  return readRequest(request)
}

function getIndexedDb(indexedDb = globalThis.indexedDB) {
  return indexedDb as MinimalIndexedDb | undefined
}

export async function persistRepoHandle(
  handle: FileSystemDirectoryHandle,
  indexedDb = getIndexedDb(),
) {
  if (!indexedDb) {
    return false
  }

  const database = await openDatabase(indexedDb)
  await readRequest(
    database.transaction([STORE_NAME], "readwrite").objectStore(STORE_NAME).put(handle, HANDLE_KEY),
  )
  return true
}

export async function loadStoredRepoHandle(
  indexedDb = getIndexedDb(),
): Promise<FileSystemDirectoryHandle | null> {
  if (!indexedDb) {
    return null
  }

  const database = await openDatabase(indexedDb)
  const handle = await readRequest(
    database.transaction([STORE_NAME], "readonly").objectStore(STORE_NAME).get(HANDLE_KEY),
  )

  return (handle as FileSystemDirectoryHandle | undefined) ?? null
}
