export type AuthOption = {
  /**
   * Just skip authentication altogether for this request
   */
  skipAuth?: boolean;

  /**
   * Still try to authenticate the request, but don't block the request if
   * authentication fails
   */
  blockIfUnauthenticated?: boolean;
};
