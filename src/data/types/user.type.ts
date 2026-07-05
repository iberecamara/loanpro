import { NumberUtils } from '@utils/number.utils';
import { StringUtils } from '@utils/string.utils';

export interface UserType {
    name: string;
    email: string;
    age: number | string;
}

export interface UserTypeWithExtraField extends UserType {
    extra: string;
}

export type UserTypeWithoutName = Omit<UserType, 'name'>;
export type UserTypeWithoutEmail = Omit<UserType, 'email'>;
export type UserTypeWithoutAge = Omit<UserType, 'age'>;

export type UserTypeVariations =
    | UserType
    | UserTypeWithExtraField
    | UserTypeWithoutName
    | UserTypeWithoutEmail
    | UserTypeWithoutAge;

export type CreateRandomUserOptions = {
    name?: string | null;
    email?: string | null;
    age?: number | string | null;
    extra?: string;
};

export function CreateRandomUser(options?: CreateRandomUserOptions): UserTypeVariations {

    const name = options?.name ?? StringUtils.generateRandomName();
    const email = options?.email ?? StringUtils.generateRandomEmail();
    const age = options?.age ?? NumberUtils.generateRandomNumber({ min: 1, max: 150 });

    if (options?.name === null) {
        return {
            email,
            age
        };
    }

    if (options?.email === null) {
        return {
            name,
            age
        };
    }

    if (options?.age === null) {
        return {
            name,
            email
        };
    }

    if (options?.extra) {
        return {
            name,
            email,
            age,
            extra: options.extra
        };
    }

    return {
        name,
        email,
        age
    };
}