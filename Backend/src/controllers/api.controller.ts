import { Router } from "express"
import userController from "./user/user.controller";
import universityController from "./university/university.controller";
import eventsController from "./events/events.controller";
import forumController from "./forum/forum.controller";
import groupController from "./university/group.controller";
import campusController from "./campus/campus.controller";
import connectController from "./connect/connect.controller";
import seoController from "./seo.controller";
const apiController = Router();

apiController.use("/user/", userController)
apiController.use("/university/", universityController)
apiController.use("/campuses/", campusController)
apiController.use("/events/", eventsController)
apiController.use("/connect/", connectController)
apiController.use("/forums/", forumController)
apiController.use("/groups/", groupController)
apiController.use("/seo/", seoController)

export default apiController;

