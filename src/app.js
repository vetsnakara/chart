import "./styles.scss"
import getChartData from "./data"

import chart from "./chart"

const data = getChartData()

const chartObj = chart(document.getElementById("chart"), data)
chartObj.init()
