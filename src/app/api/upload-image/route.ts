import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_NAME,
    api_key: process.env.NEXT_PUBLIC_API_KEY,
    api_secret: process.env.NEXT_PUBLIC_SECRET_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("image") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No image provided" },
                { status: 400 },
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        folder: "posts",
                        public_id: `post_${Date.now()}`,
                    },
                    (error: any, result: any) => {
                        if (error) return reject(error);
                        resolve(result);
                    },
                )
                .end(buffer);
        });

        return NextResponse.json({
            imageUrl: (uploadResult as any).secure_url,
        });
    } catch (error) {
        console.error("Error uploading image:", error);
        return NextResponse.json(
            { error: "Failed to upload image" },
            { status: 500 },
        );
    }
}
