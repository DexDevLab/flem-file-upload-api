import { apiAllowCors, prisma } from "services";
import fs from "fs";
import getFileDetails from "./getFileDetails";
import { exceptionHandler } from "utils/exceptionHandler";

/**
 * Handler de manipulação dos dados de indexação de arquivo.
 * @method handler
 * @memberof module:indexFile
 * @param {Object} req HTTP request.
 * @param {Object} res HTTP response.
 * @returns {Object} HTTP response como JSON contendo a resposta da query consultada.
 */
const handler = async (req, res) => {
  switch (req.method) {
    case "PATCH":
      try {
        const response = await indexFile(req, res);
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
 * Realiza a indexação do arquivo.
 * Ao realizar um upload, o arquivo possui um Objeto de Referência padrão ou nulo.
 * Esse método atualiza no BD as informações de referenceObjId com o referenceObjId gerado
 * ao realizar o upload, cria um diretório dentro do servidor de armazenamento com o nome apropriado,
 * e atualiza essas informações no BD.
 * @method indexFile
 * @memberof module:indexFile
 * @param {Object} req HTTP Request
 * @param {Object} res HTTP Response
 * @param {String} fileId ID do arquivo a ser enviado
 * @param {String} referenceObjId ID de referência do objeto a ser enviado
 * @returns {Object} Detalhes do arquivo com as informações atualizadas
 */
const indexFile = async (req, res) => {
  try {
    const { fileId } = req.query;
    const { referenceObj } = req.body;

    // // RETORNA ERRO NA AUSÊNCIA DE PARÂMETROS
    // if (!fileId && !referenceObjId)
    //   return res.status(400).json({
    //     status: 400,
    //     message: "fileId or referenceObjId is required!",
    //   });

    // // CONSULTA DADOS DE REFERÊNCIA DO ARQUIVO
    // const getFileDetails = await prisma.files.findFirst({
    //   where: {
    //     id: fileId,
    //   },
    // });

    // if (!getFileDetails)
    //   return res.status(400).json({ status: 400, message: "file not found!" });

    const fileDetails = getFileDetails(req, res);

    const oldPath = fileDetails.path;

    const destPath = fileDetails.path
      .replace(fileDetails.referenceObjId, referenceObj.id)
      .replace(fileDetails.name, "");

    const newPath = fileDetails.path.replace(
      fileDetails.referenceObjId,
      referenceObj.id
    );

    if (!fs.existsSync(destPath)) {
      await fs.promises.mkdir(destPath, { recursive: true });
    }

    const moveFile = await fs.promises.rename(oldPath, newPath);

    const updateFileDetails = await prisma.files.update({
      data: {
        referenceObjId: referenceObj.id,
        path: newPath,
      },
      where: {
        id: fileId,
      },
    });
    
    return res.status(200).json(updateFileDetails);
  } catch (e) {
    return exceptionHandler(e, res);
  }
};
