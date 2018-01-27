import log from 'loglevel';
import config from 'config';

log.setLevel(config.logLevel);

export default log;
