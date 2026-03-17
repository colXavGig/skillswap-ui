export class ReviewError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ReviewJobNotFoundError extends ReviewError {}
export class ReviewNotAllowedJobNotCompletedError extends ReviewError {}
export class ReviewForbiddenError extends ReviewError {}
export class ReviewMissingFieldsError extends ReviewError {}
export class CannotReviewYourselfError extends ReviewError {}
export class InvalidReviewTargetError extends ReviewError {}
export class InvalidRatingError extends ReviewError {}
export class AlreadyReviewedError extends ReviewError {}
export class ReviewTargetNotFoundError extends ReviewError {}
export class InvalidUserIdError extends ReviewError {}
