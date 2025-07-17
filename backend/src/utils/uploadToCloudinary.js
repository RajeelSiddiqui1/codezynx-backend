import cloudinary from "../lib/cloudaniry.js";

export async function uploadToCloudinary(req) {
  const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    resource_type: "auto"
    // Removed: categorization and auto_tagging (not free)
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    tags: [], // No auto tags from Google, leave empty
  };
}
