export class ImageRepository {
    async uploadStagedFile(stagedFile: File | Blob) {
        const form = new FormData();
        form.set("file", stagedFile);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: form,
        });

        const data = await res.json();
        const imageUrl = data.imgUrl;
        console.log(imageUrl);
        return imageUrl;
    }
}
