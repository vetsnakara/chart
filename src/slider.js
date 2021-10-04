import config from "./config"
import getUtils from "./utils"

const {
    PADDING,
    HEIGHT,
    DPI_HEIGHT,
    VIEW_HEIGHT,
    VIEW_WIDTH,
    WIDTH,
    DPI_WIDTH,
} = config.get("sliderChart")

const { drawLine, drawCircle, computeBoundaries, css, xAxis, yAxis, toCoords } =
    getUtils("sliderChart")

export function sliderChart(root, data) {
    const canvas = root.querySelector("canvas")
    const ctx = canvas.getContext("2d")

    paint()

    return {}

    // Functions
    // ........................

    function paint() {
        const [yMin, yMax] = computeBoundaries(data)

        const yRatio = VIEW_HEIGHT / yMax
        const xRatio = VIEW_WIDTH / (data.columns[0].length - 2)

        css(canvas, {
            height: `${HEIGHT}px`,
            width: `${WIDTH}px`,
        })

        canvas.height = DPI_HEIGHT
        canvas.width = DPI_WIDTH

        // draw x axis
        const xData = data.columns.filter(
            (col) => data.types[col[0]] !== "line"
        )[0]

        // draw data
        const yData = data.columns.filter(
            (col) => data.types[col[0]] === "line"
        )

        const coords = yData.map(toCoords(xRatio, yRatio))

        coords.forEach((coords, idx) => {
            const color = data.colors[yData[idx][0]]
            drawLine(ctx, coords, { color })
        })
    }
}
