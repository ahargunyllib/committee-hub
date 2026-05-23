type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

export type Result<T, E = unknown> = Success<T> | Failure<E>;

export const tryCatch = async <T, E = unknown>(
  promise: Promise<T>
): Promise<Result<T, E>> => {
  try {
    const data = await promise;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
};
