export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly errors?: ValidationErrorDetail[];

  constructor(message: string, status: number, errors?: ValidationErrorDetail[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export default ApiError;
