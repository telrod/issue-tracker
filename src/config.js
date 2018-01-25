import log from 'log';
const env = process.env.NODE_ENV;
const common = {
  port: 3000
};
const config = {
  develop: {
    mongodb: {
      host: '127.0.0.1',
      database: 'issue-tracker'
    }
  },
  production: {
    mongodb: {
      host: '127.0.0.1',
      database: 'issue-tracker-production'
    }
  },
  test: {
    mongodb: {
      host: '127.0.0.1',
      database: 'issue-tracker-test'
    }
  }
};
log.info("config: " + JSON.stringify(config[env]));
export default Object.assign(common, config[env]);
