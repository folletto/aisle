// Matches:
//   https://drive.google.com/drive/folders/FOLDER_ID
//   https://drive.google.com/drive/u/0/folders/FOLDER_ID
const FOLDER_REGEX =
  /drive\.google\.com\/drive\/(u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/;

export function detectGoogleDriveFolder(url: string): string | null {
  const match = url.match(FOLDER_REGEX);
  return match ? match[2] : null;
}
