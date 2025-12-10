// Itinerary data structure types

export interface Activity {
    title: string;
    description: string;
    time?: string;
    address?: string;
    notes?: string;
}

export interface Day {
    dayNumber: number;
    title: string;
    activities: Activity[];
}

export interface Itinerary {
    id: string;
    title: string;
    author: string;
    fromLocation: string;
    toLocation: string;
    startDate: string;
    endDate: string;
    duration: string;
    tripType?: string;
    budget?: string;
    summary: string;
    days: Day[];
    tags?: string[];
    coverImage?: string;
    transport?: string;
    authorName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ItineraryListItem {
    id: string;
    title: string;
    author: string;
    fromLocation: string;
    toLocation: string;
    coverImage?: string;
    duration: string;
    transport?: string;
    tags?: string[];
    createdAt: string;
}
