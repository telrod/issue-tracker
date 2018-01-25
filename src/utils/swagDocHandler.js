import path from 'path';
import swagger from 'swagger-jsdoc';

export default async function (req, res) {
  // swagger definition comes here
  const swaggerDefinition = {
    info: {
      title: 'Issue tracker API doc',
      version: '1.0.0',
      description: 'REST API documentation for Issue Tracker',
    }
  };
  const options = {
    swaggerDefinition,
    apis: [path.resolve('src/routes/**/*.js'), path.resolve('src/models/**/*.js')],
  };

  const swaggerSpec = swagger(options);
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
}
