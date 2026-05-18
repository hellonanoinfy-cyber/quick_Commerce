const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse';

function pickAddressField(address, keys) {
  if (!address) return null;
  for (const key of keys) {
    if (address[key]) return address[key];
  }
  return null;
}

export async function reverseGeocode(latitude, longitude) {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    format: 'json',
    addressdetails: '1',
    zoom: '14',
  });

  const response = await fetch(`${NOMINATIM_REVERSE}?${params}`, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'en',
    },
  });

  if (!response.ok) {
    throw new Error('Could not resolve your area from coordinates.');
  }

  const data = await response.json();
  const address = data.address || {};

  const pincode =
    pickAddressField(address, ['postcode']) || pickAddressField(address, ['postal_code']) || '';

  const city =
    pickAddressField(address, ['city', 'town', 'village', 'suburb', 'county', 'state_district']) ||
    '';

  const state = pickAddressField(address, ['state']) || '';
  const area =
    pickAddressField(address, ['suburb', 'neighbourhood', 'quarter', 'road']) ||
    city ||
    data.display_name?.split(',')[0] ||
    'Your area';

  return {
    pincode: String(pincode).replace(/\D/g, '').slice(0, 6),
    city,
    state,
    area,
    displayLabel: pincode ? `${area}, ${pincode}` : area || city || 'Your location',
    latitude,
    longitude,
  };
}

export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator?.geolocation) {
      reject(new Error('Geolocation is not supported on this device.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 300000,
      ...options,
    });
  });
}

export async function detectUserLocation() {
  const position = await getCurrentPosition();
  const { latitude, longitude } = position.coords;
  const place = await reverseGeocode(latitude, longitude);
  return { ...place, accuracy: position.coords.accuracy };
}
