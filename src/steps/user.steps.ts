import { UserApi } from "@api/user.api";
import { EMPTY } from "@data/constants/string.constants";
import { CreateRandomUser, UserType } from "@data/types/user.type";
import { test } from "@fixtures/fixtures";
import { LoanProTestAutomationLogger } from "@utils/logger.utils";
import { NumberUtils } from "@utils/number.utils";

export class UserSteps {

    async seed(logger: LoanProTestAutomationLogger, userApi: UserApi, multiple: boolean): Promise<UserType | UserType[]> {
        const seededUsers: UserType[] = []
        await test.step(`Seed user${multiple ? 's' : EMPTY} in API.`, async () => {
            const quantity = NumberUtils.generateRandomNumber({ min: 1, max: multiple ? 5 : 1 });
            logger.info(`Seeding ${quantity} user${multiple ? 's' : EMPTY} in API.`);
            for (let i = 0; i < quantity; i++) {
                seededUsers.push(await userApi.create(CreateRandomUser()) as UserType);
            }
            logger.info(`User${multiple ? 's' : EMPTY} seeded in API.`);
        });
        if (multiple) {
            return seededUsers;
        }
        return seededUsers.at(0)!;
    }

    async deleteSeeded(logger: LoanProTestAutomationLogger, userApi: UserApi, seeded: UserType | UserType[], mode: string): Promise<void> {
        const multiple = Array.isArray(seeded);
        await test.step(`Remove ${mode} user${multiple ? 's' : EMPTY} in API`, async () => {
            logger.info(`Removing user${multiple ? 's' : EMPTY} previously ${mode} in API.`);
            if (multiple) {
                for await (const user of seeded) {
                    await userApi.delete(user.email);
                }
            } else {
                await userApi.delete(seeded.email);
            }
            logger.info(`Removed users previously ${mode} in API.`);
        });
    }

}