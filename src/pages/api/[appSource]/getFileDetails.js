import { apiAllowCors, prisma } from "services";
import { exceptionHandler } from "utils/exceptionHandler";

/**
 * Handler de manipulação dos detalhes do arquivo.
 * @method handler
 * @memberof module:getFileDetails
 * @param {Object} req HTTP request.
 * @param {Object} res HTTP response.
 * @returns {Object} HTTP response como JSON contendo a resposta da query consultada.
 */
const handler = async (req, res) => {
  switch (req.method) {
    case "GET":
      try {
        const response = await getFileDetails(req, res);
        return response;
      } catch (e) {
        return exceptionHandler(e, res);
      }
    default:
      return exceptionHandler(null, res);
  }
};

export default apiAllowCors(handler);

/**
 * Recebe a requisição do arquivo a ser baixado, acessa o BD para trazer
 * o arquivo com suas referências e retorna as propriedades do arquivo solicitado.
 * @method getFileDetails
 * @memberof module:getFileDetails
 * @param {Object} req HTTP Request
 * @param {Object} res HTTP Response
 * @param {String} fileId ID do arquivo a ser enviado
 * @param {String} referenceObjId ID de referência do objeto a ser enviado
 * @param {String} appSource nome da aplicação de origem da transferência de arquivo
 * @returns {Object} Detalhamento das informações do arquivo
 */
const getFileDetails = async (req, res) => {
  try {
    const { fileId, referenceObjId } = req.query;

    // RETORNA ERRO NA AUSÊNCIA DE PARÂMETROS
    if (!fileId && !referenceObjId)
      return res.status(400).json({
        status: 400,
        message: "fileId or referenceObjId is required!",
      });

    // CONSULTA DADOS DE REFERÊNCIA DO ARQUIVO
    const fileDetails = await prisma.files.findFirst({
      where: {
        id: fileId,
        referenceObjId: referenceObjId,
      },
    });

    // RETORNA ERRO CASO O ARQUIVO NÃO SEJA ENCONTRADO NO BD
    if (!fileDetails)
      return res.status(400).json({ status: 400, message: "file not found!" });

    return res.status(200).json({ fileDetails });
  } catch (e) {
    return exceptionHandler(e, res);
  }
};

export { getFileDetails };
