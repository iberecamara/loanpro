export class LoanProTestAutomationException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'LoanProTestAutomationException';
    }
}