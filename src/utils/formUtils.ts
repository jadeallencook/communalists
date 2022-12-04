import locationMap from '@objects/location-map';
import { USStateType } from '@custom-types/us-state';

export const getLocationKeysAndValuesByState = (state: USStateType) => 
    Object.entries(locationMap[state]).map(([key, value]) => {return {key, value} as {key: string, value: string}})