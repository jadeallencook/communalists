import { AnyFiltersInterface } from '@interfaces/filters';

const filterDocuments = (
    requests: { [key: string]: Object },
    filters: AnyFiltersInterface
) =>
    Object.entries(requests).reduce((object, [id, request]) => {
        for (let key of Object.keys(filters)) {
            const filter = filters[key];
            if (filter && request[key] !== filter) {
                return object;
            }
        }
        return { ...object, [id]: request };
    }, {});

export default filterDocuments;
