// encryption.js
const crypto = require('crypto');

const encrypt = (text) => {
    const GCM_IV_LENGTH = 12;
    const GCM_TAG_LENGTH_BYTES = 16;
    const GIVEN_KEY = "QOahfcdo98NLjYJuhP4-VKigx51NkUETsKlIu9uXZFY"; // 32 byte key
    const ALGO = "aes-256-gcm";

    // Initialization vector
    const iv = Buffer.from(crypto.randomBytes(GCM_IV_LENGTH), 'utf8');

    // Key decoding
    let decodedKey = Buffer.from(GIVEN_KEY, 'base64');

    // Initializing the cipher
    const cipher = crypto.createCipheriv(ALGO, decodedKey, iv, { authTagLength: GCM_TAG_LENGTH_BYTES });
    cipher.setAutoPadding(false);

    // Running encryption
    const encrypted = Buffer.concat([cipher.update(text, 'utf8')]);
    cipher.final();

    // Obtaining auth tag
    const tag = cipher.getAuthTag();

    const finalBuffer = Buffer.concat([iv, encrypted, tag]);

    // Converting string to base64
    const finalString = finalBuffer.toString('base64');

    // Making the string URL safe
    const urlSafeString = finalString.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

    return urlSafeString;
};

module.exports = { encrypt };
