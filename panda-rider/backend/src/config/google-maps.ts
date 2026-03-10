import { Client, TravelMode, UnitSystem } from '@googlemaps/google-maps-services-js';

export const googleMapsClient = new Client({});

export const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

// Helper to get distance and duration between two points
export async function getDistanceMatrix(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<{ distance: number; duration: number }> {
  try {
    const response = await googleMapsClient.distancematrix({
      params: {
        origins: [`${origin.lat},${origin.lng}`],
        destinations: [`${destination.lat},${destination.lng}`],
        mode: TravelMode.driving,
        units: UnitSystem.metric,
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    const element = response.data.rows[0]?.elements[0];

    if (element?.status === 'OK') {
      return {
        distance: element.distance.value / 1000, // Convert to km
        duration: element.duration.value / 60, // Convert to minutes
      };
    }

    throw new Error('Unable to calculate distance');
  } catch (error) {
    console.error('Google Maps Distance Matrix error:', error);
    throw error;
  }
}

// Helper to geocode an address
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number; formattedAddress: string }> {
  try {
    const response = await googleMapsClient.geocode({
      params: {
        address,
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    const result = response.data.results[0];

    if (result) {
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
      };
    }

    throw new Error('Address not found');
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

// Helper to reverse geocode coordinates
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await googleMapsClient.reverseGeocode({
      params: {
        latlng: { lat, lng },
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    return response.data.results[0]?.formatted_address || 'Unknown location';
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
}

// Helper to get directions between points
export async function getDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<{ polyline: string; distance: number; duration: number; steps: any[] }> {
  try {
    const response = await googleMapsClient.directions({
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        mode: TravelMode.driving,
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    const route = response.data.routes[0];
    const leg = route?.legs[0];

    if (route && leg) {
      return {
        polyline: route.overview_polyline.points,
        distance: leg.distance.value / 1000,
        duration: leg.duration.value / 60,
        steps: leg.steps.map((step) => ({
          instruction: step.html_instructions,
          distance: step.distance.text,
          duration: step.duration.text,
        })),
      };
    }

    throw new Error('Unable to get directions');
  } catch (error) {
    console.error('Directions error:', error);
    throw error;
  }
}
