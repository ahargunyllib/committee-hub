import { AppError } from "./errors";

export const notImplemented = (feature: string): never => {
  throw new AppError("NOT_IMPLEMENTED", `${feature} is not implemented yet`);
};
