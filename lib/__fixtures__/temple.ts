import type { Temple } from "../types";

/** A fully valid Temple, with overrides — for unit tests only (never imported by the app). */
export function makeTemple(overrides: Partial<Temple> = {}): Temple {
  return {
    id: "test-temple",
    name: "Test Temple",
    state: "Tamil Nadu",
    city: "Testpuram",
    region: "South",
    religion: "Hinduism",
    deity: "Shiva",
    tagline: "A temple for tests.",
    whyVisit: "It is a good temple to visit. The setting is memorable. Plan a full morning here.",
    heroImage: "",
    gallery: ["", ""],
    media: [{ kind: "image", url: "https://example.com/test-temple.jpg", alt: "Test Temple" }],
    videoUrl: "",
    coordinates: { lat: 12.97, lng: 79.13 },
    overview: "An overview.",
    history: "Some history.\n\nMore history.",
    legendsAndMythology: "A legend.",
    architecture: "Dravidian.",
    spiritualSignificance: "Significant.",
    quickFacts: {
      built: "11th century CE",
      dynasty: "Chola",
      architecturalStyle: "Dravidian",
      presidingDeity: "Shiva",
    },
    architecturalStyleSlug: "dravidian",
    timings: { opening: "5:00 AM", closing: "9:00 PM" },
    entryFee: { indian: "Free" },
    bestTimeToVisit: {
      idealMonths: "October–March",
      idealTimeOfDay: "Early morning",
      festivals: [{ name: "Test Utsav", timing: "April", description: "A festival." }],
    },
    howToReach: { byAir: "Nearest airport.", byTrain: "Nearest station.", byRoad: "By road." },
    costEstimates: [
      { fromCity: "Chennai", distanceKm: 130, travelTime: "3 hrs", budget: "₹4,000 - ₹6,000 per person", midRange: "₹7,000 - ₹11,000 per person", luxury: "₹15,000+ per person" },
      { fromCity: "Bengaluru", distanceKm: 210, travelTime: "4 hrs", budget: "₹5,000 - ₹7,000 per person", midRange: "₹8,000 - ₹12,000 per person", luxury: "₹18,000+ per person" },
      { fromCity: "Madurai", distanceKm: 450, travelTime: "8 hrs", budget: "₹6,500 - ₹9,000 per person", midRange: "₹10,000 - ₹14,000 per person", luxury: "₹20,000+ per person" },
    ],
    nearbyAttractions: [{ name: "A fort", distanceKm: 5, description: "Nearby." }],
    tags: ["UNESCO World Heritage", "Dravidian"],
    rating: 4.7,
    featured: true,
    ...overrides,
  };
}
