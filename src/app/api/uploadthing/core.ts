// DOCS: https://docs.uploadthing.com/getting-started/appdir
import { getUserId } from "@/db/auth/session";
import { updateAvatarUrl } from "@/db/avatars/avatar.service";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";

export const utapi = new UTApi({});

const f = createUploadthing();

const { isAuthenticated } = getKindeServerSession();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const userUuid = await getUserId();
      const isAuth = await isAuthenticated();

      if (!isAuth) {
        throw new UploadThingError("Unauthorized");
      }

      if (!userUuid) {
        throw new UploadThingError("Could not find uuid");
      }

      return { userUuid: userUuid };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      const response = await updateAvatarUrl(
        metadata.userUuid,
        file.ufsUrl,
        file.key,
      );

      if (response.fileKey) {
        await utapi.deleteFiles(
          response.fileKey,
        );
      }

      return {
        response: {
          title: response.title,
          description: response.description,
          variant: response.variant,
        },
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
