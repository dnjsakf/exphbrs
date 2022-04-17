import CryptoJS from "crypto-js";
import DB from "./../config/database";

class UserModel {
    constructor(){
        this.TABLE_NAME = "CM_USER";
        this.COLUMNS = {
            userId: null,
            userPwd: null,
            userSalt: null,
            userNm: null,
            userGender: null,
            regUserId: null,
            regDttm: null,
            updUserId: null,
            updDttm: null,
        };
    }

    validPassword(password, hash, salt) {
        const _salt = CryptoJS.enc.Hex.parse(salt);
        const hashKey = CryptoJS.PBKDF2(password, _salt, {
            keySize: 32,
            iterations: 1000,
            hasher:  CryptoJS.algo.SHA256.create()
        }).toString(CryptoJS.enc.Hex);

        return ( hash === hashKey );
    }

    genPassword(password) {
        const salt = CryptoJS.lib.WordArray.random(32);
        const hashKey = CryptoJS.PBKDF2(password, salt, {
            keySize: 32,
            iterations: 1000,
            hasher:  CryptoJS.algo.SHA256.create()
        });
        return [
            hashKey.toString(CryptoJS.enc.Hex),
            salt.toString(CryptoJS.enc.Hex)
        ];
    }

    async getAll(params=this.COLUMNS){
        return await DB.select(`
            SELECT T1.USER_ID
                 , T1.USER_NM
                 , T1.USER_GENDER
                 , T1.REG_USER_ID
                 , T1.REG_DTTM
                 , T1.UPD_USER_ID
                 , T1.UPD_DTTM
              FROM ${ this.TABLE_NAME } T1
             WHERE 1=1
               ${ params.userNm ? "AND T1.USER_NM LIKE CONCAT('%', :userNm, '%')" : "" }
               ${ params.userGender ? "AND T1.USER_GENDER = :userGender" : "" }
        `, params);
    }

    async get(params=this.COLUMNS){
        return await DB.selectOne(`
            SELECT T1.USER_ID
                 , T1.USER_PWD
                 , T1.USER_SALT
                 , T1.USER_NM
                 , T1.USER_GENDER
                 , T1.REG_USER_ID
                 , T1.REG_DTTM
                 , T1.UPD_USER_ID
                 , T1.UPD_DTTM
              FROM ${ this.TABLE_NAME } T1
             WHERE 1=1
               AND T1.USER_ID = :userId
        `, params);
    }

    async insert(params=this.COLUMNS){
        return await DB.execute(`
            INSERT INTO ${ this.TABLE_NAME } (
                USER_ID
                , USER_PWD
                , USER_SALT
                , USER_NM
                , USER_GENDER
                , REG_USER_ID
                , REG_DTTM
            ) VALUES (
                :userId
                , :userPwd
                , :userSalt
                , :userNm
                , ${ params.userGender ? ":userGender" : "null" }
                , 'system'
                , now()
            )
        `, params);
    }

    async update(params=this.COLUMNS){
        return await DB.execute(`
            UPDATE ${ this.TABLE_NAME }
               SET USER_NM = ${ params.userNm ? ":userNm" : "null" }
                 , USER_GENDER = ${ params.userGender ? ":userGender" : "null" }
                 , UPD_USER_ID = 'system'
                 , UPD_DTTM = now()
             WHERE 1=1
               AND USER_ID = :userId
        `, params);
    }

    async updatePassword(params=this.COLUMNS){
        const _params = Object.assign({}, params);
        const [ hash, salt ] = this.genPassword(_params.userPwd);
        _params.userPwd = hash;
        _params.userSalt = salt;

        return await DB.execute(`
            UPDATE ${ this.TABLE_NAME }
               SET USER_PWD = :userPwd
                 , USER_SALT = :userSalt
                 , UPD_USER_ID = 'system'
                 , UPD_DTTM = now()
             WHERE 1=1
               AND USER_ID = :userId
        `, _params);
    }

    async delete(params=this.COLUMNS){
        return await DB.execute(`
            DELETE FROM ${ this.TABLE_NAME }
             WHERE 1=1
               AND ${ params.userId ? "USER_ID = :userId" : "1=0"}
        `, params);
    }

    async save(params=this.COLUMNS){
        const _params = Object.assign({}, params);
        const retval = {
            updated: 0,
            inserted: 0,
            user: null
        };

        const user = await this.get(_params);
        if( user ){
            Object.assign(user, _params);
            retval.updated = await this.update(user);
            retval.user = user;
        } else {
            const [ hash, salt ] = this.genPassword(_params.userPwd);
            _params.userPwd = hash;
            _params.userSalt = salt;
            retval.inserted = await this.insert(_params);
            retval.user = _params;
        }

        delete retval.user.userPwd;
        delete retval.user.userSalt;

        return retval;
    }
}

export default UserModel;