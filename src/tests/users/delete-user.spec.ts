import { SEEDED } from '@data/constants/common.constants';
import { CustomResponseType } from '@data/types/custom-response.type';
import { UserType } from '@data/types/user.type';
import { expect, test } from '@fixtures/fixtures';
import { StringUtils } from '@utils/string.utils';

test.describe('Validations for Delete User', {
    tag: ['@users', '@delete', '@delete-user'],
}, async () => {

    let user: UserType;

    test.beforeEach(async ({ logger, userApi, userSteps }, testInfo) => {
        if (testInfo.tags.includes('@existing-user')) {
            user = await userSteps.seed(logger, userApi, false) as UserType;
        }
    });

    test.afterEach(async ({ logger, userApi, userSteps }, testInfo) => {
        if (testInfo.tags.includes('@existing-user')) {
            await userSteps.deleteSeeded(logger, userApi, user, SEEDED);
        }
    });


    test('Delete user - existing user',
        { tag: ['@LOANPRO-0048', '@existing-user'] },
        async ({
            userApi, logger
        }) => {

            let response: number;

            await test.step('Delete user in API', async () => {
                logger.info(`Deleting user with email'${user.email}' in API:`);
                response = await userApi.delete(user.email, { validate: true }) as number;
                logger.info(`Response from API: ${StringUtils.prettyJson(response)}`);
            });

            await test.step('Validate response', async () => {
                logger.info(`Validating response: ${StringUtils.prettyJson(response)}`);
                expect.soft(
                    response,
                    'Deleting existing user should return 204 status code'
                ).toStrictEqual(204);
            });

        });

    test('Delete user - non-existing user',
        { tag: ['@LOANPRO-0049', '@non-existing-user'] },
        async ({
            userApi, logger
        }) => {

            let response: CustomResponseType;

            const email = `non.existing.email${StringUtils.generateRandomEmail()}`;

            await test.step('Delete user in API', async () => {
                logger.info(`Deleting user with email'${email}' in API:`);
                response = await userApi.delete(email) as CustomResponseType;
                logger.info(`Response from API: ${StringUtils.prettyJson(response, { newline: true })}`);
            });

            await test.step('Validate error response', async () => {
                logger.info(`Validating response: ${StringUtils.prettyJson(response, { newline: true })}`);
                expect.soft(
                    response.code,
                    'Deleting non-existing user should return a 404 status code'
                ).toStrictEqual(404);
                expect.soft(
                    response.message,
                    'Deleting a non-existing user should return an error with the message "User not found"'
                ).toBe('User not found');
            });

        });

    test('Delete user - existing user and missing Authorization',
        { tag: ['@LOANPRO-0050', '@existing-user', '@missing-authorization'] },
        async ({
            userApi, logger
        }) => {

            let response: CustomResponseType;

            await test.step('Delete user in API', async () => {
                logger.info(`Deleting user with email'${user.email}' in API:`);
                response = await userApi.delete(user.email, { headers: {} }) as CustomResponseType;
                logger.info(`Response from API: ${StringUtils.prettyJson(response)}`);
            });

            await test.step('Validate response', async () => {
                logger.info(`Validating response: ${StringUtils.prettyJson(response)}`);
                expect.soft(
                    response.code,
                    'Deleting existing user without providing Authorization should return 401 status code'
                ).toStrictEqual(401);
                expect.soft(
                    response.message,
                    'Deleting existing user without providing Authorization should return an error with the message "Authentication required"'
                ).toStrictEqual('Authentication required');

            });

        });

    test('Delete user - existing user and incorrect Authorization',
        { tag: ['@LOANPRO-0051', '@existing-user', '@incorrect-authorization'] },
        async ({
            userApi, logger
        }) => {

            let response: CustomResponseType;

            await test.step('Delete user in API', async () => {
                logger.info(`Deleting user with email'${user.email}' in API:`);
                response = await userApi.delete(user.email, { headers: { 'Authorization': 'Bearer: invalid token!' } }) as CustomResponseType;
                logger.info(`Response from API: ${StringUtils.prettyJson(response)}`);
            });

            await test.step('Validate response', async () => {
                logger.info(`Validating response: ${StringUtils.prettyJson(response)}`);
                expect.soft(
                    response.code,
                    'Deleting existing user with invalid Authorization should return 401 status code'
                ).toStrictEqual(401);
                expect.soft(
                    response.message,
                    'Deleting existing user without providing Authorization should return an error with the message "Authentication required"'
                ).toStrictEqual('Authentication required');
            });
        });

    test('Delete user - non-existing user and incorrect Authorization',
        { tag: ['@LOANPRO-0052', '@non-existing-user', '@incorrect-authorization'] },
        async ({
            userApi, logger
        }) => {

            let response: CustomResponseType;
            const email = `non.existing.email${StringUtils.generateRandomEmail()}`;

            await test.step('Delete user in API', async () => {
                logger.info(`Deleting user with email'${email}' in API:`);
                response = await userApi.delete(email, { headers: { 'Authorization': 'Bearer: invalid token!' } }) as CustomResponseType;
                logger.info(`Response from API: ${StringUtils.prettyJson(response, { newline: true })}`);
            });

            await test.step('Validate error response', async () => {
                logger.info(`Validating response: ${StringUtils.prettyJson(response, { newline: true })}`);
                expect.soft(
                    response.code,
                    'Deleting non-existing user with invalid Authorization should return 401 status code'
                ).toStrictEqual(401);
                expect.soft(
                    response.message,
                    'Deleting non-existing user with invalid Authorization should return an error with the message "Authentication required"'
                ).toStrictEqual('Authentication required');
            });
        });

    test('Delete user - non-existing user and blank Authorization',
        { tag: ['@LOANPRO-0053', '@non-existing-user', '@blank-authorization'] },
        async ({
            userApi, logger
        }) => {

            let response: CustomResponseType;
            const email = `non.existing.email${StringUtils.generateRandomEmail()}`;

            await test.step('Delete user in API', async () => {
                logger.info(`Deleting user with email'${email}' in API:`);
                response = await userApi.delete(email, { headers: {} }) as CustomResponseType;
                logger.info(`Response from API: ${StringUtils.prettyJson(response, { newline: true })}`);
            });

            await test.step('Validate error response', async () => {
                logger.info(`Validating response: ${StringUtils.prettyJson(response, { newline: true })}`);
                expect.soft(
                    response.code,
                    'Deleting non-existing user without Authorization should return 401 status code'
                ).toStrictEqual(401);
                expect.soft(
                    response.message,
                    'Deleting non-existing user without Authorization should return an error with the message "Authentication required"'
                ).toStrictEqual('Authentication required');
            });

        });

    test('Delete user - deleted user not in Get All Users',
        { tag: ['@LOANPRO-0054', '@existing-user', '@get'] },
        async ({
            userApi, logger
        }) => {

            await test.step('Delete user in API', async () => {
                logger.info(`Deleting user with email'${user.email}' in API:`);
                const response = await userApi.delete(user.email, { validate: true }) as number;
                logger.info(`Response from API: ${StringUtils.prettyJson(response, { newline: true })}`);
            });

            await test.step('Validate user can is not available in Get All Users', async () => {
                logger.info('Validating user can is not available in Get All Users');
                const users: UserType[] = await userApi.all();
                const found: UserType | undefined = users.find(u => u.email === user.email);
                expect.soft(
                    found,
                    'User should not be available in Get All Users after being deleted.'
                ).toBeUndefined();
            });
        });


    test('Delete user - deleted user not in Get User by Email',
        { tag: ['@LOANPRO-0055', '@existing-user', '@get'] },
        async ({
            userApi, logger
        }) => {
            await test.step('Delete user in API', async () => {
                logger.info(`Deleting user with email'${user.email}' in API:`);
                const response = await userApi.delete(user.email, { validate: true }) as number;
                logger.info(`Response from API: ${StringUtils.prettyJson(response), { newline: true }}`);
            });

            await test.step('Validate user can is not available in Get Users by Email', async () => {
                logger.info('Validating user can is not available in Get Users by Email');
                const response = await userApi.find(user.email) as CustomResponseType;
                expect.soft(
                    response.code,
                    'User should not be available in Get Users by Email after being deleted - response code 404.'
                ).toBe(404);
                const errorMessage = 'User not found';
                expect.soft(
                    response.message,
                    `User should not be available in Get Users by Email after being deleted - response message '${errorMessage}'.`
                ).toStrictEqual(errorMessage);
            });
        });

});
