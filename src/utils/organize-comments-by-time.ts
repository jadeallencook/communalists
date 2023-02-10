import RequestCommentInterface from '@interfaces/request-comment';

const organizeCommentsByTime = (comments: {
    [key: string]: RequestCommentInterface;
}): [string, RequestCommentInterface][] =>
    Object.entries(comments).sort(
        ([, { timestamp: timestamp1 }], [, { timestamp: timestamp2 }]) => {
            return timestamp2.seconds - timestamp1.seconds;
        }
    );

export default organizeCommentsByTime;
