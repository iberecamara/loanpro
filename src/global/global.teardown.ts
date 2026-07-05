import { FullConfig } from '@playwright/test';
import { LoanProTestAutomationLogger } from '@utils/logger.utils';

async function globalTeardown(config: FullConfig) {
    LoanProTestAutomationLogger.splitGeneratedLogs();
    await LoanProTestAutomationLogger.removeTempFiles();
}

export default globalTeardown;
