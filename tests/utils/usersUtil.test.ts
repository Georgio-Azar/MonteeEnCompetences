import usersUtils from "../../utils/usersUtils";

describe("usersUtils", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it ("should return that the password is valid", () => {
        const password = "Mcp@ssw0rd123";
        const result = usersUtils.checkPassword(password);
        expect(result).toBe("");
    })

    it ("should return that the password is too short", () => {
        const password = "Mc@ssw0rd";
        const result = usersUtils.checkPassword(password);
        expect(result).toBe("Password must be at least 12 characters long");
    })

    it ("should return that the password is missing a lowercase letter", () => {
        const password = "MCP@SSW0RD123";
        const result = usersUtils.checkPassword(password);
        expect(result).toBe("Password must contain at least one lowercase letter");
    })

    it ("should return that the password is missing an uppercase letter", () => {
        const password = "mcp@ssw0rd123";
        const result = usersUtils.checkPassword(password);
        expect(result).toBe("Password must contain at least one uppercase letter");
    })

    it ("should return that the password is missing a number", () => {
        const password = "McP@sswordabc";
        const result = usersUtils.checkPassword(password);
        expect(result).toBe("Password must contain at least one number");
    })

    it ("should return that the password is missing a special character", () => {
        const password = "McPssw0rd1234";
        const result = usersUtils.checkPassword(password);
        expect(result).toBe("Password must contain at least one special character");
    })
})