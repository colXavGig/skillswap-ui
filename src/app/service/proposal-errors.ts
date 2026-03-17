export class ProposalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ProposalNotFoundError extends ProposalError {}
export class ProposalForbiddenError extends ProposalError {}
export class JobNotFoundError extends ProposalError {}
export class CannotSubmitToOwnJobError extends ProposalError {}
export class JobNotOpenForProposalError extends ProposalError {}
export class AlreadyHasPendingProposalError extends ProposalError {}
export class MissingProposalFieldsError extends ProposalError {}
export class CannotAcceptOwnProposalError extends ProposalError {}
export class JobNoLongerOpenError extends ProposalError {}
export class OnlyPendingCanBeDeletedError extends ProposalError {}
