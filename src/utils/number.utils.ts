import { faker } from "@faker-js/faker";

export class NumberUtils {

    public static generateRandomNumber(options?: { min?: number; max?: number }): number {
        return faker.number.int({ min: options?.min, max: options?.max });
    }

}
