export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Calculates geodesic distance between two points in kilometers using the Haversine formula.
 */
export function calculateDistanceKm(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export interface GeofenceResult {
  isCovered: boolean;
  distanceKm: number;
  maxRadiusKm: number;
  message?: string;
}

/**
 * Validates if the customer's coordinates fall within the fulfilling branch's delivery perimeter.
 */
export function validateDeliveryCoverage(
  branch: {
    name: string;
    latitude: number;
    longitude: number;
    deliveryRadiusKm: number;
  },
  customerLocation: Coordinates
): GeofenceResult {
  const distanceKm = calculateDistanceKm(
    { lat: branch.latitude, lng: branch.longitude },
    customerLocation
  );

  const isCovered = distanceKm <= branch.deliveryRadiusKm;

  return {
    isCovered,
    distanceKm,
    maxRadiusKm: branch.deliveryRadiusKm,
    message: !isCovered
      ? `Tu dirección está a ${distanceKm.toFixed(
          1
        )} km y excede nuestra zona de cobertura habitual para ${
          branch.name
        } (máximo ${
          branch.deliveryRadiusKm
        } km). Puedes ordenar en modalidad 'Para Llevar' (Pickup) o contactarnos por WhatsApp.`
      : undefined,
  };
}
