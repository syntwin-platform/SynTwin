export type ApiValidationErrors = Record<string, string[]>;

export interface ApiErrorResponse {
  message?: string;
  errors?: ApiValidationErrors;
}

export class ApiRequestError extends Error {
  readonly status: number;
  readonly errors?: ApiValidationErrors;

  constructor(
    status: number,
    message: string,
    errors?: ApiValidationErrors
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.errors = errors;
  }
}