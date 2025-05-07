import bcrypt from 'bcrypt';

async function hashPassword(password : string): Promise<string> {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
}

function checkPassword(password : string) : string {
    if (password.length < 12) {
        return 'Password must be at least 12 characters long';
    }
    const checks = [
        /[a-z]/,
        /[A-Z]/,
        /[0-9]/,
        /[@.#$!%*?&]/
    ];

    const checkNames = [
        'lowercase letter',
        'uppercase letter',
        'number',
        'special character'
    ];

    for (let i = 0; i < checks.length; i++) {
        if (!checks[i].test(password)) {
            return `Password must contain at least one ${checkNames[i]}`;
        }
    }
    return "";
}

export default {
    hashPassword,
    checkPassword
};