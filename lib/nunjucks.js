'use strict';
import nunjucks from 'nunjucks';

const isProduction = process.env.NODE_ENV === 'production';

export default (app) => {
  // Nunjucks configuration
  nunjucks.configure('views', {
    autoescape: true,
    noCache: isProduction ? false : true,
    express: app,
  });
};
