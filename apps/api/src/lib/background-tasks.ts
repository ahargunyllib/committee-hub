import { AsyncLocalStorage } from "node:async_hooks";

type BackgroundTaskRunner = (promise: Promise<unknown>) => void;

const backgroundTaskStorage = new AsyncLocalStorage<BackgroundTaskRunner>();

export const runWithBackgroundTaskRunner = <T>(
  runner: BackgroundTaskRunner,
  callback: () => T
): T => backgroundTaskStorage.run(runner, callback);

export const runAuthBackgroundTask = (promise: Promise<unknown>): void => {
  const runner = backgroundTaskStorage.getStore();

  if (runner) {
    runner(promise);
    return;
  }

  promise.catch(() => undefined);
};
