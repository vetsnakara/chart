import "./styles.scss"

const PADDING = 40
const ROWS_COUNT = 5

const WIDTH = 600
const HEIGHT = 200

const DPI_WIDTH = WIDTH * 2
const DPI_HEIGHT = HEIGHT * 2

const VIEW_HEIGHT = DPI_HEIGHT - PADDING * 2
const VIEW_WIDTH = DPI_WIDTH

const CIRCLE_RADIUS = 8

const data = getChartData()

let mouse = null

const colors = {
    gray: "#96a2aa",
    lightGray: "#bbb",
}

let raf

data.columns = data.columns.map((column) => column.slice(0, 30))

console.log(`data`, data)

const chartObj = chart(document.getElementById("chart"), data)
chartObj.init()

function chart(canvas, data) {
    canvas.addEventListener("mousemove", mousemove)
    canvas.addEventListener("mouseleave", mouseleave)

    const ctx = canvas.getContext("2d")

    return {
        init() {
            paint()
        },
        destroy() {
            // cancelAnimationFrame(raf)
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
        // raf = requestAnimationFrame(paint)
        const { top, left } = canvas.getBoundingClientRect()

        if (!mouse) mouse = {}

        mouse.x = (clientX - left) * 2
        mouse.y = (clientY - top) * 2

        paint()
    }

    function clear() {
        ctx.clearRect(0, 0, 100, 100)
    }

    function paint() {
        const [yMin, yMax] = computeBoundaries(data)

        // const yRatio = VIEW_HEIGHT / (yMax - yMin)
        const yRatio = VIEW_HEIGHT / yMax
        const xRatio = VIEW_WIDTH / (data.columns[0].length - 2)

        canvas.style.height = `${HEIGHT}px`
        canvas.style.width = `${WIDTH}px`

        canvas.height = DPI_HEIGHT
        canvas.width = DPI_WIDTH

        // draw x axis
        const xData = data.columns.filter(
            (col) => data.types[col[0]] !== "line"
        )[0]

        xAxis(ctx, xData, xRatio)

        // draw y axis
        yAxis(ctx, yMin, yMax)

        // draw data
        const yData = data.columns.filter(
            (col) => data.types[col[0]] === "line"
        )

        const coords = yData.map(toCoords(xRatio, yRatio))

        const cursor = getCursorIndex(coords[0])

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

        coords.forEach((coords, idx) => {
            const color = data.colors[yData[idx][0]]
            drawLine(ctx, coords, { color })

            if (cursor) {
                drawCircle(ctx, coords[cursor.index], { color })
            }
        })
    }
}

function getCursorIndex(coords) {
    if (!mouse) return null

    const idxRight = coords
        .map(([x, y]) => mouse.x - x)
        .findIndex((diff) => diff < 0)

    const idxLeft = idxRight > 0 ? idxRight - 1 : 0

    const xValueLeft = coords[idxLeft][0]
    const xValueRight = coords[idxRight][0]

    const yValueLeft = coords[idxLeft][1]
    const yValueRight = coords[idxRight][1]

    const diffXLeft = Math.abs(mouse.x - xValueLeft)
    const diffXRight = Math.abs(mouse.x - xValueRight)

    const index = diffXLeft < diffXRight ? idxLeft : idxRight

    return {
        index,
        x: coords[index][0],
    }
}

function drawCircle(ctx, [x, y], { color }) {
    ctx.beginPath()
    ctx.arc(x, y, CIRCLE_RADIUS, 0, Math.PI * 2)
    ctx.strokeStyle = color
    ctx.fillStyle = "#fff"
    ctx.lineWidth = 4
    ctx.stroke()
    ctx.fill()
    ctx.closePath()
}

function toDate(timestamp) {
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

function toCoords(xRatio, yRatio) {
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

function xAxis(ctx, data, xRatio) {
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

function yAxis(ctx, yMin, yMax) {
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

function drawLine(ctx, coords, { color = "#ff0000", lineWidth = 4 } = {}) {
    ctx.beginPath()

    ctx.lineWidth = lineWidth
    ctx.strokeStyle = color

    for (const [x, y] of coords) {
        ctx.lineTo(x, y)
    }

    ctx.stroke()
    ctx.closePath()
}

function computeBoundaries({ columns, types }) {
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

function getChartData() {
    return [
        {
            columns: [
                [
                    "x",
                    1542412800000,
                    1542499200000,
                    1542585600000,
                    1542672000000,
                    1542758400000,
                    1542844800000,
                    1542931200000,
                    1543017600000,
                    1543104000000,
                    1543190400000,
                    1543276800000,
                    1543363200000,
                    1543449600000,
                    1543536000000,
                    1543622400000,
                    1543708800000,
                    1543795200000,
                    1543881600000,
                    1543968000000,
                    1544054400000,
                    1544140800000,
                    1544227200000,
                    1544313600000,
                    1544400000000,
                    1544486400000,
                    1544572800000,
                    1544659200000,
                    1544745600000,
                    1544832000000,
                    1544918400000,
                    1545004800000,
                    1545091200000,
                    1545177600000,
                    1545264000000,
                    1545350400000,
                    1545436800000,
                    1545523200000,
                    1545609600000,
                    1545696000000,
                    1545782400000,
                    1545868800000,
                    1545955200000,
                    1546041600000,
                    1546128000000,
                    1546214400000,
                    1546300800000,
                    1546387200000,
                    1546473600000,
                    1546560000000,
                    1546646400000,
                    1546732800000,
                    1546819200000,
                    1546905600000,
                    1546992000000,
                    1547078400000,
                    1547164800000,
                    1547251200000,
                    1547337600000,
                    1547424000000,
                    1547510400000,
                    1547596800000,
                    1547683200000,
                    1547769600000,
                    1547856000000,
                    1547942400000,
                    1548028800000,
                    1548115200000,
                    1548201600000,
                    1548288000000,
                    1548374400000,
                    1548460800000,
                    1548547200000,
                    1548633600000,
                    1548720000000,
                    1548806400000,
                    1548892800000,
                    1548979200000,
                    1549065600000,
                    1549152000000,
                    1549238400000,
                    1549324800000,
                    1549411200000,
                    1549497600000,
                    1549584000000,
                    1549670400000,
                    1549756800000,
                    1549843200000,
                    1549929600000,
                    1550016000000,
                    1550102400000,
                    1550188800000,
                    1550275200000,
                    1550361600000,
                    1550448000000,
                    1550534400000,
                    1550620800000,
                    1550707200000,
                    1550793600000,
                    1550880000000,
                    1550966400000,
                    1551052800000,
                    1551139200000,
                    1551225600000,
                    1551312000000,
                    1551398400000,
                    1551484800000,
                    1551571200000,
                    1551657600000,
                    1551744000000,
                    1551830400000,
                    1551916800000,
                    1552003200000,
                ],
                [
                    "y0",
                    37,
                    20,
                    32,
                    39,
                    32,
                    35,
                    19,
                    65,
                    36,
                    62,
                    113,
                    69,
                    120,
                    60,
                    51,
                    49,
                    71,
                    122,
                    149,
                    69,
                    57,
                    21,
                    33,
                    55,
                    92,
                    62,
                    47,
                    50,
                    56,
                    116,
                    63,
                    60,
                    55,
                    65,
                    76,
                    33,
                    45,
                    64,
                    54,
                    81,
                    180,
                    123,
                    106,
                    37,
                    60,
                    70,
                    46,
                    68,
                    46,
                    51,
                    33,
                    57,
                    75,
                    70,
                    95,
                    70,
                    50,
                    68,
                    63,
                    66,
                    53,
                    38,
                    52,
                    109,
                    121,
                    53,
                    36,
                    71,
                    96,
                    55,
                    58,
                    29,
                    31,
                    55,
                    52,
                    44,
                    126,
                    191,
                    73,
                    87,
                    255,
                    278,
                    219,
                    170,
                    129,
                    125,
                    126,
                    84,
                    65,
                    53,
                    154,
                    57,
                    71,
                    64,
                    75,
                    72,
                    39,
                    47,
                    52,
                    73,
                    89,
                    156,
                    86,
                    105,
                    88,
                    45,
                    33,
                    56,
                    142,
                    124,
                    114,
                    64,
                ],
                [
                    "y1",
                    22,
                    12,
                    30,
                    40,
                    33,
                    23,
                    18,
                    41,
                    45,
                    69,
                    57,
                    61,
                    70,
                    47,
                    31,
                    34,
                    40,
                    55,
                    27,
                    57,
                    48,
                    32,
                    40,
                    49,
                    54,
                    49,
                    34,
                    51,
                    51,
                    51,
                    66,
                    51,
                    94,
                    60,
                    64,
                    28,
                    44,
                    96,
                    49,
                    73,
                    30,
                    88,
                    63,
                    42,
                    56,
                    67,
                    52,
                    67,
                    35,
                    61,
                    40,
                    55,
                    63,
                    61,
                    105,
                    59,
                    51,
                    76,
                    63,
                    57,
                    47,
                    56,
                    51,
                    98,
                    103,
                    62,
                    54,
                    104,
                    48,
                    41,
                    41,
                    37,
                    30,
                    28,
                    26,
                    37,
                    65,
                    86,
                    70,
                    81,
                    54,
                    74,
                    70,
                    50,
                    74,
                    79,
                    85,
                    62,
                    36,
                    46,
                    68,
                    43,
                    66,
                    50,
                    28,
                    66,
                    39,
                    23,
                    63,
                    74,
                    83,
                    66,
                    40,
                    60,
                    29,
                    36,
                    27,
                    54,
                    89,
                    50,
                    73,
                    52,
                ],
            ],
            types: {
                y0: "line",
                y1: "line",
                x: "x",
            },
            names: {
                y0: "#0",
                y1: "#1",
            },
            colors: {
                y0: "#3DC23F",
                y1: "#F34C44",
            },
        },
    ][0]
}