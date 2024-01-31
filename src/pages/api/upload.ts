// pages/api/upload.js
import multer from "multer";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface NextApiRequestWithFiles extends NextApiRequest {
  files: Express.Multer.File[];
}

const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads",
    filename: (req, file, cb) =>
      cb(null, Buffer.from(file.originalname, "latin1").toString("utf8")), // this will help as to save the files with their original names.
  }),
});

const handler = async (req: NextApiRequestWithFiles, res: NextApiResponse) => {
  try {
    // Use 'array' instead of 'single' if you want to handle multiple files
    upload.array("file")(req as any, res as any, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const files = req.files;
      console.log("files : ", files);
      if (files.length === 0) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Process the file as needed
      // For example, save it to the database, upload to a cloud storage, etc.

      return res.status(200).json({ message: "File uploaded successfully" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default handler;
