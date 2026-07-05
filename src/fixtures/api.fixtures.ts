
import { UserApi } from "@api/user.api";
import { APIRequestContext, test as base } from "@playwright/test";

type ApiConstructor<T> = new (request: APIRequestContext) => T;

function createApiFixture<T>(apiConstructor: ApiConstructor<T>) {
    return async ({ request }: { request: APIRequestContext }, use: (value: T) => Promise<void>) => {
        const apiInstance = new apiConstructor(request);
        await use(apiInstance);
    };
}

type ApiFixtures = {
    userApi: UserApi,
};

export const test = base.extend<ApiFixtures>({
    userApi: createApiFixture(UserApi),
});