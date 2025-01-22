import router from "express";
import configApi from "./api/configApi.js";
import usersApi from "./api/usersApi.js";
import spacesApi from "./api/spacesApi.js";
import categoriesApi from "./api/categoriesApi.js";

const apiRouter = router();
export default apiRouter;

apiRouter.use("/config", configApi);
apiRouter.use("/users", usersApi);
apiRouter.use("/spaces", spacesApi);
apiRouter.use("/categories", categoriesApi);
