import CryptoJS from "crypto-js";

class Crypt {
    static secretKey;
    static {
        this.secretKey = process.env.SECRET_KEY||"yourscretkey";
    }
    static encrypt(decrypted, secretKey){
        return CryptoJS.AES.encrypt(decrypted, secretKey||this.secretKey).toString();
    }
    static encryptJSON(decrypted, secretKey){
        return this.encrypt(JSON.stringify(decrypted, secretKey));
    }
    static decrypt(encrypted, secretKey){
        return CryptoJS.AES.decrypt(encrypted, secretKey||this.secretKey).toString(CryptoJS.enc.Utf8);
    }
    static decryptJSON(encrypted, secretKey){
        return JSON.parse(this.decrypt(encrypted, secretKey));
    }
}

if( process.argv.length > 3 && process.argv[3] ){
    const _cryptType = process.argv[2];
    const _cryptData = process.argv[3];
    const _cryptKey = process.argv[4];
    switch(_cryptType){
        case "encrypt":
            console.log(_cryptData, "->", CryptAES.encrypt(_cryptData, _cryptKey));
            break;
        case "decrypt":
            console.log(_cryptData, "->", CryptAES.decrypt(_cryptData, _cryptKey));
            break;
    }
}

module.exports = Crypt;