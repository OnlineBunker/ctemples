export interface Festival {
  name: string;
  timing: string; // e.g. "March/April (Chaitra month)"
  description: string;
}

export interface CostEstimate {
  fromCity: string; // a major hub city
  distanceKm: number;
  travelTime: string; // e.g. "7-8 hrs by road, 1 hr by air"
  budget: string; // e.g. "₹4,000 - ₹6,000 per person"
  midRange: string; // e.g. "₹7,000 - ₹11,000 per person"
  luxury: string; // e.g. "₹15,000+ per person"
}

export interface NearbyAttraction {
  name: string;
  distanceKm: number;
  description: string;
}

export type Region = "North" | "South" | "East" | "West" | "Northeast" | "Central";

export interface Temple {
  id: string; // url slug
  name: string;
  state: string;
  city: string;
  region: Region;
  religion: string;
  deity: string;
  tagline: string;
  heroImage: string;
  gallery: string[];
  videoUrl: string; // "" placeholder - real videos added later
  coordinates: { lat: number; lng: number };
  overview: string;
  history: string; // long-form, \n\n-separated paragraphs
  legendsAndMythology: string;
  architecture: string;
  spiritualSignificance: string;
  quickFacts: {
    built: string;
    dynasty: string;
    architecturalStyle: string;
    presidingDeity: string;
  };
  timings: { opening: string; closing: string; notes?: string };
  entryFee: { indian: string; foreign?: string; cameraOrPhoneFee?: string };
  bestTimeToVisit: {
    idealMonths: string;
    idealTimeOfDay: string;
    festivals: Festival[];
  };
  howToReach: { byAir: string; byTrain: string; byRoad: string };
  costEstimates: CostEstimate[]; // 3-4 entries, static ranges (not a live calculator)
  nearbyAttractions: NearbyAttraction[];
  tags: string[];
  rating: number;
  featured: boolean;
}
