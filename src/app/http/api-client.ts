import { HttpClient } from "@angular/common/http"
import { inject, Injectable } from "@angular/core"
import { Observable } from "rxjs"

@Injectable({
    providedIn: 'root'
})
export class ApiClient {

    readonly #BASE_URL = 'https://stingray-app-wxhhn.ondigitalocean.app'
    readonly #httpClient = inject(HttpClient)

    get<T>(path: string): Observable<T>  {
        return this.#httpClient.get<T>(`${this.#BASE_URL}/${path}`)
    }

    post<T>(path: string, body: unknown): Observable<T> {
        return this.#httpClient.post<T>(`${this.#BASE_URL}/${path}`, body)
    }

    patch<T>(path: string, body: unknown): Observable<T> {
        return this.#httpClient.patch<T>(`${this.#BASE_URL}/${path}`, body)
    }

    delete<T>(path: string): Observable<T> {
        return this.#httpClient.delete<T>(`${this.#BASE_URL}/${path}`)
    }


}
