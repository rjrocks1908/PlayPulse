import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deleteVideo,
  getAllVideo,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
  updateVideoThumbnail,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/").get(getAllVideo);
router.route("/").post(
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  publishAVideo
);
router
  .route("/:videoId")
  .get(getVideoById)
  .patch(updateVideo)
  .delete(deleteVideo);

router
  .route("/update-thumbnail/:videoId")
  .patch(upload.single("thumbnail"), updateVideoThumbnail);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
