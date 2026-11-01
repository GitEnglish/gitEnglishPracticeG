export function shuffleArray<T>(array: T[]): T[] {
    const newArr = [...array];
    const randomBuffer = new Uint32Array(1);
    for (let i = newArr.length - 1; i > 0; i--) {
        crypto.getRandomValues(randomBuffer);
        const randomFraction = randomBuffer[0] / 4294967296;
        const j = Math.floor(randomFraction * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}
