export const log: (message: string) => void = (message) =>
    console.log(
        `%c[communalists] ${message}`,
        `
            background-color: #bc3737;
            color: #fff;
            padding: 2px 5px;
            border-radius: 3px;
            margin: 5px 0;
        `
    );
