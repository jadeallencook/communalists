import RequestCommentInterface from '@interfaces/request-comment';

const getUIDsFromComments = (comments: {
    [key: string]: RequestCommentInterface;
}): string[] => {
    const uids: string[] = Object.entries(comments).map(([, { uid }]) => uid);
    return Array.from(new Set(uids));
};

export default getUIDsFromComments;
