import type { Path } from "better-auth/plugins";
import { auth } from "./auth";

type AuthOpenAPISchema = Awaited<
  ReturnType<typeof auth.api.generateOpenAPISchema>
>;

let authOpenAPISchema: AuthOpenAPISchema | undefined;

const getAuthOpenAPISchema = async (): Promise<AuthOpenAPISchema> => {
  authOpenAPISchema ??= await auth.api.generateOpenAPISchema();
  return authOpenAPISchema;
};

const hiddenAuthPathSegments = [
  "email",
  "password",
  "reset-password",
  "verify-password",
] as const;

const shouldDocumentAuthPath = (path: string): boolean =>
  !hiddenAuthPathSegments.some((segment) => path.includes(segment));

const withBetterAuthTag = (path: Path): Path => ({
  get: path.get
    ? {
        ...path.get,
        tags: ["Better Auth"],
      }
    : undefined,
  post: path.post
    ? {
        ...path.post,
        tags: ["Better Auth"],
      }
    : undefined,
});

export const getAuthOpenAPIDocumentation = async (
  prefix = "/auth"
): Promise<Pick<AuthOpenAPISchema, "components" | "paths">> => {
  const { components, paths } = await getAuthOpenAPISchema();
  const prefixedPaths: AuthOpenAPISchema["paths"] = {};

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!shouldDocumentAuthPath(path)) {
      continue;
    }

    prefixedPaths[`${prefix}${path}`] = withBetterAuthTag(pathItem);
  }

  return {
    components,
    paths: prefixedPaths,
  };
};
