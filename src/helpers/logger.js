const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, prettyPrint } = format;

//importing dot env
require("dotenv/config");

const errorFileName = `error${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}.log`;

const logger = createLogger({
  level: "info",
  format: combine(timestamp(), prettyPrint()),
  defaultMeta: { service: "user-service" },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new transports.File({ filename: `logs/${errorFileName}`, level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.simple(),
    })
  );
}

module.exports = logger;
