import { Environment } from '@configs/environment.config';
import { SEEDED } from '@data/constants/common.constants';
import { EMPTY } from '@data/constants/string.constants';
import { CustomResponseType } from '@data/types/custom-response.type';
import { UserType } from '@data/types/user.type';
import { expect, test } from '@fixtures/fixtures';
import { StringUtils } from '@utils/string.utils';

test.describe('Validations for Get All Users', {
    tag: ['@users', '@get', '@all-users']
}, async () => {

    const seeded: UserType[] = [];

    test.beforeEach(async ({ logger, userApi, userSteps }) => {
        if (test.info().tags.includes('@existing-users')) {
            seeded.concat(await userSteps.seed(logger, userApi, true) as UserType[]);
        }
    });

    test.afterEach(async ({ logger, userApi, userSteps }) => {
        if (test.info().tags.includes('@existing-users')) {
            await userSteps.deleteSeeded(logger, userApi, seeded, SEEDED);
        }
    });

    [
        {
            'validation': 'empty user list',
            'tags': ['@LOANPRO-0001', '@empty-users']
        },
        {
            'validation': 'existing user list',
            'tags': ['@LOANPRO-0002', '@existing-users']
        },
    ].forEach(({ validation, tags }) => {
        test(`Get all users - ${validation}`,
            { tag: tags },
            async ({
                userApi, logger
            }) => {

                let users: UserType[];
                await test.step('Retrieve all users from API', async () => {
                    logger.info('Retrieving all users from API.');
                    users = await userApi.all();
                    logger.info('Retrieved all users from API.');
                    logger.info(`Users retrieved: ${users.length}`);
                });

                await test.step('Validate users is an array', async () => {
                    logger.info('Validating that retrieved users object from API is an array.');
                    expect.soft(
                        Array.isArray(users),
                        "Get all users response must be an array"
                    ).toBeTruthy();

                });

                if (validation === 'existing user list') { // List may not be empty but we only validate the contents for the scenario where we expect users in list
                    await test.step('Validate users details', async () => {
                        if (users.length > 0) {
                            logger.info('Validating retrieved users details.');
                        } else {
                            logger.info('No user found to validate the details.');
                        }
                        for (const [index, user] of users.entries()) {
                            logger.info(`Validating user at index #${index}: ${StringUtils.prettyJson(user, { newline: true, truncateField: 50 })}`);
                            expect.soft(
                                user.name,
                                "User name must be a string"
                            ).toEqual(expect.any(String));
                            expect.soft(
                                user.email,
                                "User email must be a valid email"
                            ).toBeAnEmail(user.email);
                            expect.soft(
                                user.age,
                                "User age must be a number"
                            ).toEqual(expect.any(Number));
                            expect(
                                user.age,
                                "User age must be a number greater than or equal to 1"
                            ).toBeGreaterThanOrEqual(1);
                            expect(
                                user.age,
                                "User age must be a number lesser than or equal to 150"
                            ).toBeLessThanOrEqual(150);
                        }
                    });
                }

            });
    });

    test('Get all users - trailing slash',
        { tag: ['@LOANPRO-0003'] },
        async ({
            userApi, logger
        }) => {

            let users: UserType[];
            await test.step('Retrieve all users from API', async () => {
                logger.info('Retrieving all users from API.');
                users = await userApi.all({ url: `${Environment.USERS_API_URL}/` });
                logger.info('Retrieved all users from API.');
                logger.info(`Users retrieved: ${users.length}`);
            });

            await test.step('Validate users is an array', async () => {
                logger.info('Validating that retrieved users object from API is an array.');
                expect.soft(
                    Array.isArray(users),
                    "Get all users response must be an array"
                ).toBeTruthy();

            });

        });

    test('Get all users - Method Not Allowed error',
        { tag: ['@LOANPRO-0004', '@delete', '@method-not-allowed'].filter(t => t !== '@get') },
        async ({
            userApi, logger
        }) => {

            let response: CustomResponseType;
            await test.step('Send DELETE to /users API', async () => {
                logger.info('Send DELETE to /users API');
                response = await userApi.delete(EMPTY, { url: Environment.USERS_API_URL }) as CustomResponseType;
                logger.info(`Response from API: ${StringUtils.prettyJson(response, { newline: true })}`);
            });

            await test.step('Validate error response', async () => {
                logger.info(`Validating error response: ${StringUtils.prettyJson(response, { newline: true })}`);
                expect.soft(
                    response.code,
                    'Sending a DELETE to /users should return a 405 status code'
                ).toStrictEqual(405);
                const errorMessage = 'Method Not Allowed';
                expect.soft(
                    response.message,
                    `Sending a DELETE to /users should return an error with the message '${errorMessage}' in the body`
                ).toStrictEqual(errorMessage);
            });

        });

});
