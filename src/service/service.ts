import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import dotenv from 'dotenv';
dotenv.config();

const credentials = defaultProvider();

export const AWS = new S3Client({
  region: 'us-east-1',
  credentials: credentials,
});

export async function deleteFromS3(url: string) {
  const urlParts = new URL(url);
  const bucket = urlParts.hostname.split('.')[0];
  let key = urlParts.pathname.substring(1);
  key = decodeURIComponent(key);
  const params = {
    Bucket: bucket,
    Key: key,
  };

  await AWS.send(new DeleteObjectCommand(params));
}
