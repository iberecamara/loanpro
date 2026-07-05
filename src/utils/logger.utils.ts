import { Environment } from '@configs/environment.config';
import { EMPTY } from '@data/constants/string.constants';
import { DateTimeUtils } from '@utils/datetime.utils';
import * as fs from 'fs';
import * as path from 'path';
import winston from 'winston';

const PRINTF_FORMATTER = winston.format.printf(({ level, message, timestamp }: any) => {
    return `[${level}] - ${timestamp}: ${message}`;
});

const TIMESTAMP_FORMAT = { format: Environment.LOG_TIMESTAMP_FORMAT };

export const LOG_FOLDER = './artifacts/logs';

export class LoanProTestAutomationLogger {

    private static instance: LoanProTestAutomationLogger;
    private readonly winstonLogger: winston.Logger;
    lineLenght: number;
    static dirpath: string = EMPTY;

    private constructor(worker: string) {
        this.lineLenght = Environment.LOG_LINE_LENGTH;
        this.winstonLogger = LoanProTestAutomationLogger.startLogger(worker);
    }

    public static getInstance(worker?: string): LoanProTestAutomationLogger {
        if (!LoanProTestAutomationLogger.instance) {
            if (!worker) {
                throw new Error('Worker name is required to initialize the logger instance.');
            } else {
                LoanProTestAutomationLogger.instance = new LoanProTestAutomationLogger(worker);
            }
        }
        return LoanProTestAutomationLogger.instance;
    }

    private static startLogger(worker: string): winston.Logger {
        const dateTime = DateTimeUtils.getDateTime({ fileFormat: true });
        const transports = [];

        if (Environment.LOG_CONSOLE) {
            transports.push(new winston.transports.Console());
        }
        LoanProTestAutomationLogger.dirpath = `${LOG_FOLDER}/${Environment.APPLICATION_ENVIRONMENT}/${dateTime.date}`;
        transports.push(new winston.transports.File({
            filename: `TEMP-test-automation-${worker}-${dateTime.datetime}.log`,
            dirname: LoanProTestAutomationLogger.dirpath,
        }));

        return winston.createLogger({
            level: Environment.LOG_LEVEL,
            format: LoanProTestAutomationLogger.getFormat(),
            transports: transports,
        });

    }

    private static getFormat(): winston.Logform.Format {
        if (Environment.LOG_TYPE === 'json') {
            return LoanProTestAutomationLogger.jsonFormat();
        } else {
            return LoanProTestAutomationLogger.textFormat();
        }
    }

    private static jsonFormat(): winston.Logform.Format {
        return winston.format.combine(
            winston.format.errors({ stack: true }),
            winston.format.json(),
            winston.format.prettyPrint({ depth: 4, colorize: true }),
            winston.format.timestamp(TIMESTAMP_FORMAT),
            winston.format.metadata(),
            PRINTF_FORMATTER,
        );
    }

    private static textFormat(): winston.Logform.Format {
        return winston.format.combine(
            winston.format.colorize(),
            winston.format.errors({ stack: true }),
            winston.format.align(),
            winston.format.timestamp(TIMESTAMP_FORMAT),
            PRINTF_FORMATTER,
            winston.format.metadata(),
        );
    }

    isDebugEnabled(): boolean {
        return this.winstonLogger.levels[this.winstonLogger.level] >= this.winstonLogger.levels['debug'];
    }

    info(message: string): void {
        this.winstonLogger.info(message);
    }

    debug(message: string): void {
        this.winstonLogger.debug(message);
    }

    error(message: string): void {
        this.winstonLogger.error(message);
    }

    warn(message: string): void {
        this.winstonLogger.warn(message);
    }

    close(): void {
        this.winstonLogger.close();
    }

    public static splitGeneratedLogs(): void {
        const resolvedSourceDirectory = path.resolve(LoanProTestAutomationLogger.dirpath);
        if (!fs.existsSync(resolvedSourceDirectory)) {
            throw new Error(`Log directory does not exist: ${resolvedSourceDirectory}`);
        }
        const logFiles = LoanProTestAutomationLogger.findLogFiles(resolvedSourceDirectory);
        for (const logFile of logFiles) {
            const content = fs.readFileSync(logFile, 'utf8');
            for (const executionContent of LoanProTestAutomationLogger.splitIntoExecutionBlocks(content)) {
                if (!LoanProTestAutomationLogger.isCompleteExecutionBlock(executionContent)) {
                    continue;
                }
                const loanproTag = LoanProTestAutomationLogger.extractLoanproTag(executionContent);
                const timestamp = LoanProTestAutomationLogger.extractTimestampFromFileName(path.basename(logFile));
                const outputFileName = `${loanproTag}-test-automation-${Environment.APPLICATION_ENVIRONMENT}-${timestamp}.log`;
                const outputFilePath = path.join(path.dirname(logFile), outputFileName);
                fs.writeFileSync(outputFilePath, executionContent, 'utf8');
            }
        }
    }

