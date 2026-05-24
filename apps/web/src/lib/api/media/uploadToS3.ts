export async function uploadToS3(
  file: File,
  presignedUrl: string
): Promise<boolean> {
  try {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!response.ok) {
      console.error('Upload failed:', response.statusText);
      return false;
    }

    console.log('Upload successful');
    return true;
  } catch (error) {
    console.error('Upload error:', error);
    return false;
  }
}
