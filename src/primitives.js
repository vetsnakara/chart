import { CIRCLE_RADIUS } from "./constants"

export function drawLine(
    ctx,
    coords,
    { color = "#ff0000", lineWidth = 4 } = {}
) {
    ctx.beginPath()

    ctx.lineWidth = lineWidth
    ctx.strokeStyle = color

    for (const [x, y] of coords) {
        ctx.lineTo(x, y)
    }

    ctx.stroke()
    ctx.closePath()
}

export function drawCircle(ctx, [x, y], { color }) {
    ctx.beginPath()
    ctx.arc(x, y, CIRCLE_RADIUS, 0, Math.PI * 2)
    ctx.strokeStyle = color
    ctx.fillStyle = "#fff"
    ctx.lineWidth = 4
    ctx.stroke()
    ctx.fill()
    ctx.closePath()
}