    private static findLogFiles(directoryPath: string): string[] {
        const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
        const logFiles: string[] = [];
        for (const entry of entries) {
            const entryPath = path.join(directoryPath, entry.name);
            if (entry.isDirectory()) {
                logFiles.push(...LoanProTestAutomationLogger.findLogFiles(entryPath));
                continue;
            }
            if (entry.isFile() && LoanProTestAutomationLogger.isSourceLogFile(entry.name)) {
                logFiles.push(entryPath);
            }
        }
        return logFiles.sort((left, right) => left.localeCompare(right));
    }

    private static isSourceLogFile(fileName: string): boolean {
        return /^TEMP-test-automation-.*\.log$/i.test(fileName);
    }

    private static splitIntoExecutionBlocks(content: string): string[] {
        const lines = content.split(/\r?\n/);
        const blocks: string[] = [];
        const currentBlock: string[] = [];
        let insideExecution = false;
        for (const line of lines) {
            const marker = LoanProTestAutomationLogger.getBoundaryMarker(line);
            if (marker === '*') {
                if (insideExecution) {
                    currentBlock.push('#'.repeat(Environment.LOG_LINE_LENGTH));
                    const blockContent = currentBlock.join('\n').trim();
                    if (LoanProTestAutomationLogger.isMeaningfulExecutionBlock(blockContent)) {
                        blocks.push(blockContent);
                    }
                    currentBlock.length = 0;
                }
                currentBlock.push('*'.repeat(Environment.LOG_LINE_LENGTH));
                insideExecution = true;
                continue;
            }
            if (marker === '#') {
                if (insideExecution) {
                    currentBlock.push('#'.repeat(Environment.LOG_LINE_LENGTH));
                    const blockContent = currentBlock.join('\n').trim();
                    if (LoanProTestAutomationLogger.isMeaningfulExecutionBlock(blockContent)) {
                        blocks.push(blockContent);
                    }
                    currentBlock.length = 0;
                    insideExecution = false;
                }
                continue;
            }
            if (insideExecution) {
                currentBlock.push(line);
            }
        }
        return blocks;
    }

    private static getBoundaryMarker(line: string): '*' | '#' | undefined {
        const normalizedLine = line.replace(/\u001b\[[0-9;]*m/g, EMPTY).trim();
        const markerMatch = normalizedLine.match(new RegExp(
            `^(?:.*?)(\\*{${Environment.LOG_LINE_LENGTH}}|#{${Environment.LOG_LINE_LENGTH}})(?:.*)?$`
        ));
        return markerMatch ? markerMatch[1].startsWith('*') ? '*' : '#' : undefined;
    }

    private static extractLoanproTag(content: string): string {
        const match = content.match(/@LOANPRO-[A-Za-z0-9._-]+/i) ?? content.match(/LOANPRO-[A-Za-z0-9._-]+/i);
        return match ? match[0].replace(/^@/, EMPTY) : EMPTY;
    }

    private static isMeaningfulExecutionBlock(content: string): boolean {
        const nonMarkerLines = content
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .filter((line) => line !== '*'.repeat(100))
            .filter((line) => line !== '#'.repeat(100));
        return nonMarkerLines.length > 0;
    }

    private static isCompleteExecutionBlock(content: string): boolean {
        const trimmedContent = content.trim();
        if (!trimmedContent) {
            return false;
        }
        const lines = trimmedContent.split(/\r?\n/).map((line) => line.trim());
        const hasStartMarker = lines.some((line) => LoanProTestAutomationLogger.getBoundaryMarker(line) === '*');
        const hasEndMarker = lines.some((line) => LoanProTestAutomationLogger.getBoundaryMarker(line) === '#');
        return hasStartMarker && hasEndMarker && LoanProTestAutomationLogger.isMeaningfulExecutionBlock(trimmedContent);
    }

    private static extractTimestampFromFileName(fileName: string): string {
        const match = fileName.match(/(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})/);
        return match ? match[1] : EMPTY;
    }

    static async removeTempFiles(): Promise<void> {
        await LoanProTestAutomationLogger.removeTempFilesFromDirectory(path.resolve(LOG_FOLDER));
    }

    private static async removeTempFilesFromDirectory(directoryPath: string): Promise<void> {
        const entries = await fs.promises.readdir(directoryPath, { withFileTypes: true });
        for (const entry of entries) {
            const entryPath = path.join(directoryPath, entry.name);
            if (entry.isDirectory()) {
                await LoanProTestAutomationLogger.removeTempFilesFromDirectory(entryPath);
                continue;
            }
            if (entry.isFile() && /^TEMP/i.test(entry.name) && !/^LOANPRO/i.test(entry.name)) {
                await fs.promises.unlink(entryPath);
            }
        }
    }
}