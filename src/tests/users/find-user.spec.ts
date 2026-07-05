import { SEEDED } from '@data/constants/common.constants';
import { CustomResponseType } from '@data/types/custom-response.type';
import { UserType } from '@data/types/user.type';
import { expect, test } from '@fixtures/fixtures';
import { StringUtils } from '@utils/string.utils';

test.describe('Validations for Get Users by Email', {
    tag: ['@user', '@get', '@find-user']
}, async () => {

    let user: UserType;

    test.beforeEach(async ({ logger, userApi, userSteps }) => {
        user = await userSteps.seed(logger, userApi, false) as UserType;
    });

    test.afterEach(async ({ logger, userApi, userSteps }) => {
        await userSteps.deleteSeeded(logger, userApi, user, SEEDED);
    });

    test('Get user - existing user',
        { tag: ['@LOANPRO-0023', '@existing-user'] },
        async ({
            userApi, logger
        }) => {

            let found: UserType;
            await test.step('Find user in API', async () => {
                logger.info(`Finding user with email '${user.email}' in API.`);
                found = await userApi.find(user.email) as UserType;
                logger.info('Finished finding user in API.');
            });

            await test.step('Validate user details', async () => {
                logger.info(`Validating user: ${StringUtils.prettyJson(found, { newline: true })}`);
                expect.soft(
                    found.name,
                    "User name must be a string"
                ).toEqual(expect.any(String));
                expect.soft(
                    found.email,
                    "User email must be a valid email"
                ).toBeAnEmail(found.email);
                expect.soft(
                    found.age,
                    "User age must be a number"
                ).toEqual(expect.any(Number));
                expect(
                    found.age,
                    "User age must be a number greater than or equal to 1"
                ).toBeGreaterThanOrEqual(1);
                expect(
                    found.age,
                    "User age must be a number lesser than or equal to 150"
                ).toBeLessThanOrEqual(150);
            });

            await test.step('Validate user details match', async () => {
                logger.info('Validating that created user details match the seeded user.');
                logger.info(`Found user: ${StringUtils.prettyJson(found, { newline: true })}`);
                logger.info(`Seeded user: ${StringUtils.prettyJson(user, { newline: true })}`);
                expect.soft(
                    user.name,
                    "Found user name must match the seeded user"
                ).toStrictEqual(found.name);
                expect.soft(
                    user.email,
                    "Found user email must match the seeded user"
                ).toStrictEqual(found.email);
                expect.soft(
                    user.age,
                    "Found user age must match the seeded user"
                ).toStrictEqual(found.age);

            });
        });

    test('Get user - non-existing user',
        { tag: ['@LOANPRO-0024', '@non-existing-user'] },
        async ({
            userApi, logger
        }) => {

            const userToFind: UserType = { ...user };
            userToFind.email = `invalid_${user.email}`;
            let response: CustomResponseType;
            await test.step('Find user in API', async () => {
                logger.info(`Finding user with email '${userToFind.email}' in API.`);
                response = await userApi.find(userToFind.email) as CustomResponseType;
                logger.info(`Response from API: ${StringUtils.prettyJson(response, { newline: true })}`);
            });

            await test.step('Validate error response', async () => {
                logger.info(`Validating error response: ${StringUtils.prettyJson(response, { newline: true })}`);
                expect.soft(
                    response.code,
                    'Finding a non-existing user should return a 404 status code'
                ).toStrictEqual(404);
                const errorMessage = 'User not found';
                expect.soft(
                    response.message,
                    `Finding a non-existing user should return an error with the message '${errorMessage}' in the body`
                ).toStrictEqual(errorMessage);

            });
        });

});
