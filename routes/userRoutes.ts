import express from "express";
const router = express.Router();
import {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
} from "../controllers/usersController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

router.use(verifyJWT); // applies to all routes inside this file

router
  .route("/")
  .get(getAllUsers)
  .post(createNewUser)
  .patch(updateUser)
  .delete(deleteUser);

export default router;
