import express from 'express';
import user from './user';
import issue from './issue';
import {ensureLogin} from './privilege';
import {swagDocHandler} from '../utils';
import config from "../config";

const router = new express.Router();

router.get('/', async (req, res) => {
  res.send({msg: 'Welcome to Issue Tracker.'});
});

// return swagger doc json data.
// open [http://swagger.daguchuangyi.com/?url=http://localhost:3000/swagger.json#!]
// to use Swagger UI to visualize the doc
router.get('/swagger.json', swagDocHandler);

if (config.requireAuth) {
  router.use(ensureLogin);
}

router.use('/user', user);
router.use('/issue', issue);

export default router;
