import cloudinary
import cloudinary.uploader
import os
from io import BytesIO

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

async def upload_to_cloudinary(file_content: bytes, filename: str) -> str:
    """
    Upload image to Cloudinary and return the public URL.
    """
    try:
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            file_content,
            folder="biggieback",
            resource_type="image"
        )
        
        return upload_result.get("secure_url") or upload_result.get("url")
    except Exception as e:
        raise Exception(f"Cloudinary upload failed: {str(e)}")

