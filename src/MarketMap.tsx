import { useState, useEffect, useRef } from "react";
import { scaleLinear, select, groups, treemap, hierarchy } from "d3";

import data from "./fake/data.json";

const drawMarketA = (
  ref: HTMLDivElement,
  data: any,
  size = { w: 1954, h: 460, m: { t: 40, r: 10, b: 10, l: 40 } }
) => {
  const canvas = select(ref);

  if ([...canvas.selectAll("svg")].length > 0) {
    console.log("Clearing");
    canvas.selectAll("svg").remove();
  }
  const gW = size.w - size.m.l - size.m.r;
  const gH = size.h - size.m.t - size.m.b;
  const svg = canvas.append("svg").attr("width", size.w).attr("height", size.h);

  const g = svg
    .append("g")
    .attr("width", gW)
    .attr("height", gH)
    .style("font-family", "Neuton")
    .style("font-weight", 500)
    .attr("transform", `translate(${size.m.r},${size.m.b})`);

  const root = treemap()
    .round(false)
    .size([gW, gH])
    .paddingTop(19)(hierarchy(data.sec).sum((d) => d.value))
    .sort((a, b) => a.value - b.value);

  let color = scaleLinear()
    .domain([-3, 0, 3])
    .range(["rgb(243, 43, 2)", "#234567", "rgb(43, 253, 2)"]);

  const node = g
    .selectAll("g")
    .data(groups(root, (d) => d.name))
    .join("g")
    .selectAll("g")
    .data((d) => d[1])
    .join("g")
    .attr("transform", (d) => `translate(${d.x0 + 20}, ${d.y0 + 20})`)
    .attr("fill", "#272931");

  node
    .append("rect")
    .attr("id", (d) => (d.nodeUid = d.data.name))
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0);

  node
    .selectAll("rect")
    .attr("fill", (d) => color(data.map[d.data.name]))
    .attr("fill-opacity", (d, i, n) => {
      return 0.8;
    })
    .attr("id", (d) => d.data.name)
    .attr("stroke", "black");

  node
    .append("text")
    .selectAll("tspan")
    .data((d) =>
      d.x1 - d.x0 < 100
        ? ""
        : d.data.name.toLowerCase() === "root"
        ? "US Market".split(/(?=[A-Z][^A-Z])/g)
        : d.data.name.split(/(?=[A-Z][^A-Z])/g)
    )
    .join("tspan")
    .text((d) => d.split(" ")[0]);

  node
    .filter((d) => d.children)
    .selectAll("tspan")
    .attr("dx", 3)
    .attr("y", 13)
    .attr("fill", "white")
    .attr("font-weight", 900);

  node
    .filter((d) => !d.children)
    .selectAll("tspan")
    .attr("x", 3)
    .attr("y", 13)
    .attr("fill", "white");

  svg.selectAll("rect").on("mouseover", (e, n) => {
    // svg.selectAll(n.data.name).attr("stroke", "white");
  });
};

const drawMarketB = (
  ref: HTMLDivElement,
  data: any,
  size = { w: 1954, h: 460, m: { t: 40, r: 10, b: 10, l: 40 } }
) => {
  const canvas = select(ref);

  if ([...canvas.selectAll("svg")].length > 0) {
    console.log("Clearing");
    canvas.selectAll("svg").remove();
  }
  const gW = size.w - size.m.l - size.m.r;
  const gH = size.h - size.m.t - size.m.b;
  const svg = canvas.append("svg").attr("width", size.w).attr("height", size.h);

  const g = svg
    .append("g")
    .attr("width", gW)
    .attr("height", gH)
    .style("font-family", "Neuton")
    .style("font-weight", 500)
    .attr("transform", `translate(${size.m.r},${size.m.b})`);

  const rootData = hierarchy(data.sec);
  rootData.eachAfter((d) => {
    if (!d.hasOwnProperty("children")) {
      d.value = d.data.value;
    } else {
      d.value = 0;
      for (var i in d.children) {
        d.value +=
          d.depth === 3 ? d.children[i].value + 50 : d.children[i].value;
      }
    }
  });
  treemap()
    .round(false)
    .size([gW, gH])
    .paddingOuter(0)
    .paddingInner(0)
    .paddingTop(19)(rootData);

  let color = scaleLinear()
    .domain([-3, 0, 3])
    .range(["rgb(243, 43, 2)", "#2A2C36", "rgb(43, 253, 2)"]);

  g.selectAll("rect")
    .data(rootData.descendants())
    .enter()
    .append("rect")
    .attr("id", (d) => (d.nodeUid = d.data.name))
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("stroke", "white")
    .attr("fill", (d) =>
      d.depth === 3
        ? color(data.map[d.data.name])
        : d.depth === 0
        ? "#333"
        : d.depth === 1
        ? "#2A2C36CC"
        : "#141416"
    );

  g.append("g")
    .selectAll("text")
    .data(rootData.descendants())
    .join("text")
    .text((d, i, n) => {
      return d.x1 - d.x0 < 50 || d.y1 - d.y0 < 50
        ? ""
        : d.depth === 0
        ? "USA Market"
        : d.data.name.length > (d.x1 - d.x0) / 8
        ? d.data.name.slice(0, 5)
        : d.data.name;
    })
    .attr("dx", (d) => d.x0 + 3)
    .attr("y", (d) => d.y0 + 15)
    .attr("transform", (d) =>
      d.depth === 3
        ? `translate(${(d.x1 - d.x0) / 4}, ${(d.y1 - d.y0) / 4})`
        : ""
    )
    .attr("fill", (d) => (d.depth === 2 ? "white" : "white"))
    .attr("font-weight", (d) => (d.depth === 3 ? 700 : 900));
};

export const MarketMap = () => {
  const refA = useRef<HTMLDivElement>(null);
  const refB = useRef<HTMLDivElement>(null);
  const [market, setMarket] = useState({});

  // fetch data
  useEffect(() => {
    if (
      data.sec?.children.length > 0 &&
      Object.keys(data.map?.nodes).length > 0
    ) {
      setMarket({ sec: data.sec, map: data.map.nodes });
    }
  }, []);

  // draw table
  useEffect(() => {
    if (refA.current && refB.current && Object.keys(market).length > 0) {
      drawMarketA(refA.current, market);
      drawMarketB(refB.current, market);
    }
  }, [market]);

  return (
    <>
      <div ref={refA} className="market_map"></div>
      <div ref={refB} className="market_map"></div>
    </>
  );
};
