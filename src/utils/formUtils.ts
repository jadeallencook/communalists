import locationMap from '@objects/location-map';
import { USStateType } from '@custom-types/us-state';
import { ItemAttributeInterface } from '@interfaces/item';
import { ValidationError } from 'yup';

const getObjectKeysAndValues = (item: Object) =>
    Object.entries(item).map(([key, value]) => { return { key, value } as { key: string, value: any } })

export const getLocationKeysAndValuesByState = (state: USStateType) => getObjectKeysAndValues(locationMap[state])

export const getAttributeKeysAndValuesByItem = (item: ItemAttributeInterface) => getObjectKeysAndValues(item)

export const getAttributeOptionsByAttribute = (item: { [key: string]: string }) => getObjectKeysAndValues(item)

export const convertYupValidationErrorToObj = (errors: ValidationError) => {
    const validationErrors = {}

    errors.inner.forEach((err: any) => {
        if (err.path) validationErrors[err.path] = err.errors[0]
    })

    return validationErrors
}