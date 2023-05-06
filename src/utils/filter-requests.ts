import { FiltersInterface } from '@interfaces/filters';
import RequestAidInterface from '@interfaces/request-aid';

const filterRequests = (
    requests: { [key: string]: RequestAidInterface },
    filters: FiltersInterface
) =>
    Object.entries(requests).reduce((object, [id, request]) => {
        const { stage, location, language, driver, coordinator } = filters;
        return stage !== request.stage ||
            (location && location !== request.location) ||
            (language && language !== request.language) ||
            (driver && driver !== request.driver) ||
            (coordinator && coordinator !== request.coordinator)
            ? object
            : {
                  ...object,
                  [id]: request,
              };
    }, {});

export default filterRequests;
