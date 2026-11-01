🔒 Replace insecure Math.random() with crypto.getRandomValues() in array shuffle

🎯 **What:**
The `shuffleArray` function in `src/components/exercises/utils.ts` was using the `Math.random()` function to randomly swap elements. This has been updated to use the `crypto.getRandomValues()` Web API.

⚠️ **Risk:**
`Math.random()` is not a cryptographically secure pseudo-random number generator (CSPRNG). Its implementation varies by browser but relies on algorithms (like xorshift128+) that are predictable. If an attacker can observe enough outputs from `Math.random()`, they could potentially predict future values or deduce the seed. In the context of an educational application, this could allow a user to predictably guess the shuffled order of exercise answers or items. While usually lower risk in simple quizzes, it's a poor security practice to rely on it for randomness.

🛡️ **Solution:**
The fix replaces `Math.random()` with `crypto.getRandomValues()`.
- A single `Uint32Array(1)` buffer is allocated once outside the shuffle loop to avoid unnecessary memory allocations.
- Inside the loop, `crypto.getRandomValues()` populates the buffer with a secure 32-bit unsigned integer.
- This integer is divided by `4294967296` ($2^{32}$) to calculate a `randomFraction` in the range `[0, 1)`, exactly mimicking the behavior and output scale of `Math.random()`.
- The existing Fisher-Yates shuffle logic is preserved, ensuring no functionality regressions while making the shuffling cryptographically secure.
