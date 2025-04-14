import { NextResponse } from "next/server";
import jwksClient from "jwks-rsa";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { db } from "@/db";
import { users } from "@/db/schema";

const client = jwksClient({
  jwksUri: `${process.env.KINDE_ISSUER_URL}/.well-known/jwks.json`,
});

export async function POST(req: Request) {
  try {
    const token = await req.text();
    const jwtDecoded = jwt.decode(token, { complete: true });

    if (!jwtDecoded) {
      return NextResponse.json({
        status: 500,
        statusText: "error decoding jwt",
      });
    }

    const header = jwtDecoded.header;
    const kid = header.kid;

    const key = await client.getSigningKey(kid);
    const signingKey = key.getPublicKey();
    const event = jwt.verify(token, signingKey) as JwtPayload;

    switch (event?.type) {
      case "user.created":
        console.log("[user.created]");
        const user = event.data.user;
        const email = user.email;
        console.log("[user]", user);

        await db
          .insert(users)
          .values({
            kindeId: user.id,
            email: email,
          })
          .returning({ userId: users.userId });

        break;
      case "user.updated":
        console.log("[user.updated]", event.type);
        break;
      default:
        console.log("event not handled", event.type);
        break;
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error(err);
      return NextResponse.json({ message: err.message }, { status: 500 });
    }
  }

  return NextResponse.json({ status: 200, statusText: "success" });
}
