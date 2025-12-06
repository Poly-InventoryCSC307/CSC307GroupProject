import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import {
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

// S3 Client Model
const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/file-url/:key  ->  { url: "https://signed-..." }
router.get("/file-url", async (req, res) => {
  try {
    const bucket = process.env.S3_BUCKET_NAME; // "polyproducts"
    const key = req.query.key;

    if (!key) {
      return res.status(400).json({ error: "Missing 'key' query param" });
    }

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour

    res.json({ url });
  } catch (err) {
    console.error("Error getting signed URL:", err);
    res.status(500).json({ error: "Could not generate signed URL" });
  }
});

router.get("/files", async (req, res) => {
  try {
    const bucket = process.env.S3_BUCKET_NAME;
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: "uploads/", // only list things in uploads/ "folder"
    });

    const response = await s3.send(command);

    const files =
      response.Contents?.map((obj) => {
        const key = obj.Key;

        // build URL (might be private; good for testing/structure)
        const url = `https://${bucket}.s3.amazonaws.com/${key}`;
        return {
          key,
          size: obj.Size,
          lastModified: obj.LastModified,
          url,
        };
      }) ?? [];

    res.json({ files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list files" });
  }
});

router.delete("/file/:key", async (req, res) => {
  try {
    const bucket = process.env.S3_BUCKET_NAME;
    const key = decodeURIComponent(req.params.key);
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await s3.send(command);

    res.json({ message: "Deleted", key });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Delete failed", details: err.message });
  }
});

router.post("/upload/:storeId", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    const storeId = req.params.storeId;
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const bucket = process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    console.log("Using bucket:", bucket, "region:", region);
    // simple unique key: /timestamp-file
    const key = `${storeId}/uploads/${Date.now()}-${file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3.send(command);
    let url;
    if (region === "us-west-1") {
      url = `https://${bucket}.s3.amazonaws.com/${key}`;
    }

    res.json({
      message: "Uploaded",
      key,
      url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
