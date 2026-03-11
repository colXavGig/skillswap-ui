import { readonly } from "@angular/forms/signals";
import { UserModel } from "../model/user";


export class AuthStore {

    private readonly USER_KEY = 'skillswap-connected-user'
    private readonly TOKEN_KEY = 'skillswap-token'


    get user(): UserModel|null {
        const data = localStorage.getItem(this.USER_KEY)
        if (!data) {
            return null
        }
        return JSON.parse(data)
    }

    private set user(user: UserModel|null) {
        if (!user) {
            localStorage.removeItem(this.USER_KEY)
            return
        }
        localStorage.setItem(this.USER_KEY, JSON.stringify(user))
    }

    get token(): string|null {
        return localStorage.getItem(this.TOKEN_KEY) || null
    }

    private set token(token: string|null) {
        if (!token) {
            localStorage.removeItem(this.TOKEN_KEY)
            return
        }
        localStorage.setItem(this.TOKEN_KEY, token)
    }

    saveSession(user: UserModel, token: string) {
        this.user = user
        this.token = token
    }

    clearSession() {
        this.user = null
        this.token = null
    }

    isAuthentificated() {
        return this.token !== null && this.user !== null
    }
}
