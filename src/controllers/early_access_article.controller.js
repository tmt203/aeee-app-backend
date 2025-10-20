import EarlyAccessArticle from "../models/early_access_article.model.js";
import * as factory from "../utils/handlerFactory.js";

export const getEarlyAccessArticle = factory.getOne(EarlyAccessArticle);
export const getAllEarlyAccessArticles = factory.getAll(EarlyAccessArticle);
export const createEarlyAccessArticle = factory.createOne(EarlyAccessArticle);
export const updateEarlyAccessArticle = factory.updateOne(EarlyAccessArticle);
export const deleteEarlyAccessArticle = factory.deleteOne(EarlyAccessArticle);
export const deleteEarlyAccessArticles = factory.deleteMany(EarlyAccessArticle);
