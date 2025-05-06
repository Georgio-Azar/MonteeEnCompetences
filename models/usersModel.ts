import bcrypt from 'bcrypt';

async function hashPassword(password : string): Promise<string> {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
}

export default {
    hashPassword
};