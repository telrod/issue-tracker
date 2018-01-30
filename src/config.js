
const env = process.env.NODE_ENV;
const common = {
  port: 3000,
  logLevel: 'trace',
  requireAuth: false // indicates if logged in user required to make api call
};
const config = {
  develop: {
    mongodb: {
      host: '127.0.0.1',
      database: 'issue-tracker'
    },
    uploadPath: 'uploads-dev'
  },
  production: {
    mongodb: {
      host: '127.0.0.1',
      database: 'issue-tracker-production'
    },
    uploadPath: 'uploads'
  },
  test: {
    mongodb: {
      host: '127.0.0.1',
      database: 'issue-tracker-test'
    },
    uploadPath: 'uploads-test'
  }
};
export default Object.assign(common, config[env]);
