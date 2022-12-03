export const formOptionMapValueByValues = (object: any) => {
    return Object.entries(object).map(([key, value]: [string, string]) => (
        <option key={key} value={value}>{value}</option>
    ))
}

export const formOptionMapValueByKeys = (object: any) => {
    return Object.entries(object).map(([key, value]: [string, string]) => (
        <option key={key} value={key}>{value}</option>
    ))
}