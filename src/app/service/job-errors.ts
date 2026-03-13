export class JobError extends Error {

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class MinBudgetError extends JobError {}
export class MissingRequiredFieldsError extends JobError {}
export class JobNotFoundError extends JobError {}
export class NotOwnerOfJobError extends JobError {}
export class InvalidStatusError extends JobError {}
export class NoValidFieldsToUpdateError extends JobError {}
export class JobAccessForbiddenError extends JobError {}
export class MustBeInProgressError extends JobError {}