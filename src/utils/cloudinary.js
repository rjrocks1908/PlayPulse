import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // FileSystem
import url from "url";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // upload the file
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // file has been uploaded successfully
    // remove the locally saved temporary file
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed.
    return null;
  }
};

const deleteFromCloudinary = async (fileUrl) => {
  try {
    const parsedUrl = url.parse(fileUrl);
    const pathSegments = parsedUrl.pathname.split("/");
    const publicIdWithExtension = pathSegments.slice(-1)[0];
    const publicId = publicIdWithExtension.split(".")[0];

    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
