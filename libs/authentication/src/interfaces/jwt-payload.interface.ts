export interface JwtPayload {
  sub: number; // user id
  name: string;
  email: string;
  roles: number[];
  iat?: number;
  exp?: number;
}
