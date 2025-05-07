import { createLogger, transports, format } from "winston";

const logger = createLogger({
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ timestamp, level, message }) => {
            return `${timestamp} ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: "logs/error.log", level: "error" }),
        new transports.File({ 
            filename: "logs/info.log", 
            level: "info",
            format: format.combine(
                format((info) => (info.level === "info" ? info : false))(),
                format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} ${level.toUpperCase()}: ${message}`;
                })
            )
        }),
        new transports.File({ 
            filename: "logs/request.log", 
            level: "http",
            format: format.combine(
                format((info) => (info.level === "http" ? info : false))(),
                format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} ${level.toUpperCase()}: ${message}`;
                })
            )
        })
    ]
});

export default logger;