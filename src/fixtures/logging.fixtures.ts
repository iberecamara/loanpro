import { Environment } from "@configs/environment.config";
import { EMPTY, NEWLINE } from "@data/constants/constants";
import { test as base, TestInfo } from "@playwright/test";
import { LoanProTestAutomationLogger } from "@utils/logger.utils";
import { LoanProTestAutomationException } from "../exceptions/test-automation.exception";

type LoggingFixtures = {
    logger: LoanProTestAutomationLogger;
    autologger: void;
    logError: void;
};

export const test = base.extend<LoggingFixtures>({
    logger: async ({ }, use, testInfo) => {
        const tag = testInfo.tags.find(t => t.startsWith('@LOANPRO'))?.replace('@', EMPTY);
        if (!tag) {
            throw new LoanProTestAutomationException(
                `Test '${testInfo.title}' in file '${testInfo.file}' does not have a @LOANPRO tag. Every test must have a tag linking to a Test Case id.`
            )
        }
        const log = LoanProTestAutomationLogger.getInstance(testInfo.workerIndex.toString());
        await use(log);
    },
    autologger: [
        async ({ logger }, use, testInfo: TestInfo) => {

            logger.info('*'.repeat(Environment.LOG_LINE_LENGTH));
            logger.info(NEWLINE);
            logger.info(`Starting test: ${testInfo.title}`);
            logger.info(`Test tags: ${testInfo.tags}`);
            if (testInfo.annotations.length > 0) {
                logger.info(`Test annotations: ${testInfo.annotations}`);
            }
            await use();
            logger.info(`Test finished: ${testInfo.title}`);
            logger.info(NEWLINE);
            logger.info('#'.repeat(Environment.LOG_LINE_LENGTH));
        }, {
            auto: true
        }
    ],
    logError: [
        async ({ }, use) => {
            await use();
            if (test.info().errors.length > 0) {
                const logger = LoanProTestAutomationLogger.getInstance();
                for (const error of test.info().errors) {
                    if (error.message) {
                        logger.error(`${error.message}${NEWLINE.repeat(2)}`);
                    }
                }
            }
        }, {
            auto: true
        }
    ],
});