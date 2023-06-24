import { apiAllowCors, prisma } from "services";
import fs from "fs";
import { exceptionHandler } from "utils/exceptionHandler";

/**
 * Handler de manipulação de download de arquivo.
 * @method handler
 * @memberof module:downloadFile
 * @param {Object} req HTTP request.
 * @param {Object} res HTTP response.
 * @returns {Object} HTTP response como JSON contendo a resposta da query consultada.
 */
const handler = async (req, res) => {
  switch (req.method) {
    case "GET":
      try {
        const response = await getFile(req, res);
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
 * o arquivo com suas referências e o retorna.
 * 
 * Exemplo: http://localhost:3000/api/Teste/downloadFile?fileId='2rdr454t365'&referenceObjId='3354f45'
 * 
 * @method getFile
 * @memberof module:downloadFile
 * @param {Object} req HTTP Request
 * @param {Object} res HTTP Response 
 * @param {String} fileId ID do arquivo a ser enviado
 * @param {String} referenceObjId ID de referência do objeto a ser enviado
 * @returns {File} Arquivo solicitado
 */
const getFile = async (req, res) => {
  try {
    const { fileId, referenceObjId } = req.query;

    // RETORNA ERRO NA AUSÊNCIA DE PARÂMETROS
    if (!fileId && !referenceObjId)
      return res.status(400).json({
        status: 400,
        message: "fileId or referenceObjId is required!",
      });

      // REQUISIÇÃO AO BANCO DE DADOS
    const fileDetails = await prisma.files.findFirst({
      where: {
        id: fileId,
        referenceObjId: referenceObjId,
      },
    });

    // RETORNA MENSAGEM CASO ARQUIVO ESTEJA AUSENTE
    if (!fileDetails)
      return res.status(400).json({ status: 400, message: "file not found!" });

    // LÊ O ARQUIVO
    const file = await fs.promises.readFile(fileDetails.path);
    res.setHeader("filename", encodeURI(fileDetails.name));
    res.setHeader("file-content-type", fileDetails.contentType);

    return res.status(200).send(file);
  } catch (e) {
    return exceptionHandler(e, res);
  }
};

