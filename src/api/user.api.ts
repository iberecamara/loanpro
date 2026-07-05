import { Environment } from '@configs/environment.config';
import { CustomResponseType } from '@data/types/custom-response.type';
import { UserType, UserTypeVariations } from '@data/types/user.type';
import { APIRequestContext, expect } from '@playwright/test';

export class UserApi {

    readonly request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    async all(options?: { url?: string }): Promise<UserType[]> {
        const response = await this.request.get(options?.url ?? Environment.USERS_API_URL);
        expect(response.ok(), "Get users response must OK").toBeTruthy();
        expect(response.status(), "Get users response code must be 200").toBe(200);
        expect(response.headers()['content-type'], "Get users response accept must be application/json").toStrictEqual('application/json');
        const body = await response.json();

        const users: UserType[] = [];
        for (const user of body) {
            users.push({
                name: user.name,
                email: user.email,
                age: user.age
            });
        }
        return users;
    }

    async create(
        user: UserTypeVariations | {} | string,
        options?: {
            headers?: {
                [key: string]: string;
            };
        }
    ): Promise<UserTypeVariations | CustomResponseType> {
        const response = await this.request.post(Environment.USERS_API_URL, { data: user, headers: options?.headers });
        expect(response.headers()['content-type'], "Create user response accept must be application/json").toStrictEqual('application/json');
        const body = await response.json();
        if (response.status() === 201) {
            if (body.extra) {
                return {
                    name: body.name,
                    email: body.email,
                    age: body.age,
                    extra: body.extra
                };
            } else {
                return {
                    name: body.name,
                    email: body.email,
                    age: body.age
                };
            }
        }
        return {
            message: body.error,
            code: response.status()
        };


    }

    async find(email: string): Promise<UserType | CustomResponseType> {
        const response = await this.request.get(`${Environment.USERS_API_URL}/${email}`);
        expect(response.headers()['content-type'], "Get user response accept must be application/json").toStrictEqual('application/json');
        const body = await response.json();
        if (response.status() === 200) {
            return {
                name: body.name,
                email: body.email,
                age: body.age
            }
        }
        return {
            message: body.error,
            code: response.status()
        }

    }

    async update(email: string, user: UserTypeVariations | string | {}): Promise<UserType | CustomResponseType> {
        this.request
        const response = await this.request.put(
            `${Environment.USERS_API_URL}/${email}`,
            { data: user }
        );
        expect(response.headers()['content-type'], "Update user response accept must be application/json").toStrictEqual('application/json');
        const body = await response.json();
        if (response.status() === 200) {
            return {
                name: body.name,
                email: body.email,
                age: body.age
            }
        }
        return {
            message: body.error,
            code: response.status()
        }
    }

    async patch(email: string, user: UserTypeVariations | string | {}): Promise<UserType | CustomResponseType> {
        this.request
        const response = await this.request.patch(
            `${Environment.USERS_API_URL}/${email}`,
            { data: user }
        );
        const body = await response.json();
        if (response.status() === 200) {
            return {
                name: body.name,
                email: body.email,
                age: body.age
            }
        }
        return {
            message: body.error,
            code: response.status()
        }
    }

    async delete(email: string, options?: { url?: string, headers?: {}, validate?: boolean }): Promise<number | CustomResponseType> {
        const url = options?.url ? options.url : `${Environment.USERS_API_URL}/${email}`;
        const headerData = options?.headers ? { headers: options.headers } : { headers: { 'Authorization': `Bearer: ${Environment.AUTH_TOKEN}` } };
        const response = await this.request.delete(
            url,
            headerData
        );
        expect(
            response.headers()['content-type'],
            "Delete user response accept must be application/json"
        ).toStrictEqual('application/json');
        expect(
            response.headers()['Authorization'],
            "Delete user response should not expose Authorization headers"
        ).toBeFalsy();
        if (options?.validate) {
            expect(
                response.status(),
                "Delete user response status code should be 204"
            ).toBe(204);
            expect(
                await response.text(),
                "Delete user response status body should be empty"
            ).toBeFalsy();
        }
        if (response.status() === 204) {
            return response.status();
        }
        const body = await response.json();
        return {
            message: body.error,
            code: response.status()
        }
    }
}