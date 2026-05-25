import type { Path } from "better-auth/plugins";
import type { Auth } from "./auth";

type AuthOpenAPISchema = Awaited<
  ReturnType<Auth["api"]["generateOpenAPISchema"]>
>;
export type AuthOpenAPIDocumentation = Pick<
  AuthOpenAPISchema,
  "components" | "paths"
>;

let authOpenAPISchema: AuthOpenAPISchema | undefined;

const getAuthOpenAPISchema = async (auth: Auth): Promise<AuthOpenAPISchema> => {
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
  auth: Auth,
  prefix = "/auth"
): Promise<AuthOpenAPIDocumentation> => {
  const { components, paths } = await getAuthOpenAPISchema(auth);
  const authPaths = paths as Record<string, Path>;
  const prefixedPaths: Record<string, Path> = {};

  for (const [path, pathItem] of Object.entries(authPaths)) {
    if (!shouldDocumentAuthPath(path)) {
      continue;
    }

    prefixedPaths[`${prefix}${path}`] = withBetterAuthTag(pathItem);
  }

  return {
    components,
    paths: prefixedPaths as AuthOpenAPISchema["paths"],
  };
};
