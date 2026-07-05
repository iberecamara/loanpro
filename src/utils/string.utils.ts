import { EMPTY, NEWLINE } from "@data/constants/constants";
import { faker } from "@faker-js/faker";

export class StringUtils {

    static prettyJson<T>(target: T, options?: { newline?: boolean, truncateField?: number }): string {
        const replacer = (key: string, value: any) => {
            const limit = options?.truncateField;
            if (typeof limit === 'number' && typeof value === 'string' && value.length > limit) {
                return `${value.substring(0, limit)} [...] (truncated value, original string length was ${value.length})`;
            }
            return value;
        };
        const stringfied = JSON.stringify(target, replacer, 4);
        if (options?.newline === true) {
            return `${NEWLINE}${stringfied}`;
        }
        return stringfied;
    }

    static generateRandomName(): string {
        return faker.person.fullName();
    }

    static generateRandomEmoji(): string {
        return faker.internet.emoji();
    }

    static generateRandomEmail(): string {
        return faker.internet.email();
    }

    static generateText(words?: number): string {
        return faker.lorem.words(words);
    }

    static capitalize(text: string): string {
        return text.replace(/^\w/, (c) => c.toUpperCase());
    }

    static capitalizeAll(text: string): string {
        return text
            .split(/(\s+)/)
            .map((word) => StringUtils.capitalize(word))
            .join(EMPTY);
    }

}
