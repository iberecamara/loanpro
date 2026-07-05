
import { test as base } from "@playwright/test";
import { UserSteps } from "@steps/user.steps";

type StepsConstructor<T> = new () => T;

function createStepFixture<T>(stepConstructor: StepsConstructor<T>) {
    return async ({ }, use: (value: T) => Promise<void>) => {
        const stepInstance = new stepConstructor();
        await use(stepInstance);
    };
}

type StepsFixtures = {
    userSteps: UserSteps,
};

export const test = base.extend<StepsFixtures>({
    userSteps: createStepFixture(UserSteps),
});