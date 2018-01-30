import mongoose from 'mongoose';
import log from 'log';
import config from '../config';

const {host, database, user, password} = config.mongodb;
let status = 'DISCONNETED';

const init = () => {
  if (status === 'DISCONNETED') {
    let mongoUrl = `mongodb://${host}/${database}`;
    if (user && password) {
      mongoUrl = `mongodb://${user}:${password}@${host}:27017/${database}?authSource=admin`;
    }
    const options = {
      useMongoClient: true,
      autoIndex: false, // Don't build indexes
      reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
      reconnectInterval: 500, // Reconnect every 500ms
      poolSize: 10, // Maintain up to 10 socket connections
      // If not connected, return errors immediately rather than waiting for reconnect
      bufferMaxEntries: 0
    };
    mongoose.connect(mongoUrl, options);
    status = 'CONNECTING';
    const db = mongoose.connection;
    return new Promise((resolve, reject) => {
      db.on('error', err => {
        status = 'DISCONNETED';
        log.error(err);
        reject(err);
      });
      db.once('open', () => {
        status = 'CONNECTED';
        log.info('Database connected');
        resolve();
      });
    });
  }
};

export default {init};
