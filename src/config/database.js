import mysql from "mysql2/promise";
import CryptAES from "./crypt";

require("dotenv").config({
    path: ".env.real"
});

class DB {
    static {
        this.pool = mysql.createPool({
            host: process.env.DB_MARIA_HOST||"localhost",
            port: parseInt(process.env.DB_MARIA_PORT||3306),
            user: process.env.DB_MARIA_USERNAME||"username",
            password: CryptAES.decrypt(process.env.DB_MARIA_PASSWORD, process.env.SECRET_KEY)||"password",
            database: process.env.DB_MARIA_DATABASE,
            namedPlaceholders: true,
        });
    }

    static async select(sql, args){
        let result = null;
        try {
            const conn = await this.pool.getConnection(async conn => conn);
            try {
                result = await conn.execute(sql, args);
                await conn.release();
            } catch (error){
                await conn.release();
                throw error;
            }
        } catch ( error ){
            throw error;
        }
        return result;
    }

    static async execute(sql, args){
        let result = null;
        try {
            const conn = await this.pool.getConnection(async conn => conn);
            try {
                await conn.beginTransaction();
                result = await conn.execute(sql, args);
                await conn.commit();
                await conn.release();
            } catch ( error ){
                await conn.rollback(()=>{});
                await conn.release();
                throw error;
            }
        } catch ( error ){
            throw error;
        }
        return result;
    }
};

class User {
    constructor(){
        this.TABLE_NAME = "CM_USER";
        this.COLUMNS = {
            userId: null,
            userNm: null,
            userGender: null,
            regDttm: new Date(),
            regUserId: "system",
        }
    }

    async select(params=this.COLUMNS){
        return await DB.select(`
            SELECT T1.USER_ID
                 , T1.USER_NM
                 , T1.USER_GENDER
              FROM ${ this.TABLE_NAME } T1
             WHERE 1=1
               ${ params.userId ? "AND T1.USER_ID = :userId" : "" }
               ${ params.userNm ? "AND T1.USER_NAME LIKE CONCAT('%', :userNm, '%')" : "" }
        `, params);
    }

    async insert(params=this.COLUMNS){
        return await DB.execute(`
            INSERT INTO ${ this.TABLE_NAME } (
                USER_ID
                , USER_NM
                , USER_GENDER
            ) VALUES (
                :userId
                , :userNm
                , ${ params.userGender ? ":userGender" : "null" }
            )
        `, params);
    }

    async update(params=this.COLUMNS){
        return await DB.execute(`
            UPDATE ${ this.TABLE_NAME }
               SET USER_NM = ${ params.userNm ? ":userNm" : "null" }
                 , USER_GENDER = ${ params.userGender ? ":userGender" : "null" }
             WHERE 1=1
               AND USER_ID = :userId
        `, params);
    }

    async delete(params=this.COLUMNS){
        return await DB.execute(`
            DELETE FROM ${ this.TABLE_NAME }
             WHERE 1=1
               ${ params.userId ? "AND USER_ID = :userId" : "" }
        `, params);
    }
}

const user = new User();

async function main(){
    const [ users ] = await user.select();
    console.log("users", users);

    const [ deleted1 ] = await user.delete();
    console.log("deleted", deleted1.affectedRows);

    const [ added ] = await user.insert({
        userId: "admin",
        userNm: "admin"
    });
    console.log("added", added.affectedRows);

    const [ selected ] = await user.select("admin");
    console.log("selected", selected);

    const [ updated ] = await user.update({
        userId: "admin",
        userNm: "tester"
    });
    console.log("updated", updated.affectedRows);

    const [ selected2 ] = await user.select("admin");
    console.log("selected", selected2);

    const [ deleted ] = await user.delete();
    console.log("deleted", deleted.affectedRows);

    DB.pool.end();
}

main();