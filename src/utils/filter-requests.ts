import { FiltersInterface } from '@interfaces/filters';
import RequestAidInterface from '@interfaces/request-aid';

const filterRequests = (
    requests: { [key: string]: RequestAidInterface },
    filters: FiltersInterface
) => {
    return Object.entries(requests).reduce((object, [id, request]) => {
        const { stage, location, language, driver, coordinator } = filters;
        const searchQuery = filters.searchQuery?.toLowerCase().trim();
        return stage !== request.stage ||
            (location && location !== request.location) ||
            (language && language !== request.language) ||
            (driver && driver !== request.driver) ||
            (searchQuery &&
                request.name.toLowerCase().trim().indexOf(searchQuery) === -1 &&
                request.email.toLowerCase().trim().indexOf(searchQuery) ===
                    -1) ||
            (coordinator && coordinator !== request.coordinator)
            ? object
            : {
                  ...object,
                  [id]: request,
              };
    }, {});
};

export default filterRequests;
