import { colorArray, initialColorArray } from "../const/colors"
export const getNextColor = () => {
    const newColor = colorArray.values().next().value
    colorArray.delete(newColor)
    return newColor
}

export const addToColorArray = (color: string) => {
    colorArray.add(color)
    // We return a string for now so we can simplify code down to a ternary in files
    return ''
}

export const resetColorArray = () => {
    colorArray.clear()
    initialColorArray.forEach((color) => {
        colorArray.add(color)
    })
}