import mysql from "mysql2/promise";
import Crypt from "./crypt";
import _ from "lodash";

require("dotenv").config({path: ".env.real"});

class DataBase {
    static {
        this.pool = mysql.createPool({
            host: process.env.DB_MARIA_HOST||"localhost",
            port: parseInt(process.env.DB_MARIA_PORT||3306),
            user: process.env.DB_MARIA_USERNAME||"username",
            password: Crypt.decrypt(process.env.DB_MARIA_PASSWORD, process.env.SECRET_KEY)||"password",
            database: process.env.DB_MARIA_DATABASE,
            namedPlaceholders: true,
        });
    }

    static objectToCamelCase(obj){
        return _.mapKeys(obj, (v, k) => _.camelCase(k));
    }

    static async select(sql, args){
        try {
            const conn = await this.pool.getConnection(async conn => conn);
            try {
                const [ rows ] = await conn.query(sql, args);
                await conn.release();
                return rows.map(this.objectToCamelCase);
            } catch (error){
                await conn.release();
                throw error;
            }
        } catch ( error ){
            throw error;
        }
    }

    static async selectOne(sql, args){
        try {
            const conn = await this.pool.getConnection(async conn => conn);
            try {
                sql += " LIMIT 1 ";
                const [ rows ] = await conn.query(sql, args);
                await conn.release();
                return ( rows.length > 0 ? rows.map(this.objectToCamelCase)[0] : null );
            } catch (error){
                await conn.release();
                throw error;
            }
        } catch ( error ){
            throw error;
        }
    }

    static async execute(sql, args){
        try {
            const conn = await this.pool.getConnection(async conn => conn);
            try {
                await conn.beginTransaction();
                const [ res ] = await conn.execute(sql, args);
                await conn.commit();
                await conn.release();
                return res.affectedRows;
            } catch ( error ){
                await conn.rollback(()=>{});
                await conn.release();
                throw error;
            }
        } catch ( error ){
            throw error;
        }
    }
};

export default DataBase;