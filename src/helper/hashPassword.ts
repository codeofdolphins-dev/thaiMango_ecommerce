import bcrypt from "bcryptjs";

const SALT = Number(process.env.BCRYPT_SALT) || 12;

export async function hashPassword(password: string): Promise<string> {
    if (!password) throw new Error("password must not be empty");

    return await bcrypt.hash(password, SALT);
}

export async function verifyPassword(hashPassword: string, password: string): Promise<boolean> {
    return await bcrypt.compare(password, hashPassword);
}