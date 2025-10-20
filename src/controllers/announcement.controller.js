import Announcement from "../models/announcement.model.js";
import * as factory from "../utils/handlerFactory.js";

export const getAnnouncement = factory.getOne(Announcement);
export const getAllAnnouncements = factory.getAll(Announcement);
export const createAnnouncement = factory.createOne(Announcement);
export const updateAnnouncement = factory.updateOne(Announcement);
export const deleteAnnouncement = factory.deleteOne(Announcement);
export const deleteAnnouncements = factory.deleteMany(Announcement);
