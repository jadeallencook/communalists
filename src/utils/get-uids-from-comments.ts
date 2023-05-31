import CommentInterface from '@interfaces/comment';

const getUIDsFromComments = (comments: CommentInterface[]): string[] => {
    const uids: string[] = Object.entries(comments).map(([, { user }]) => user);
    return Array.from(new Set(uids));
};

export default getUIDsFromComments;
