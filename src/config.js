function mainChart() {
    const DPI_FACTOR = 2

    const ROWS_COUNT = 5
    const PADDING = 40

    const WIDTH = 600
    const HEIGHT = 250

    const DPI_WIDTH = WIDTH * DPI_FACTOR
    const DPI_HEIGHT = HEIGHT * DPI_FACTOR

    const VIEW_HEIGHT = DPI_HEIGHT - PADDING * 2
    const VIEW_WIDTH = DPI_WIDTH

    const CIRCLE_RADIUS = 8

    return {
        ROWS_COUNT,
        PADDING,
        WIDTH,
        DPI_WIDTH,
        VIEW_WIDTH,
        HEIGHT,
        DPI_HEIGHT,
        VIEW_HEIGHT,
        CIRCLE_RADIUS,
    }
}

function sliderChart() {
    const DPI_FACTOR = 2

    const ROWS_COUNT = 1
    const PADDING = 0

    const WIDTH = 600
    const HEIGHT = 60

    const DPI_WIDTH = WIDTH * DPI_FACTOR
    const DPI_HEIGHT = HEIGHT * DPI_FACTOR

    const VIEW_HEIGHT = DPI_HEIGHT - PADDING * 2
    const VIEW_WIDTH = DPI_WIDTH

    const CIRCLE_RADIUS = 8

    const MIN_WINDOW_WIDTH = WIDTH * 0.05

    return {
        ROWS_COUNT,
        PADDING,
        WIDTH,
        DPI_WIDTH,
        VIEW_WIDTH,
        HEIGHT,
        DPI_HEIGHT,
        VIEW_HEIGHT,
        CIRCLE_RADIUS,
        MIN_WINDOW_WIDTH
    }
}

export default {
    get(name) {
        switch (name) {
            case "mainChart":
                return mainChart()
            case "sliderChart":
                return sliderChart()
            default:
                throw new Error("Unknown chart type")
        }
    },
}
