import VolunteerApplicationInterface from '@interfaces/volunteer-application';

const organizeApplicationsByDate = (requests: {
    [key: string]: VolunteerApplicationInterface;
}): [string, VolunteerApplicationInterface][] =>
    Object.entries(requests).sort(
        ([, { timestamp: timestamp1 }], [, { timestamp: timestamp2 }]) => {
            return timestamp1.seconds - timestamp2.seconds;
        }
    );

export default organizeApplicationsByDate;
