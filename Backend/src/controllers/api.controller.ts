import { Router } from "express"
import userController from "./user/user.controller";
import universityController from "./university/university.controller";
import eventsController from "./events/events.controller";
import forumController from "./forum/forum.controller";
import groupController from "./university/group.controller";
import seoController from "./seo.controller";
const apiController = Router();

apiController.use("/user/",userController)
apiController.use("/university/", universityController)
apiController.use("/events/", eventsController)
apiController.use("/forums/", forumController)
apiController.use("/groups/", groupController)
apiController.use("/seo/", seoController)


export default apiController;
