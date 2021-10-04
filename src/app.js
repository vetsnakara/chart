import "./styles.scss"
import getChartData from "./data"

import chart from "./chart"

const data = getChartData()
data.columns = data.columns.map((column) => column.slice(0, 30))

const chartObj = chart(document.getElementById("chart"), data)
chartObj.init()
