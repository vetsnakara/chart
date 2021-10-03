import {
    DPI_HEIGHT,
    DPI_WIDTH,
    VIEW_HEIGHT,
    PADDING,
    ROWS_COUNT,
    CIRCLE_RADIUS,
} from "./constants"

import { colors } from "./colors"

export function toDate(timestamp) {
    const shortMonths = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ]
    const shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const date = new Date(timestamp)

    return `${shortMonths[date.getMonth()]} ${date.getDate()}`
}

export function computeBoundaries({ columns, types }) {
    const lineColumns = columns.filter(
        ([type, ...values]) => types[type] === "line"
    )

    const minValues = lineColumns.map((col) =>
        Math.min.apply(null, col.slice(1))
    )

    const maxValues = lineColumns.map((col) =>
        Math.max.apply(null, col.slice(1))
    )

    const min = Math.min.apply(null, minValues)
    const max = Math.max.apply(null, maxValues)

    return [min, max]
}

export function getCursor(coords, xMouse) {
    if (!xMouse) return null

    const idxRight = coords
        .map(([x, y]) => xMouse - x)
        .findIndex((diff) => diff < 0)

    const idxLeft = idxRight > 0 ? idxRight - 1 : 0

    const xValueLeft = coords[idxLeft][0]
    const xValueRight = coords[idxRight][0]

    const yValueLeft = coords[idxLeft][1]
    const yValueRight = coords[idxRight][1]

    const diffXLeft = Math.abs(xMouse - xValueLeft)
    const diffXRight = Math.abs(xMouse - xValueRight)

    const index = diffXLeft < diffXRight ? idxLeft : idxRight

    return {
        index,
        x: coords[index][0],
    }
}

export function toCoords(xRatio, yRatio) {
    return (col) => {
        const name = col[0]

        return col
            .slice(1)
            .map((y, i) => [
                Math.floor(i * xRatio),
                Math.floor(DPI_HEIGHT - PADDING - y * yRatio),
            ])
    }
}

export function xAxis(ctx, data, xRatio) {
    const colsCount = 6
    const step = Math.round(data.length / colsCount)

    ctx.strokeStyle = colors.lightGray
    ctx.font = "normal 20px Helvetica, sans-serif"
    ctx.fillStyle = colors.gray

    for (let i = 1; i < data.length; i += step) {
        const text = toDate(data[i])
        const x = i * xRatio
        ctx.fillText(text, x, DPI_HEIGHT - 10)
    }
    ctx.closePath()
}

export function yAxis(ctx, yMin, yMax) {
    const step = VIEW_HEIGHT / ROWS_COUNT
    const textStep = (yMax - yMin) / ROWS_COUNT

    ctx.beginPath()
    ctx.strokeStyle = colors.lightGray
    ctx.font = "normal 20px Helvetica, sans-serif"
    ctx.fillStyle = colors.gray
    for (let i = 1; i <= ROWS_COUNT; i++) {
        const y = step * i
        const text = Math.round(yMax - textStep * i)
        ctx.fillText(text, 5, y + PADDING - 10)
        ctx.moveTo(0, y + PADDING)
        ctx.lineTo(DPI_WIDTH, y + PADDING)
    }
    ctx.stroke()
    ctx.closePath()
}

export function css(el, styles = {}) {
    Object.assign(el.style, styles)
}
