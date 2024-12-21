import router from "express";
import configApi from "./configApi.js";
import usersApi from "./usersApi.js";

const apiRouter = router();
export default apiRouter;

apiRouter.use("/config", configApi);
apiRouter.use("/users", usersApi);
