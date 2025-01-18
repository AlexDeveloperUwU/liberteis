import router from "express";
import configApi from "./configApi.js";
import usersApi from "./usersApi.js";
import spacesApi from "./spacesApi.js";
import categoriesApi from "./categoriesApi.js";

const apiRouter = router();
export default apiRouter;

apiRouter.use("/config", configApi);
apiRouter.use("/users", usersApi);
apiRouter.use("/spaces", spacesApi);
apiRouter.use("/categories", categoriesApi);
