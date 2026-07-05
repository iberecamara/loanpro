import { CREATED } from '@data/constants/common.constants';
import { EMPTY } from '@data/constants/string.constants';
import { CustomResponseType } from '@data/types/custom-response.type';
import { CreateRandomUser, UserType, UserTypeWithExtraField } from '@data/types/user.type';
import { expect, test } from '@fixtures/fixtures';
import { StringUtils } from '@utils/string.utils';

test.describe('Validations for Create User', {
    tag: ['@users', '@create'],
}, async () => {

    const createdUsers: UserType[] = [];

    test.afterEach(async ({ logger, userApi, userSteps }) => {
        await userSteps.deleteSeeded(logger, userApi, createdUsers, CREATED);
    });

    [
        {
            'validation': 'valid user',
            'tags': ['@LOANPRO-0005', '@valid-user'],
            'user': CreateRandomUser() as UserType
        },
        {
            'validation': 'valid user with emoji in name',
            'tags': ['@LOANPRO-0006', '@emoji-name'],
            'user': CreateRandomUser({ name: `${StringUtils.generateRandomName()} ${StringUtils.generateRandomEmoji()}` }) as UserType
        },
    ].forEach(({ validation, tags, user }) => {
        test(`Create user - ${validation}`,
            { tag: ['@valid-user'].concat(tags) },
            async ({
                userApi, logger
            }) => {

                let created: UserType;

                await test.step('Create user in API', async () => {
                    logger.info(`Creating user in API: ${StringUtils.prettyJson(user, { newline: true })}.`);
                    created = await userApi.create(user) as UserType;
                    createdUsers.push(created);
                    logger.info(`Created user in API: ${StringUtils.prettyJson(created, { newline: true })}.`);
                });

                await test.step('Validate user details', async () => {
                    logger.info('Validating created users details.');
                    logger.info(`Validating user: ${StringUtils.prettyJson(created, { newline: true })}`);
                    expect.soft(
                        created.name,
                        "User name must be a string"
                    ).toEqual(expect.any(String));
                    expect.soft(
                        created.email,
                        "User email must be a valid email"
                    ).toBeAnEmail(created.email);
                    expect.soft(
                        created.age,
                        "User age must be a number"
                    ).toEqual(expect.any(Number));
                    expect(
                        created.age,
                        "User age must be a number greater than or equal to 1"
                    ).toBeGreaterThanOrEqual(1);
                    expect(
                        created.age,
                        "User age must be a number lesser than or equal to 150"
                    ).toBeLessThanOrEqual(150);
                });

                await test.step('Validate user details match', async () => {
                    logger.info('Validating that created user details match the sent payload.');
                    logger.info(`Created user: ${StringUtils.prettyJson(created, { newline: true })}`);
                    logger.info(`User from payload: ${StringUtils.prettyJson(user, { newline: true })}`);
                    expect.soft(
                        user.name,
                        "Created user name must match the sent payload"
                    ).toStrictEqual(created.name);
                    expect.soft(
                        user.email,
                        "Created user email must match the sent payload"
                    ).toStrictEqual(created.email);
                    expect.soft(
                        user.age,
                        "Created user age must match the sent payload"
                    ).toStrictEqual(created.age);
                });

                await test.step('Validate user is available in Get All Users', async () => {
                    logger.info('Validating that user is available in Get All Users.');
                    const users = await userApi.all();
                    const found = users.find(
                        u =>
                            u.name === created.name &&
                            u.email === created.email &&
                            u.age === created.age
                    ) as UserType;
                    logger.info(`User found: ${StringUtils.prettyJson(found, { newline: true })}`);
                    expect.soft(
                        user.name,
                        "Created user name must match the user found in Get All Users"
                    ).toStrictEqual(found.name);
                    expect.soft(
                        user.email,
                        "Created user email must match the user found in Get All Users"
                    ).toStrictEqual(found.email);
                    expect.soft(
                        user.age,
                        "Created user age must match the user found in Get All Users"
                    ).toStrictEqual(found.age);
                });
            });
    });

    test('Create valid user - extra field',
        { tag: ['@LOANPRO-0007', '@valid-user', '@extra-field'] },
        async ({
            userApi, logger
        }) => {

            let user: UserTypeWithExtraField = CreateRandomUser({ extra: 'unexpected field' }) as UserTypeWithExtraField;
            let created: UserTypeWithExtraField;

            await test.step('Create user in API', async () => {
                logger.info(`Creating user in API: ${StringUtils.prettyJson(user, { newline: true })}`);
                created = await userApi.create(user) as UserTypeWithExtraField;
                createdUsers.push(created);
                logger.info(`Created user in API: ${StringUtils.prettyJson(created, { newline: true })}`);
            });

            await test.step('Validate user details', async () => {
                logger.info('Validating created users details.');
                logger.info(`Validating user: ${StringUtils.prettyJson(created, { newline: true })}`);
                expect.soft(
                    created.name,
                    "User name must be a string"
                ).toEqual(expect.any(String));
                expect.soft(
                    created.email,
                    "User email must be a valid email"
                ).toBeAnEmail(created.email);
                expect.soft(
                    created.age,
                    "User age must be a number"
                ).toEqual(expect.any(Number));
                expect(
                    created.age,
                    "User age must be a number greater than or equal to 1"
                ).toBeGreaterThanOrEqual(1);
                expect(
                    created.age,
                    "User age must be a number lesser than or equal to 150"
                ).toBeLessThanOrEqual(150);
            });

            await test.step('Validate user details match', async () => {
                logger.info('Validating that created user details match the sent payload.');
                logger.info(`Created user: ${StringUtils.prettyJson(created, { newline: true })}`);
                logger.info(`User from payload: ${StringUtils.prettyJson(user, { newline: true })}`);
                expect.soft(
                    user.name,
                    "Created user name must match the sent payload"
                ).toStrictEqual(created.name);
                expect.soft(
                    user.email,
                    "Created user email must match the sent payload"
                ).toStrictEqual(created.email);
                expect.soft(
                    user.age,
                    "Created user age must match the sent payload"
                ).toStrictEqual(created.age);

            });

            await test.step('Validate created user do not have the extra field', async () => {
                logger.info('Validating that created user do not have the extra field.');
                logger.info(`Created user: ${StringUtils.prettyJson(created, { newline: true })}`);
                logger.info(`User from payload: ${StringUtils.prettyJson(user, { newline: true })}`);
                expect.soft(
                    created.extra,
                    "Created user should not have the extra field"
                ).toBeFalsy();
            });

        });

    test('Create valid user - duplicated email error',
        { tag: ['@LOANPRO-0008', '@valid-user', '@duplicated-email'] },
        async ({
            userApi, logger
        }) => {

            let user: UserType = CreateRandomUser() as UserType;
            const duplicatedEmailUser: UserType = CreateRandomUser({ email: user.email }) as UserType;
            let response: CustomResponseType;

            await test.step('Create a valid user in API to ensure an user with a valid email exists', async () => {
                logger.info(`Creating user in API: ${StringUtils.prettyJson(user, { newline: true })}`);
                user = await userApi.create(user) as UserType;
                createdUsers.push(user);
                logger.info(`Created user in API: ${StringUtils.prettyJson(user, { newline: true })}`);
            });

            await test.step('Create invalid user in API - duplicated email', async () => {
                logger.info(`Creating user in API: ${StringUtils.prettyJson(user, { newline: true })}`);
                response = await userApi.create(user) as CustomResponseType;
                createdUsers.push(duplicatedEmailUser);
                logger.info(`Response from API: ${StringUtils.prettyJson(response, { newline: true })}`);
            });

            await test.step('Validate error response', async () => {
                const expectedErrorMessage = 'Email already exists';
                logger.info(`Validating error response: ${StringUtils.prettyJson(response, { newline: true })}`);
                expect.soft(
                    response.code,
                    "Creating user with a duplicated email should return a 409 status code"
                ).toStrictEqual(409);
                expect.soft(
                    response.message,
                    `Creating user with a duplicated email should return an error in the body with the message '${expectedErrorMessage}'`
                ).toStrictEqual(expectedErrorMessage);

            });
        });

    [
        {
            'validation': 'blank name',
            'errorMessage': 'name is required',
            'tags': ['@LOANPRO-0009', '@blank-name', '@name-error'],
            'user': CreateRandomUser({ name: EMPTY })
        },
        {
            'validation': 'missing name field',
            'errorMessage': 'name is required',
            'tags': ['@LOANPRO-0010', '@missing-name', '@name-error'],
            'user': CreateRandomUser({ name: null })
        },
        {
            'validation': 'large name field', // Validate with team, not documented but should not be possible
            'errorMessage': 'name is too large',
            'tags': ['@LOANPRO-0011', '@large-name', '@name-error'],
            'user': CreateRandomUser({ name: StringUtils.generateText(10000) })
        },
        {
            'validation': 'blank email',
            'errorMessage': 'email is required',
            'tags': ['@LOANPRO-0012', '@blank-email', '@email-error'],
            'user': CreateRandomUser({ email: EMPTY })
        },
        {
            'validation': 'missing email field',
            'errorMessage': 'email is required',
            'tags': ['@LOANPRO-0013', '@missing-email', '@email-error'],
            'user': CreateRandomUser({ email: null })
        },
        {
            'validation': 'invalid email format', // Validate with team, not documented but should not be possible
            'errorMessage': 'Invalid email format',
            'tags': ['@LOANPRO-0014', '@invalid-email-format', '@email-error'],
            'user': CreateRandomUser({ email: 'notanemail.com' })
        },
        {
            'validation': 'missing age field',
            'errorMessage': 'age is required',
            'tags': ['@LOANPRO-0015', '@missing-age', '@age-error'],
            'user': CreateRandomUser({ age: null })
        },
        {
            'validation': 'invalid age format (string)',
            'errorMessage': 'Age must be between 1 and 150',
            'tags': ['@LOANPRO-0016', '@invalid-age-format', '@age-error'],
            'user': CreateRandomUser({ age: 'Twenty' })
        },
        {
            'validation': 'invalid age format (decimal)',
            'errorMessage': 'Age must be between 1 and 150',
            'tags': ['@LOANPRO-0017', '@invalid-age-format', '@age-error'],
            'user': CreateRandomUser({ age: 20.5 })
        },
        {
            'validation': 'age below minimum value',
            'errorMessage': 'Age must be between 1 and 150',
            'tags': ['@LOANPRO-0018', '@minimum-age', '@age-error'],
            'user': CreateRandomUser({ age: 0 })
        },
        {
            'validation': 'age above maximum value',
            'errorMessage': 'Age must be between 1 and 150',
            'tags': ['@LOANPRO-0019', '@maximum-age', '@age-error'],
            'user': CreateRandomUser({ age: 151 })
        },
        {
            'validation': 'negative age value',
            'errorMessage': 'Age must be between 1 and 150',
            'tags': ['@LOANPRO-0020', '@negative-age', '@age-error'],
            'user': CreateRandomUser({ age: -1 })
        },
        {
            'validation': 'empty payload',
            'errorMessage': 'name is required',
            'tags': ['@LOANPRO-0021', '@empty-payload'],
            'user': {}
        },
        {
            'validation': 'malformed payload',
            'errorMessage': 'Invalid JSON body',
            'tags': ['@LOANPRO-0022', '@malformed-payload'],
            'user': StringUtils.prettyJson(CreateRandomUser()).slice(1)
        },
    ].forEach(({ validation, errorMessage, tags, user }) => {
        test(`Create invalid user - ${validation} error`,
            { tag: ['@invalid-user'].concat(tags) },
            async ({
                userApi, logger
            }) => {

                let response: CustomResponseType;

                await test.step(`Create invalid user in API - ${validation}`, async () => {
                    logger.info(`Creating user in API: ${StringUtils.prettyJson(user, { newline: true, truncateField: 50 })}`);
                    response = await userApi.create(user) as CustomResponseType;
                    logger.info(`Response from API: ${StringUtils.prettyJson(response, { newline: true, truncateField: 50 })}`);
                });

                await test.step('Validate error response', async () => {
                    logger.info(`Validating error response: ${StringUtils.prettyJson(response, { newline: true, truncateField: 50 })}`);
                    expect.soft(
                        response.code,
                        `Creating user with a ${validation} should return a 400 status code`
                    ).toStrictEqual(400);
                    expect.soft(
                        response.message,
                        `Creating user with a ${validation} should return an error with the message '${errorMessage}' in the body`
                    ).toStrictEqual(errorMessage);

                });
            });
    });


});