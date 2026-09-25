"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

export async function submitCertificate(formData: FormData) {
  try {
    const file = formData.get("file") as File | null;
    const genId = formData.get("genId") as string;
    const firstName = formData.get("firstName") as string;
    const middleName = formData.get("middleName") as string;
    const familyName = formData.get("familyName") as string;
    const month = formData.get("month") as string;
    const day = formData.get("day") as string;
    const year = formData.get("year") as string;
    const type = formData.get("type") as string;

    if (!genId || !firstName || !familyName || !type) {
      throw new Error("Missing required fields");
    }

    let imageUrl = null;

    // 1. Upload to Cloudflare R2 if a file is provided
    if (file && file.size > 0) {
      const accountId = process.env.R2_ACCOUNT_ID;
      const accessKeyId = process.env.R2_ACCESS_KEY_ID;
      const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
      const publicUrl = process.env.R2_PUBLIC_URL;

      if (!accountId || !accessKeyId || !secretAccessKey || !publicUrl) {
        throw new Error("Cloudflare R2 credentials are not configured in environment variables.");
      }

      const s3 = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      // Create a unique filename
      const fileExtension = file.name.split('.').pop() || 'png';
      const fileName = `${genId}-${Date.now()}.${fileExtension}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: "certificates",
          Key: fileName,
          Body: fileBuffer,
          ContentType: file.type,
        })
      );

      // Construct the public URL (assumes bucket is public and R2_PUBLIC_URL is set without trailing slash)
      imageUrl = `${publicUrl.replace(/\/$/, '')}/${fileName}`;
    }

    // 2. Insert into Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials are not configured in environment variables.");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase
      .from("certificates") // Assumes you have a 'certificates' table
      .insert([
        {
          gen_id: genId,
          first_name: firstName,
          middle_name: middleName,
          family_name: familyName,
          month,
          day,
          year,
          type,
          image_url: imageUrl,
        }
      ]);

    if (dbError) {
      console.error("Supabase Error:", dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    return { success: true, message: "Certificate uploaded successfully!" };
  } catch (error: any) {
    console.error("Action Error:", error);
    return { success: false, error: error.message };
  }
}
