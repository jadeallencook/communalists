export const Time = ({ start, end }) => (
    <>
        {start.hour}:{start.minute === 0 ? '00' : start.minute}
        {start.period} till {end.hour}:{end.minute === 0 ? '00' : end.minute}
        {end.period}
    </>
);
