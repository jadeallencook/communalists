import RequestCommentInterface from '@interfaces/comment';

const getUIDsFromComments = (comments: {
    [key: string]: RequestCommentInterface;
}): string[] => {
    const uids: string[] = Object.entries(comments).map(([, { user }]) => user);
    return Array.from(new Set(uids));
};

export default getUIDsFromComments;
