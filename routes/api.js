import router from "express";
import bookingsApi from "./api/bookingsApi.js";
import categoriesApi from "./api/categoriesApi.js";
import configApi from "./api/configApi.js";
import eventsApi from "./api/eventsApi.js";
import spacesApi from "./api/spacesApi.js";
import usersApi from "./api/usersApi.js";

const apiRouter = router();
export default apiRouter;

apiRouter.use("/bookings", bookingsApi);
apiRouter.use("/categories", categoriesApi);
apiRouter.use("/config", configApi);
apiRouter.use("/events", eventsApi);
apiRouter.use("/spaces", spacesApi);
apiRouter.use("/users", usersApi);
