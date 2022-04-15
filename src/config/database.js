// import mysql from "promise-mysql";
// import crypto from "./crypt";

const mysql = require("promise-mysql");
const CryptAES = require("./crypt");
require("dotenv").config({
    path: ".env.real"
});

const poolPromise = mysql.createPool({
    host: process.env.DB_MARIA_HOST||"localhost",
    port: parseInt(process.env.DB_MARIA_PORT||3306),
    user: process.env.DB_MARIA_USERNAME||"username",
    password: CryptAES.decrypt(process.env.DB_MARIA_PASSWORD, process.env.SECRET_KEY)||"password",
    database: "dochi"
});

const pool = {
    query: async (query, args) => {
        let result = null;
        let conn = null;
        const awaitPool = await poolPromise;
        try {
            conn = await awaitPool.getConnection();
            result = await conn.query(query);
        } catch ( error ){
            await conn.rollback(()=>{});
            console.error("error", error);
        } finally {
            console.log("finally", awaitPool);
            await conn.release();
            await awaitPool.release();
        }
        return result;
    },
};

const selectUserAll = async ()=>{
    const query = `
    SELECT T1.USER_ID
         , T1.USER_NM
         , T1.USER_GENDER
      FROM CM_USER T1
     WHERE 1=1
    `;
    const result = (await pool).query(query);
    return result;
}
console.log( 'result', selectUserAll().then((result)=>{
    console.log( result );
}));


/*

class UserDAO {
    constructor(){
        this._TABLE_NAME = "CM_USER";
    }
    async selectAll(){
        const query = `
            SELECT T1.USER_ID
                 , T1.USER_NM
                 , T1.USER_GENDER
              FROM ${this._TABLE_NAME} T1
             WHERE 1=1
        `;
        const result = await pool.query(query);

        return result ? statusUtil.success(result) : statusUtil.false();
    }
    async insert({ userId, userName, userGender }){
        const values = [ userId, userName, userGender ];
        const query = `
            INSERT INTO ${TABLENAME} (
                USER_ID, USER_NM, USER_GENDER
            ) VALUES (
                ?, ?, ?
            )
        `;
        const result = await pool.query(query, values);

        return result ? statusUtil.success(result) : statusUtil.false();
    }
}

class User extends UserDAO {
    userId;
    userNm;
    userGender;

    constructor(){
        super();
    }

    async addUser({ userId, userName }){
        const result = await this.insert(userId, userName);
        return result.code === StatusCode.OK ? true : false;
    }
}

const user = new User();

console.log( user.selectAll() );

*/