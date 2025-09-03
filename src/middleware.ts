/* eslint-disable @typescript-eslint/no-explicit-any */
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth(
  // async function middleware(req: any) {
  // },
  {
    isReturnToCurrentPage: true,
    publicPaths: ["/", "/featured", "/community-routes"],
    isAuthorized: ({ token }: { token: any }) => {
      if (token?.sub) {
        return true;
      }
    },
  },
);

export const config = {
  matcher: [
    "/((?!_next|api|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
