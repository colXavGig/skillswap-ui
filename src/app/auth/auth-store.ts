import { Injectable } from "@angular/core";
import { User } from "../service/user-service";


@Injectable({
    providedIn: 'root'
})
export class AuthStore {

    readonly #USER_KEY = 'skillswap-connected-user'
    readonly #TOKEN_KEY = 'skillswap-token'


    get user(): User|null {
        const data = localStorage.getItem(this.#USER_KEY)
        if (!data) {
            return null
        }
        return JSON.parse(data)
    }

    set #user(user: User|null) {
        if (!user) {
            localStorage.removeItem(this.#USER_KEY)
            return
        }
        localStorage.setItem(this.#USER_KEY, JSON.stringify(user))
    }

    get token(): string|null {
        return localStorage.getItem(this.#TOKEN_KEY) || null
    }

    set #token(token: string|null) {
        if (!token) {
            localStorage.removeItem(this.#TOKEN_KEY)
            return
        }
        localStorage.setItem(this.#TOKEN_KEY, token)
    }

    saveSession(user: User, token: string) {
        this.#user = user
        this.#token = token
    }

    clearSession() {
        this.#user = null
        this.#token = null
    }

    isAuthentificated() {
        return this.token !== null && this.user !== null
    }
}
