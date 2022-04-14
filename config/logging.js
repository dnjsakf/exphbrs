import winstonDaily from "winston-daily-rotate-file";
import winston, { format } from "winston";

const customFormat = format.printf((info)=>(
    `[${info.timestamp}][${info.level}] - ${info.message}`
));

const logger = winston.createLogger({
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        customFormat,
    ),
    transports: [
        new winston.transports.Console(),
        new winstonDaily({
            level: 'info',
            datePattern: 'YYYYMMDD',
            dirname: './../logs',
            filename: `appName_%DATE%.log`,
            maxSize: null,
            maxFiles: 14
        }),
    ],
});

const stream = {
    write(message){
      logger.info(message)
    }
}

export { logger, stream };