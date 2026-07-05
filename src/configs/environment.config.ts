import { config } from 'dotenv';
import Joi from 'joi';

if (!process.env.APPLICATION_ENVIRONMENT) {
    process.env.APPLICATION_ENVIRONMENT = 'dev';
}

config({
    path: [
        '.env',
        `.env.${process.env.APPLICATION_ENVIRONMENT}`
    ],
    quiet: true,
    override: true,
});

const variables = {
    // Playwright variables
    WORKERS: Joi.number().integer().positive(),

    // Application variables
    APPLICATION: Joi.string().required(),
    APPLICATION_ENVIRONMENT: Joi.string().valid('dev', 'prod').required(),
    BASE_URL: Joi.string().uri().required(),
    AUTH_TOKEN: Joi.string().required(),

    // Logger variables
    LOG_CONSOLE: Joi.boolean(),
    LOG_TYPE: Joi.string().valid('text', 'json').default('text'),
    LOG_LEVEL: Joi.string().valid('info', 'debug', 'warn', 'error', 'trace'),
    LOG_TIMESTAMP_FORMAT: Joi.string(),
    LOG_LINE_LENGTH: Joi.number().integer().positive(),
}

const parsed = Joi.object(variables)
    .unknown(true)
    .validate(
        process.env, {
        allowUnknown: true,
        abortEarly: false,
    });

if (parsed.error) {
    throw new Error(`Environment variables validation error: ${parsed.error.message}`);
}

export class Environment {

    static readonly WORKERS: number = parsed.value.WORKERS;

    static readonly APPLICATION: string = parsed.value.APPLICATION;
    static readonly APPLICATION_ENVIRONMENT: string = parsed.value.APPLICATION_ENVIRONMENT;
    static readonly BASE_URL: string = parsed.value.BASE_URL;
    static readonly BASE_API_URL: string = `${Environment.BASE_URL}/${Environment.APPLICATION_ENVIRONMENT}`;
    static readonly USERS_API_URL: string = `${Environment.BASE_URL}/${Environment.APPLICATION_ENVIRONMENT}/users`;
    static readonly AUTH_TOKEN: string = parsed.value.AUTH_TOKEN;

    static readonly LOG_CONSOLE: boolean = parsed.value.LOG_CONSOLE;
    static readonly LOG_TYPE: string = parsed.value.LOG_TYPE;
    static readonly LOG_LEVEL: string = parsed.value.LOG_LEVEL;
    static readonly LOG_TIMESTAMP_FORMAT: string = parsed.value.LOG_TIMESTAMP_FORMAT;
    static readonly LOG_LINE_LENGTH: number = parsed.value.LOG_LINE_LENGTH;

}
