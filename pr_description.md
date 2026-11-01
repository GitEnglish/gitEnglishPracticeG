🔒 Fix Unsafe JSON.parse of URL parameters without comprehensive validation

🎯 **What:**
The application was parsing a JSON payload from URL parameters (`payload`), post messages (`PRACTICE_INIT`), and file imports, then immediately accessing properties on the parsed object. The vulnerability occurs because `JSON.parse` can return primitive values (like strings, numbers, or `null`), and attempting to access properties on a primitive wrapper can lead to unexpected unhandled runtime `TypeError` exceptions.

⚠️ **Risk:**
By simply crafting a malicious URL (e.g., `?payload=null` or `?payload="test"`), an attacker could trigger an unhandled exception that stops the application from running properly or crashes specific initialization flows.

🛡️ **Solution:**
The fix wraps the property access logic with strict type checking logic (`if (p && typeof p === 'object' && !Array.isArray(p))`) immediately after invoking `JSON.parse()`. This ensures that the parsed output is actually a non-null plain Javascript object before the application attempts to read properties like `focusVocabulary`, `theme`, or `lac`, preventing the application from crashing.
