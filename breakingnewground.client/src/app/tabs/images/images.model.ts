export interface ImageMetadata {
  id: string;
  originalFileName: string;
  contentType: string;
  isFavorite: boolean;
  width: number;
  height: number;
  sizeBytes: number;
  uploadedAt: string;
  tags: string[];
}

export interface UploadResult {
  id: string;
  wasDuplicate: boolean;
  addedTags: string[];
}

export interface Tag {
  id: number;
  name: string;
  imageCount: number;
}
