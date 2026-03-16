import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../http/api-client';
import { Observable } from 'rxjs';

export interface PlatformStats {
  total_users: number;
  active_jobs: number;
  total_value_moved: number;
}

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  readonly #apiClient = inject(ApiClient);

  getStats(): Observable<PlatformStats> {
    return this.#apiClient.get<PlatformStats>('/platform/stats');
  }
}
