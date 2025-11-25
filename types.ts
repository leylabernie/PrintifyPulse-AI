export interface DesignStyle {
  id: string;
  name: string;
  description: string;
  elements: string;
}

export interface Trend {
  title: string;
  description: string;
  sourceUrl?: string;
  style?: DesignStyle;
}

export interface ListingData {
  title: string;
  description: string;
  tags: string[];
}

export interface GeneratedImage {
  url: string;
  base64: string; // Keeping base64 for re-use in other API calls
  prompt: string;
}

export interface ProjectState {
  currentStep: number;
  selectedTrend: Trend | null;
  designImage: GeneratedImage | null;
  listingData: ListingData | null;
  mockups: GeneratedImage[];
  videoUrl: string | null;
  isPublished: boolean;
}

export enum AspectRatio {
  SQUARE = "1:1",
  PORTRAIT_2_3 = "2:3",
  LANDSCAPE_3_2 = "3:2",
  PORTRAIT_3_4 = "3:4",
  LANDSCAPE_4_3 = "4:3",
  PORTRAIT_9_16 = "9:16",
  LANDSCAPE_16_9 = "16:9",
  LANDSCAPE_21_9 = "21:9"
}

export enum ImageResolution {
  RES_1K = "1K",
  RES_2K = "2K",
  RES_4K = "4K"
}