'use strict';

const config = require('config');
const log = require('javascript-log')(module);
const escapeHtml = require('escape-html');

function* renderError(error) {
  /*jshint -W040 */
  this.statusCode = error.status;

  var preferredType = this.accepts('html', 'json');

  if (preferredType == 'json') {
    this.body = error;
  } else {
    // todo: remake this.render into new jade renderer which looks up the template correctly
    this.render("error", {error: error});
  }
}

function* renderDevError(error) {
  /*jshint -W040 */

  var preferredType = this.accepts('html', 'json');

  if (preferredType == 'json') {
    this.body = error;
  } else {
    var stack = (error.stack || '')
      .split('\n').slice(1)
      .map(function(v){ return '<li>' + escapeHtml(v).replace(/  /g, ' &nbsp;') + '</li>'; }).join('');

    this.type = 'text/html; charset=utf-8';
    this.body = "<html><body><h1>" + error.message + "</h1><ul>"+stack+ "</ul></body></html>";
  }

}

module.exports = function(app) {

  app.use(function*(next) {
    try {
      yield next;
    } catch (err) {

      if (err.status) {
        // user-level error
        yield renderError.call(this, err);
      } else {

        // if error is "call stack too long", then log.error(err) is not verbose
        // so I cast it to string
        log.error(err.toString());

        this.set('X-Content-Type-Options', 'nosniff');

        if (process.env.NODE_ENV == 'development') {
          yield renderDevError.call(this, err);
        } else {
          yield renderError.call(this, {status: 500, message: "Internal Error"});
        }
      }
    }

  });

  // this middleware handles error BEFORE ^^^
  // rewrite mongoose wrong mongoose parameter -> 400 (not 500)
  app.use(function* rewriteCastError(next) {

    try {
      yield next;
    } catch (err) {

      if (err.name == 'CastError') {
        // malformed or absent mongoose params
        if (process.env.NODE_ENV != 'development') {
          this.throw(400);
        }
      }

      throw err;
    }

  });

  /* TODO: rewrite this express-style error handling in koa
   @see https://github.com/koajs/koa/wiki/Error-Handling

   this.use(function(req, res, next) {
   next(404);
   });

   this.use(function(err, req, res, next) {
   if (typeof err == 'number') {
   err = new HttpError(err);
   }

   if (err.name == 'CastError') {
   // malformed or absent mongoose params
   if (process.env.NODE_ENV == 'development') {
   log.error(err);
   }
   res.sendHttpError(new HttpError(400));
   return;
   }

   if (err instanceof HttpError) {
   res.sendHttpError(err);
   } else {
   // if error is "call stack too long", then log.error(err) is not verbose
   // so I cast it to string
   log.error(err.toString());
   я
   if (process.env.NODE_ENV == 'development') {
   errorhandler()(err, req, res, next);
   } else {
   res.sendHttpError(new HttpError(500));
   }
   }
   });
   */
};
