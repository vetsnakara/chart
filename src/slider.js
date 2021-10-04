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
    MIN_WINDOW_WIDTH,
} = config.get("sliderChart")

const { drawLine, drawCircle, computeBoundaries, css, xAxis, yAxis, toCoords } =
    getUtils("sliderChart")

let changeHandler = () => {}

export function sliderChart(root, data) {
    const canvas = root.querySelector("canvas")
    const ctx = canvas.getContext("2d")

    const $left = root.querySelector("[data-el='left']")
    const $right = root.querySelector("[data-el='right']")
    const $window = root.querySelector("[data-el='window']")

    const defaultWidth = WIDTH * 0.3
    setPosition(0, WIDTH - defaultWidth)

    root.addEventListener("mousedown", mousedown)

    function getPosition() {
        const left = parseInt($left.style.width)
        const right = WIDTH - parseInt($right.style.width)

        return [(left * 100) / WIDTH, (right * 100) / WIDTH]
    }

    function setPosition(left, right, cb = changeHandler) {
        const w = WIDTH - right - left

        if (w < MIN_WINDOW_WIDTH) {
            css($window, {
                width: `${MIN_WINDOW_WIDTH}px`,
            })
            return
        }

        if (left < 0) {
            css($window, {
                left: "0px",
            })
            css($left, { width: "0px" })
            return
        }

        if (right < 0) {
            css($window, {
                right: "0px",
            })
            css($right, { width: "0px" })
            return
        }

        css($window, {
            width: `${w}px`,
            left: `${left}px`,
            right: `${right}px`,
        })

        css($right, { width: `${right}px` })
        css($left, { width: `${left}px` })

        cb()
    }

    function mousedown(event) {
        const type = event.target.dataset.type
        if (!type) return

        const dims = {
            left: parseInt($window.style.left),
            right: parseInt($window.style.right),
            width: parseInt($window.style.width),
        }

        if (type === "window") {
            const startX = event.pageX

            document.onmousemove = (e) => {
                const delta = startX - e.pageX
                if (!delta) return

                const left = dims.left - delta
                const right = WIDTH - left - dims.width

                setPosition(left, right)
            }

            document.addEventListener(
                "mouseup",
                () => (document.onmousemove = null)
            )
        } else if (type === "left" || type === "right") {
            const startX = event.pageX

            document.onmousemove = (e) => {
                const delta = startX - e.pageX
                if (!delta) return

                if (type === "left") {
                    const left = WIDTH - (dims.width + delta) - dims.right
                    const right = WIDTH - (dims.width + delta) - left
                    setPosition(left, right)
                } else {
                    const right = WIDTH - (dims.width - delta) - dims.left
                    setPosition(dims.left, right)
                }
            }

            document.addEventListener(
                "mouseup",
                () => (document.onmousemove = null)
            )
        }
    }

    paint()

    return {
        subscribe(fn) {
            changeHandler = () => {
                const pos = getPosition()
                fn(pos)
            }
        },
    }

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
