export interface JwtPayload {
  sub: string;
  role: string;
  sessionId: string;
  typ: 'access';
}

export interface AuthenticatedUser {
  id: string;
  role: string;
  sessionId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  tokenType: 'Bearer';
}

export interface AuthResponse extends AuthTokens {
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    username: string | null;
    email: string | null;
    avatarUrl: string | null;
    role: string;
    preferredCurrency: string;
    timezone: string;
  };
}
