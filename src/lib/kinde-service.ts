import { KindeAccessToken } from "@kinde-oss/kinde-auth-nextjs/types";

async function getTokenFromKinde() {
  const response = await fetch(
    "https://twistymoto.kinde.com/oauth2/token",
    {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        audience: process.env.KINDE_M2M_AUDIENCE!,
        grant_type: "client_credentials",
        client_id: process.env.KINDE_M2M_CLIENT_ID!,
        client_secret: process.env.KINDE_M2M_CLIENT_SECRET!,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  return response.json();
}

export async function deleteKindeUser(accessToken: KindeAccessToken) {
  const token = await getTokenFromKinde();
  await fetch(
    `https://twistymoto.kinde.com/api/v1/users/${accessToken.sub}/sessions`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    },
  );

  await fetch(
    `https://twistymoto.kinde.com/api/v1/user?id=${accessToken.sub}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    },
  );
}
