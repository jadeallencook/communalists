const formatRequests = (requests: {
    [key: string]: any;
}): { id: string; [key: string]: any }[] =>
    Object.keys(requests).map((key) => ({
        id: key,
        ...requests[key],
    }));

export default formatRequests;
