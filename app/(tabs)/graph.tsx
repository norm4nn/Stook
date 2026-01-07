import React, { useEffect, useState, useRef } from "react";
import { View, Dimensions } from "react-native";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import * as d3 from "d3-force";
import { db } from "../../lib/database";

const { width, height } = Dimensions.get("window");
const CANVAS_WIDTH = width * 2.5;  // 2.5x larger canvas to see more
const CANVAS_HEIGHT = height * 2.5;

export default function GraphScreen() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const simulationRef = useRef<any>(null);

  useEffect(() => {
    load();

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, []);

  const load = async () => {
    const contacts = await db.getAllAsync(
      "SELECT tag_id, name, surname, source FROM contacts"
    );

    const shared = await db.getAllAsync(
      "SELECT from_tag_id, tag_id FROM shared_contacts"
    );

    console.log("GRAPH contacts:", contacts);
    console.log("GRAPH shared:", shared);

    const nodeMap = new Map();
    let localTagId = null;

    // Create nodes with initial positions
    contacts.forEach((c) => {
      const isLocal = c.source === "local";
      if (isLocal) {
        localTagId = c.tag_id;
      }

      nodeMap.set(c.tag_id, {
        id: c.tag_id,
        label: `${c.name} ${c.surname}`,
        source: c.source,
        x: isLocal ? CANVAS_WIDTH / 2 : CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 300,
        y: isLocal ? CANVAS_HEIGHT / 2 : CANVAS_HEIGHT / 2 + (Math.random() - 0.5) * 300,
        fx: isLocal ? CANVAS_WIDTH / 2 : null,  // Fix local node to center
        fy: isLocal ? CANVAS_HEIGHT / 2 : null,
      });
    });

    const nodeArray = Array.from(nodeMap.values());

    // Create links from shared_contacts table
    const linkArray = shared
      .filter(
        (s) => nodeMap.has(s.from_tag_id) && nodeMap.has(s.tag_id)
      )
      .map((s) => ({
        source: s.from_tag_id,
        target: s.tag_id,
      }));

    // ADD AUTOMATIC CONNECTIONS: You know everyone in your contacts
    if (localTagId) {
      contacts.forEach((c) => {
        // Connect you to every contact that isn't you
        if (c.tag_id !== localTagId) {
          // Check if this connection doesn't already exist
          const exists = linkArray.some(
            l => (l.source === localTagId && l.target === c.tag_id) ||
                 (l.source === c.tag_id && l.target === localTagId)
          );

          if (!exists) {
            linkArray.push({
              source: localTagId,
              target: c.tag_id,
            });
          }
        }
      });
    }

    console.log("GRAPH nodeArray:", nodeArray);
    console.log("GRAPH linkArray:", linkArray);

    setNodes(nodeArray);
    setLinks(linkArray);

    runSimulation(nodeArray, linkArray);
  };

  const runSimulation = (nodes: any[], links: any[]) => {
    // Stop any existing simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(250)        // Distance between connected nodes
          .strength(0.5)
      )
      .force("charge", d3.forceManyBody().strength(-600))  // Repulsion between all nodes
      .force("collision", d3.forceCollide().radius(40))    // Prevent overlapping
      .alphaDecay(0.015)  // Slower decay for smoother settling
      .on("tick", () => {
        // Update state to trigger re-render
        setNodes([...nodes]);
        setLinks([...links]);
      });

    simulationRef.current = simulation;

    // Let simulation run for 15 seconds
    setTimeout(() => {
      simulation.stop();
    }, 15000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      >
        {/* Draw links first (behind nodes) */}
        {links.map((l, i) => {
          // Make sure source and target have been resolved by d3
          if (!l.source.x || !l.target.x) return null;

          return (
            <Line
              key={`link-${i}`}
              x1={l.source.x}
              y1={l.source.y}
              x2={l.target.x}
              y2={l.target.y}
              stroke="#666"
              strokeWidth={3}
            />
          );
        })}

        {/* Draw nodes on top */}
        {nodes.map((n) => {
          const isLocal = n.source === "local";
          return (
            <React.Fragment key={n.id}>
              <Circle
                cx={n.x}
                cy={n.y}
                r={isLocal ? 35 : 25}  // Larger for you
                fill={isLocal ? "#0077ff" : "#00aa66"}
                stroke="#fff"
                strokeWidth={isLocal ? 4 : 3}
              />
              <SvgText
                x={n.x}
                y={n.y + (isLocal ? 50 : 42)}
                fontSize={isLocal ? "16" : "14"}
                fontWeight="bold"
                textAnchor="middle"
                fill="#333"
              >
                {n.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}