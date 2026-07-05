export class ArraysUtils {

    public static getRandomElements<T>(array: T[], options?: { amount?: number }): T[] {
        const amount = options?.amount ?? 1;

        if (array.length === 0) {
            throw new Error("Array cannot be empty");
        }

        if (amount > array.length) {
            throw new Error("Amount cannot be greater than the array length");
        }

        const elements: T[] = [];
        const usedIndices = new Set<number>();

        while (elements.length < amount) {
            const randomIndex = Math.floor(Math.random() * array.length);
            if (!usedIndices.has(randomIndex)) {
                usedIndices.add(randomIndex);
                elements.push(array[randomIndex]);
            }
        }

        return elements;
    }

    public static getRandomElement<T>(array: T[]): T {
        return ArraysUtils.getRandomElements(array)[0];
    }

}
