
/**
 * Middleware de validação das requisições HTTP
 * @method runMiddleware
 * @memberof module:services
 * @returns {Promise} uma Promise de retorno da execução.
 */
export const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};
