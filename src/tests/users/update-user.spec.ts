import { CREATED, SEEDED } from '@data/constants/common.constants';
import { EMPTY, NEWLINE } from '@data/constants/string.constants';
import { CustomResponseType } from '@data/types/custom-response.type';
import { CreateRandomUser, UserType } from '@data/types/user.type';
import { expect, test } from '@fixtures/fixtures';
import { NumberUtils } from '@utils/number.utils';
import { StringUtils } from '@utils/string.utils';

test.describe('Validations for Update Users', {
    tag: ['@user', '@update', '@update-user']
},
    async () => {

        let user: UserType;

        test.beforeEach(async ({ logger, userApi, userSteps }) => {
            user = await userSteps.seed(logger, userApi, false) as UserType;
        });

        test.afterEach(async ({ logger, userApi, userSteps }) => {
            await userSteps.deleteSeeded(logger, userApi, user, SEEDED);
        });

        [
            {
                'validation': 'existing user with valid data for all fields',
                'tags': ['@LOANPRO-0025', '@update-all-fields'],
            },
            {
                'validation': 'existing user with valid data for name',
                'tags': ['@LOANPRO-0026', '@update-name'],
            },
            {
                'validation': 'existing user with valid data for email',
                'tags': ['@LOANPRO-0027', '@update-email'],
            },
            {
                'validation': 'existing user with valid data for age',
                'tags': ['@LOANPRO-0028', '@update-age'],
            },
        ].forEach(({ validation, tags }) => {
            test(`Update user - update ${validation}`,
                { tag: ['@existing-user', '@valid-data'].concat(tags) },
                async ({
                    userApi, logger
                }) => {

                    let updated: UserType;
                    if (test.info().tags.includes('@update-all-fields')) {
                        updated = CreateRandomUser() as UserType;
                    } else if (test.info().tags.includes('@update-name')) {
                        updated = { ...user };
                        updated.name = StringUtils.generateRandomName();
                    } else if (test.info().tags.includes('@update-email')) {
                        updated = { ...user };
                        updated.email = StringUtils.generateRandomEmail();
                    } else if (test.info().tags.includes('@update-age')) {
                        updated = { ...user };
                        let updatedAge: number;
                        do {
                            updatedAge = NumberUtils.generateRandomNumber({ min: 1, max: 150 });
                        } while (updatedAge === user.age)
                        updated.age = updatedAge;
                    }

                    let returned: UserType;
                    await test.step('Update user in API', async () => {
                        logger.info(`Updating user with email '${user.email}' in API:`);
                        logger.info(`Original user data: ${StringUtils.prettyJson(user, { newline: true })}`);
                        logger.info(`Updating with data: ${StringUtils.prettyJson(updated, { newline: true })}`);
                        returned = await userApi.update(user.email, updated) as UserType;
                        user.email = returned.email; // For cleanup purposes when the email is updated
                        logger.info('Finished updating user in API.');
                    });

                    await test.step('Validate returned user details', async () => {
                        logger.info(`Validating returned user: ${StringUtils.prettyJson(returned, { newline: true })}`);
                        expect.soft(
                            returned.name,
                            "User name must be a string"
                        ).toEqual(expect.any(String));
                        expect.soft(
                            returned.email,
                            "User email must be a valid email"
                        ).toBeAnEmail(returned.email);
                        expect.soft(
                            returned.age,
                            "User age must be a number"
                        ).toEqual(expect.any(Number));
                        expect(
                            returned.age,
                            "User age must be a number greater than or equal to 1"
                        ).toBeGreaterThanOrEqual(1);
                        expect(
                            returned.age,
                            "User age must be a number lesser than or equal to 150"
                        ).toBeLessThanOrEqual(150);
                    });

                    await test.step('Validate returned user details match the updated data', async () => {
                        logger.info('Validating that returned user details match the updated user.');
                        logger.info(`Updated user: ${StringUtils.prettyJson(updated, { newline: true })}`);
                        logger.info(`Returned user: ${StringUtils.prettyJson(returned, { newline: true })}`);
                        expect.soft(
                            updated.name,
                            "Updated user name must match the returned user"
                        ).toStrictEqual(returned.name);
                        expect.soft(
                            updated.email,
                            "Updated user email must match the returned user"
                        ).toStrictEqual(returned.email);
                        expect.soft(
                            updated.age,
                            "Updated user age must match the returned user"
                        ).toStrictEqual(returned.age);

                    });
                });
        });

        test('Update user - update user twice with same data',
            { tag: ['@LOANPRO-0029', '@existing-user', '@valid-data', '@idempotency'] },
            async ({
                userApi, logger
            }) => {

                let updated: UserType = CreateRandomUser({ name: user.name, age: user.age }) as UserType;
                let firstReturned: UserType;
                let secondReturned: UserType;

                await test.step('Update user in API', async () => {
                    logger.info(`Updating user with email for the first time '${user.email}' in API:`);
                    logger.info(`Original user data: ${StringUtils.prettyJson(user, { newline: true })}`);
                    logger.info(`Updating with data: ${StringUtils.prettyJson(updated, { newline: true })}`);
                    firstReturned = await userApi.update(user.email, updated) as UserType;
                    logger.info('Finished updating the user for the first time in API.');
                });

                await test.step('Update user in API', async () => {
                    logger.info(`Updating user with email for the second time'${user.email}' in API:`);
                    logger.info(`Updating with data: ${StringUtils.prettyJson(updated, { newline: true })}`);
                    secondReturned = await userApi.update(user.email, updated) as UserType;
                    logger.info('Finished updating the user for the second time in API.');
                });

                await test.step('Validate first returned user details', async () => {
                    logger.info(`Validating first returned user: ${StringUtils.prettyJson(firstReturned, { newline: true })}`);
                    expect.soft(
                        firstReturned.name,
                        "User name must be a string"
                    ).toEqual(expect.any(String));
                    expect.soft(
                        firstReturned.email,
                        "User email must be a valid email"
                    ).toBeAnEmail(firstReturned.email);
                    expect.soft(
                        firstReturned.age,
                        "User age must be a number"
                    ).toEqual(expect.any(Number));
                    expect(
                        firstReturned.age,
                        "User age must be a number greater than or equal to 1"
                    ).toBeGreaterThanOrEqual(1);
                    expect(
                        firstReturned.age,
                        "User age must be a number lesser than or equal to 150"
                    ).toBeLessThanOrEqual(150);
                });

                await test.step('Validate first returned user details match the updated data', async () => {
                    logger.info('Validating that first returned user details match the updated user.');
                    logger.info(`Updated user: ${StringUtils.prettyJson(updated, { newline: true })}`);
                    logger.info(`First returned user: ${StringUtils.prettyJson(firstReturned, { newline: true })}`);
                    expect.soft(
                        updated.name,
                        "Updated user name must match the returned user"
                    ).toStrictEqual(firstReturned.name);
                    expect.soft(
                        updated.email,
                        "Updated user email must match the returned user"
                    ).toStrictEqual(firstReturned.email);
                    expect.soft(
                        updated.age,
                        "Updated user age must match the returned user"
                    ).toStrictEqual(firstReturned.age);
                });

                await test.step('Validate second returned user details match the updated data', async () => {
                    logger.info('Validating that second returned user details match the updated user.');
                    logger.info(`Second returned user: ${StringUtils.prettyJson(secondReturned, { newline: true })}`);
                    logger.info(`Updated user: ${StringUtils.prettyJson(updated, { newline: true })}`);
                    expect.soft(
                        updated.name,
                        "Updated user name must match the returned user"
                    ).toStrictEqual(secondReturned.name);
                    expect.soft(
                        updated.email,
                        "Updated user email must match the returned user"
                    ).toStrictEqual(secondReturned.email);
                    expect.soft(
                        updated.age,
                        "Updated user age must match the returned user"
                    ).toStrictEqual(secondReturned.age);
                });

            });

        test('Update user - update non-existing user',
            { tag: ['@LOANPRO-0030', '@non-existing-user'] },
            async ({
                userApi, logger
            }) => {

                const updated: UserType = { ...user }
                updated.email = `not.the.same.email${user.email}`;
                let response: CustomResponseType;

                await test.step('Update user in API', async () => {
                    logger.info(`Updating user with email for the first time'${user.email}' in API:`);
                    logger.info(`Updating with data: '${StringUtils.prettyJson(updated, { newline: true })}`);
                    response = await userApi.update(updated.email, updated) as CustomResponseType;
                    logger.info('Finished updating the user for the first time in API.');
                });

                await test.step('Validate error response', async () => {
                    logger.info(`Validating error response: ${StringUtils.prettyJson(response, { newline: true })}`);
                    expect.soft(
                        response.code,
                        `Updating non-existing user should return a 404 status code`
                    ).toStrictEqual(404);
                    const errorMessage = 'User not found';
                    expect.soft(
                        response.message,
                        `Updating non-existing user should return an error with the message '${errorMessage}' in the body`
                    ).toStrictEqual(errorMessage);

                });

            });

        test('Update user - update existing user with an email already taken',
            { tag: ['@LOANPRO-0031', '@update-email', '@email-error'] },
            async ({
                userApi, logger, userSteps
            }) => {


                let response: CustomResponseType;
                const updated: UserType = { ...user }
                console.log(StringUtils.prettyJson(updated, { newline: true }))
                const userWithExistingEmail = await userSteps.seed(logger, userApi, false) as UserType;
                console.log(StringUtils.prettyJson(userWithExistingEmail, { newline: true }))
                updated.email = userWithExistingEmail.email;
                console.log(StringUtils.prettyJson(updated, { newline: true }))

                await test.step('Update user in API', async () => {
                    logger.info(`Updating user with email already taken '${updated.email}' in API.`);
                    logger.info(`Updating with data: ${StringUtils.prettyJson(updated, { newline: true })}`);
                    response = await userApi.update(user.email, updated) as CustomResponseType;
                    logger.info(`Response from API: ${StringUtils.prettyJson(response, { newline: true })}`);
                });

                await test.step('Validate error response', async () => {
                    logger.info(`Validating error response: ${StringUtils.prettyJson(response, { newline: true })}`);
                    expect.soft(
                        response.code,
                        `Updating non-existing user should return a 404 status code`
                    ).toStrictEqual(409);
                    const errorMessage = 'Email already exists';
                    expect.soft(
                        response.message,
                        `Updating non-existing user should return an error with the message '${errorMessage}' in the body`
                    ).toStrictEqual(errorMessage);
                });
                await userSteps.deleteSeeded(logger, userApi, userWithExistingEmail, CREATED);

            });

        [
            {
                'validation': 'existing user with blank name',
                'errorMessage': 'name is required',
                'tags': ['@LOANPRO-0032', '@update-name', '@name-error'],
                'updated': CreateRandomUser({ name: EMPTY })
            },
            {
                'validation': 'existing user with missing name field',
                'errorMessage': 'name is required',
                'tags': ['@LOANPRO-0033', '@update-name', '@name-error'],
                'updated': CreateRandomUser({ name: null })
            },
            {
                'validation': 'large name field', // Validate with team, not documented but should not be possible
                'errorMessage': 'name is too large',
                'tags': ['@LOANPRO-0034', '@large-name', '@name-error'],
                'updated': CreateRandomUser({ name: StringUtils.generateText(10000) })
            },
            {
                'validation': 'existing user with blank email',
                'errorMessage': 'email is required',
                'tags': ['@LOANPRO-0035', '@update-email', '@email-error'],
                'updated': CreateRandomUser({ email: EMPTY })
            },
            {
                'validation': 'existing user with missing email field',
                'errorMessage': 'email is required',
                'tags': ['@LOANPRO-0036', '@update-email', '@email-error'],
                'updated': CreateRandomUser({ email: null })
            },
            {
                'validation': 'invalid email format', // Validate with team, not documented but should not be possible
                'errorMessage': 'Invalid email format',
                'tags': ['@LOANPRO-0037', '@invalid-email-format', '@email-error'],
                'updated': CreateRandomUser({ email: 'notanemail.com' })
            },
            {
                'validation': 'missing age field',
                'errorMessage': 'age is required',
                'tags': ['@LOANPRO-0038', '@missing-age', '@age-error'],
                'updated': CreateRandomUser({ age: null })
            },
            {
                'validation': 'invalid age format (string)',
                'errorMessage': 'Age must be between 1 and 150',
                'tags': ['@LOANPRO-0039', '@invalid-age-format', '@age-error'],
                'updated': CreateRandomUser({ age: 'Twenty' })
            },
            {
                'validation': 'invalid age format (decimal)',
                'errorMessage': 'Age must be between 1 and 150',
                'tags': ['@LOANPRO-0040', '@invalid-age-format', '@age-error'],
                'updated': CreateRandomUser({ age: 20.5 })
            },
            {
                'validation': 'age below minimum value',
                'errorMessage': 'Age must be between 1 and 150',
                'tags': ['@LOANPRO-0041', '@minimum-age', '@age-error'],
                'updated': CreateRandomUser({ age: 0 })
            },
            {
                'validation': 'age above maximum value',
                'errorMessage': 'Age must be between 1 and 150',
                'tags': ['@LOANPRO-0042', '@maximum-age', '@age-error'],
                'updated': CreateRandomUser({ age: 151 })
            },
            {
                'validation': 'negative age value',
                'errorMessage': 'Age must be between 1 and 150',
                'tags': ['@LOANPRO-0043', '@negative-age', '@age-error'],
                'updated': CreateRandomUser({ age: -1 })
            },
            {
                'validation': 'empty payload',
                'errorMessage': 'name is required',
                'tags': ['@LOANPRO-0044', '@empty-payload'],
                'updated': {}
            },
            {
                'validation': 'malformed payload',
                'errorMessage': 'Invalid JSON body',
                'tags': ['@LOANPRO-0045', '@malformed-payload'],
                'updated': StringUtils.prettyJson(CreateRandomUser()).slice(1).replaceAll(NEWLINE, EMPTY).trim().replace(/\s+/g, ' ')
            },
        ].forEach(({ validation, errorMessage, tags, updated }) => {
            test(`Update user - ${validation} error`,
                { tag: ['@user', '@update', '@update-user', '@existing-user', '@invalid-data'].concat(tags) },
                async ({
                    userApi, logger
                }) => {

                    let response: CustomResponseType;
                    await test.step('Update user in API', async () => {
                        logger.info(`Updating user with email: '${user.email}' in API:`);
                        logger.info(`Original user data: ${StringUtils.prettyJson(user, { newline: true })}`);
                        logger.info(`Updating with data: ${StringUtils.prettyJson(updated, { newline: true })}`);
                        response = await userApi.update(user.email, updated) as CustomResponseType;
                        logger.info(`Response from API: ${StringUtils.prettyJson(response, { newline: true })}`);
                    });

                    await test.step('Validate error response', async () => {
                        logger.info(`Validating error response: ${StringUtils.prettyJson(response, { newline: true })}`);
                        expect.soft(
                            response.code,
                            `Updating existing user with ${validation} should return a 400 status code`
                        ).toStrictEqual(400);
                        expect.soft(
                            response.message,
                            `Updating existing user with ${validation} should return an error with the message '${errorMessage}' in the body`
                        ).toStrictEqual(errorMessage);
                    });

                });
        });

        test('Update user - Updating user allow to find user with the new email and the previous email should not be found',
            { tag: ['@LOANPRO-0046', '@get', '@existing-user'] },
            async ({
                userApi, logger
            }) => {

                const updated = { ...user };
                updated.email = StringUtils.generateRandomEmail();
                let returned: UserType;
                let found: UserType;
                let response: CustomResponseType;

                await test.step('Update user in API', async () => {
                    logger.info(`Updating user with email '${user.email}' in API:`);
                    logger.info(`Updating with data: ${StringUtils.prettyJson(updated, { newline: true })}`);
                    returned = await userApi.update(user.email, updated) as UserType;
                    user.email = returned.email; // For cleanup purposes when the email is updated
                    logger.info('Finished updating user in API.');
                });

                await test.step('Find user in API', async () => {
                    logger.info(`Finding user with old email '${user.email}' in API.`);
                    response = await userApi.find(user.email) as CustomResponseType;
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

                await test.step('Find user in API', async () => {
                    logger.info(`Finding user updated with email '${updated.email}' in API.`);
                    found = await userApi.find(updated.email) as UserType;
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


        test('Update user - Method Not Allowed error',
            { tag: ['@LOANPRO-0047', '@patch', '@update-user', '@existing-user', '@invalid-data'].filter(t => t !== '@update') },
            async ({
                userApi, logger
            }) => {

                const updated: UserType = CreateRandomUser() as UserType;
                let response: CustomResponseType;
                await test.step('Update user in API', async () => {
                    logger.info(`Updating user with email for the first time'${user.email}' in API:`);
                    logger.info(`Updating with data: ${StringUtils.prettyJson(updated, { newline: true })}`);
                    response = await userApi.patch(user.email, updated) as CustomResponseType;
                    logger.info(`Response from API: ${StringUtils.prettyJson(response, { newline: true })}`);
                });

                await test.step('Validate error response', async () => {
                    logger.info(`Validating error response: ${StringUtils.prettyJson(response, { newline: true })}`);
                    expect.soft(
                        response.code,
                        'Updating existing user with PATCH should return a 405 status code'
                    ).toStrictEqual(405);
                    const errorMessage = 'Method Not Allowed';
                    expect.soft(
                        response.message,
                        `Updating existing user with PATCH should return an error with the message '${errorMessage}' in the body`
                    ).toStrictEqual(errorMessage);
                });

            });
    });
