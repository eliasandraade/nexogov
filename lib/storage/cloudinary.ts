import { v2 as cloudinary } from "cloudinary"
import crypto from "crypto"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export { cloudinary }

/**
 * Upload a file buffer to Cloudinary.
 * Files are stored under nexogov/protocols/{protocolId}/ folder.
 */
export async function uploadDocument(
  buffer: Buffer,
  options: {
    protocolId: string
    originalName: string
    mimeType: string
  }
): Promise<{
  publicId: string
  url: string
  storedName: string
  fileHash: string
}> {
  const fileHash = crypto.createHash("sha256").update(buffer).digest("hex")
  const storedName = `${Date.now()}-${options.originalName.replace(/[^a-zA-Z0-9._-]/g, "_")}`
  const folder = `nexogov/protocols/${options.protocolId}`

  const result = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          public_id: storedName,
          resource_type: "raw",
          use_filename: false,
          unique_filename: false,
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      .end(buffer)
  })

  return {
    publicId: result.public_id,
    url: result.secure_url,
    storedName,
    fileHash,
  }
}

/**
 * Delete a document from Cloudinary by public_id.
 */
export async function deleteDocument(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: "raw" })
}
