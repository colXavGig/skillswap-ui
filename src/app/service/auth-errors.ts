import { ApiErrorResponse } from "../http/api-client";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class LoginError extends AuthError {}
export class InvalidCredentialsError extends LoginError {}
export class LoginMissingFieldsError extends LoginError {}

export class RegisterError extends AuthError {}
export class MissingRequiredFieldsError extends RegisterError {}
export class InvalidUsernameError extends RegisterError {}
export class EmailAlreadyInUseError extends RegisterError {}

export interface UsernameAlreadyInUseResponse extends ApiErrorResponse {
  suggested_username?: string;
}

export class UsernameAlreadyInUseError extends RegisterError implements UsernameAlreadyInUseResponse {
  suggested_username?: string | undefined;
  error: string;

  constructor(resp: UsernameAlreadyInUseResponse) {
    super(resp.error);
    this.error = resp.error;

    if (resp.suggested_username) {
      this.suggested_username = resp.suggested_username;
    }
  }
}
