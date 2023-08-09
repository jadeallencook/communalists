import { LOCATIONS } from '@objects/locations';

export const Address = ({ street, location, zipcode }) => (
    <>
        <div>{street}</div>
        <div>{`${LOCATIONS[location]}, CA ${zipcode}`}</div>
    </>
);
