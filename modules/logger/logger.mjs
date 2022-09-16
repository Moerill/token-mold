export class Logger {
    static MODULE_ID = null;

    static LOG_LEVEL = {
        Debug: 0,
        Log: 1,
        Info: 2,
        Warn: 3,
        Error: 4
    }

    static log(force, logLevel, ...args) {
        const shouldLog = force || game.modules.get('_dev-mode')?.api?.getPackageDebugValue(Logger.MODULE_ID);

        if (shouldLog) {
            switch (logLevel) {
                case Logger.LOG_LEVEL.Error:
                    console.error(Logger.MODULE_ID, '|', ...args);
                    break;
                case Logger.LOG_LEVEL.Warn:
                    console.warn(Logger.MODULE_ID, '|', ...args);
                    break;
                case Logger.LOG_LEVEL.Info:
                    console.info(Logger.MODULE_ID, '|', ...args);
                    break;
                case Logger.LOG_LEVEL.Debug:
                default:
                    console.debug(Logger.MODULE_ID, '|', ...args);
                    break;
            }
        }
    }

    static error(force, ...args) {
        Logger.log(force, Logger.LOG_LEVEL.Error, ...args);
    }

    static warn(force, ...args) {
        Logger.log(force, Logger.LOG_LEVEL.Warn, ...args);
    }

    static info(force, ...args) {
        Logger.log(force, Logger.LOG_LEVEL.Info, ...args);
    }

    static debug(force, ...args) {
        Logger.log(force, Logger.LOG_LEVEL.Debug, ...args);
    }

    static notify(message) {
        ui.notifications.notify(message);
    }
}