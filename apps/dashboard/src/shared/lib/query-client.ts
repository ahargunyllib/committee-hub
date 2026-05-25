import { QueryClient } from "@tanstack/react-query";

const FIVE_MINUTES = 5 * 60 * 1000;
const THIRTY_MINUTES = 30 * 60 * 1000;

export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: THIRTY_MINUTES,
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: FIVE_MINUTES,
      },
    },
  });
