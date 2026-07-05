import { EMPTY, NEWLINE } from "@data/constants/constants";
import { expect as base, MatcherReturnType } from "@playwright/test";


export const expect = base.extend({
    async toBeAnEmail(received: string, expected: string): Promise<MatcherReturnType> {
        const assertionName = "toBeAnEmail";
        let pass = received.startsWith(expected);
        if (this.isNot) {
            pass = !pass;
        }
        const matcherLine = this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot });
        const expectedLine = `Expected: Value should ${this.isNot ? 'not ' : EMPTY}be a valid email`;
        const receivedLine = `Received: ${this.utils.printReceived(received)}`;
        const returnMessage = () => `${matcherLine}${NEWLINE.repeat(2)}${expectedLine}${NEWLINE}${receivedLine}`;
        return {
            message: returnMessage,
            pass: pass,
            name: assertionName,
            expected: expected,
            actual: received
        }
    }
});