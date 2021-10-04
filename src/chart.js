import config from "./config"
import { colors } from "./colors"

import getUtils from "./utils"

import { tooltip } from "./tooltip"
import { sliderChart } from "./slider"

let mouse = null

const {
    HEIGHT,
    WIDTH,
    VIEW_HEIGHT,
    VIEW_WIDTH,
    DPI_HEIGHT,
    DPI_WIDTH,
    PADDING,
} = config.get("mainChart")

const {
    toDate,
    computeBoundaries,
    getCursor,
    toCoords,
    xAxis,
    yAxis,
    css,
    drawLine,
    drawCircle,
} = getUtils("mainChart")

export default function chart(root, data) {
    const canvas = root.querySelector("[data-el='main']")
    const ctx = canvas.getContext("2d")

    const tip = tooltip(root.querySelector("[data-el='tooltip']"))
    const slider = sliderChart(root.querySelector("[data-el='slider']"), data)

    canvas.addEventListener("mousemove", mousemove)
    canvas.addEventListener("mouseleave", mouseleave)

    return {
        init() {
            paint()
        },
        destroy() {
            canvas.removeEventListener(mousemove)
            canvas.removeEventListener(mouseleave)
        },
    }

    // Functions
    // .........................................

    function mouseleave() {
        mouse = null
        paint()
    }

    function mousemove({ clientX, clientY }) {
        const { top, left } = canvas.getBoundingClientRect()

        if (!mouse) mouse = {}

        mouse.x = (clientX - left) * 2
        mouse.y = (clientY - top) * 2

        mouse.tooltip = {
            left: clientX - left,
            top: clientY - top,
        }

        paint()
    }

    function clear() {
        ctx.clearRect(0, 0, 100, 100)
    }

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

        xAxis(ctx, xData, xRatio)
        yAxis(ctx, yMin, yMax)

        // draw data
        const yData = data.columns.filter(
            (col) => data.types[col[0]] === "line"
        )

        const coords = yData.map(toCoords(xRatio, yRatio))
        const cursor = getCursor(coords[0], mouse && mouse.x)

        if (cursor) {
            drawLine(
                ctx,
                [
                    [cursor.x, 0],
                    [cursor.x, DPI_HEIGHT - PADDING],
                ],
                { color: colors.lightGray, lineWidth: 2 }
            )
        }

        // show/hide tip
        if (cursor) {
            tip.show(mouse.tooltip, {
                title: toDate(xData.slice(1)[cursor.index]),
                items: yData.map((col) => ({
                    color: data.colors[col[0]],
                    name: data.names[[col[0]]],
                    value: col.slice(1)[cursor.index],
                })),
            })
        } else {
            tip.hide()
        }

        coords.forEach((coords, idx) => {
            const color = data.colors[yData[idx][0]]
            drawLine(ctx, coords, { color })

            if (cursor) {
                drawCircle(ctx, coords[cursor.index], { color })
            }
        })
    }
}
