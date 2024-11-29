import router from "express";
import configApi from "./configApi.js";

const apiRouter = router();
export default apiRouter;

apiRouter.use("/config", configApi);
