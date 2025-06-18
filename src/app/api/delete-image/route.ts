import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_NAME,
    api_key: process.env.NEXT_PUBLIC_API_KEY,
    api_secret: process.env.NEXT_PUBLIC_SECRET_KEY,
});

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const imageUrl: string | undefined = body.url;

        if (!imageUrl) {
            return NextResponse.json(
                { error: "Missing the image url" },
                { status: 400 },
            );
        }

        const publicId = imageUrl.match(/\/posts\/(.+)\.\w+$/)?.[1];
        if (publicId) {
            await cloudinary.uploader.destroy(`posts/${publicId}`);
        }

        return NextResponse.json(
            { message: "Deleted", url: imageUrl },
            { status: 200 },
        );
    } catch (err) {
        console.error("Error /api/deleteImage:", err);
        return NextResponse.json(
            { error: "Error processing the request" },
            { status: 500 },
        );
    }
}
