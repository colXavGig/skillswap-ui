import { Component, computed, inject, signal } from '@angular/core';
import { Proposal, ProposalService } from '../../../service/proposal-service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OnlyPendingCanBeDeletedError, ProposalForbiddenError } from '../../../service/proposal-errors';

@Component({
  selector: 'app-my-bids',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-bids.html',
  styleUrl: './my-bids.scss',
})
export class MyBidsComponent {
  readonly #proposalService = inject(ProposalService);

  proposals = signal<Proposal[]>([]);
  error = signal<string | null>(null);
  loaded = signal(false);
  isLoading = computed(() => !this.loaded() && this.error() === null);

  deleteErrors = signal<Record<string, string>>({});

  constructor() {
    this.#proposalService.getMyBids().subscribe({
      next: (proposals) => {
        this.proposals.set(proposals);
        this.loaded.set(true);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load your proposals.');
      },
    });
  }

  deleteProposal(proposal: Proposal) {
    this.deleteErrors.update((prev) => ({ ...prev, [proposal.id]: '' }));

    this.#proposalService.deleteProposal(proposal.id).subscribe({
      next: () => {
        this.proposals.update((prev) => prev.filter((p) => p.id !== proposal.id));
      },
      error: (err) => {
        let msg: string;
        if (err instanceof OnlyPendingCanBeDeletedError) {
          msg = 'Only pending proposals can be deleted.';
        } else if (err instanceof ProposalForbiddenError) {
          msg = 'You are not authorized to delete this proposal.';
        } else {
          msg = err.message || 'Failed to delete proposal.';
        }
        this.deleteErrors.update((prev) => ({ ...prev, [proposal.id]: msg }));
      },
    });
  }
}
