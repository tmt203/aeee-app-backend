import Page from "../models/page.model.js";
import catchAsync from "../utils/catchAsync.js";
import * as factory from "../utils/handlerFactory.js";

export const updatePageBySlug = catchAsync(async (req, res, next) => {
    const { slug, content } = req.body;

    const page = await Page.findOneAndUpdate({ slug }, { content }, { new: true, runValidators: true });

    if (!page) {
        return next(new AppError("No page found with that slug", 404));
    }

    res.status(200).json({
        code: "OK",
        data: page,
    });
});

export const getPage = factory.getOne(Page);
export const getAllPages = factory.getAll(Page);
export const createPage = factory.createOne(Page);
export const updatePage = factory.updateOne(Page);
export const deletePage = factory.deleteOne(Page);
export const deletePages = factory.deleteMany(Page);
