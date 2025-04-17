// export interface Users {
//   userId: string;
//   createdAt: unknown;
//   kindeId: string;
//   email: string;
//   username: string | null;
//   firstName: string | null;
//   lastName: string | null;
// }

export interface User {
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}
