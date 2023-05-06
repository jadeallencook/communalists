import locations from '@objects/locations';

export const Address = ({ street, location, zipcode }) => (
    <>
        <div>{street}</div>
        <div>{`${locations[location]}, CA ${zipcode}`}</div>
    </>
);
