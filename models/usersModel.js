import bcrypt from 'bcrypt';

async function hashPassword(password) {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
}

export default {
    hashPassword
};