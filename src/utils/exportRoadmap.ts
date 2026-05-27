import { RoadmapNode } from "../context/RoadmapBuilderContext";

/**
 * Validates a parsed JSON object to ensure it strictly matches the Roadmap schema.
 * Throws a specific descriptive error if anything is malformed.
 */
export const validateRoadmapJSON = (
  data: any
): { title: string; description: string; nodes: RoadmapNode[] } => {
  if (!data || typeof data !== "object") {
    throw new Error("Import failed: Data is not a valid JSON object.");
  }

  const title =
    typeof data.title === "string" ? data.title : "Imported Custom Path";
  const description =
    typeof data.description === "string"
      ? data.description
      : "Custom imported path.";

  if (!data.nodes || !Array.isArray(data.nodes)) {
    throw new Error('Import failed: The file must contain a "nodes" array.');
  }

  const validatedNodes: RoadmapNode[] = [];

  data.nodes.forEach((node: any, index: number) => {
    if (!node.id || typeof node.id !== "string") {
      throw new Error(
        `Node validation failed at index ${index}: "id" is missing or is not a string.`
      );
    }
    if (!node.title || typeof node.title !== "string") {
      throw new Error(
        `Node validation failed (ID: ${node.id || index}): "title" is missing or is not a string.`
      );
    }
    if (typeof node.description !== "string") {
      node.description = "";
    }
    if (typeof node.x !== "number" || typeof node.y !== "number") {
      throw new Error(
        `Node validation failed (ID: ${node.id}): Coordinates "x" or "y" must be numbers.`
      );
    }

    const validStatuses = ["Not Started", "In Progress", "Completed", "Stuck"];
    const status = validStatuses.includes(node.status)
      ? node.status
      : "Not Started";

    if (node.resources && !Array.isArray(node.resources)) {
      node.resources = [];
    }

    const resources = (node.resources || []).map((r: any, rIdx: number) => {
      if (
        !r.title ||
        typeof r.title !== "string" ||
        !r.url ||
        typeof r.url !== "string"
      ) {
        throw new Error(
          `Node "${node.title}" resource at index ${rIdx} is malformed. Resources need a "title" and a "url".`
        );
      }
      return { title: r.title, url: r.url };
    });

    if (node.prerequisites && !Array.isArray(node.prerequisites)) {
      node.prerequisites = [];
    }

    const prerequisites = (node.prerequisites || []).filter(
      (p: any) => typeof p === "string"
    );

    validatedNodes.push({
      id: node.id,
      title: node.title,
      description: node.description,
      x: node.x,
      y: node.y,
      status: status as any,
      notes: typeof node.notes === "string" ? node.notes : "",
      resources,
      prerequisites,
    });
  });

  // Cycle detection: Verify no circular prerequisite connections exist
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const adj = new Map<string, string[]>();

  validatedNodes.forEach((node) => adj.set(node.id, node.prerequisites));

  const hasCycle = (nodeId: string): boolean => {
    visiting.add(nodeId);
    const neighbors = adj.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (visiting.has(neighbor)) return true;
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) return true;
      }
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  };

  for (const node of validatedNodes) {
    if (!visited.has(node.id)) {
      if (hasCycle(node.id)) {
        throw new Error(
          "Validation failed: The imported roadmap contains circular prerequisite dependencies (loops)."
        );
      }
    }
  }

  return { title, description, nodes: validatedNodes };
};

/**
 * Exports the workspace state to a downloadable JSON file.
 */
export const exportToJSON = (
  title: string,
  description: string,
  nodes: RoadmapNode[]
) => {
  const dataStr = JSON.stringify({ title, description, nodes }, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-roadmap.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Builds a standalone visual SVG representation of the entire roadmap canvas.
 */
export const buildStandaloneSVG = (
  title: string,
  description: string,
  nodes: RoadmapNode[],
  theme: "dark" | "light"
): string => {
  // 1. Calculate boundaries of the canvas
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  if (nodes.length === 0) {
    minX = 100;
    minY = 100;
    maxX = 500;
    maxY = 300;
  } else {
    nodes.forEach((n) => {
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x > maxX) maxX = n.x;
      if (n.y > maxY) maxY = n.y;
    });
    // Add padding around coordinates
    minX = Math.max(0, minX - 100);
    minY = Math.max(0, minY - 100);
    maxX = maxX + 300; // Account for node card width
    maxY = maxY + 200; // Account for node card height
  }

  const width = maxX - minX;
  const height = maxY - minY;

  const bgHex = theme === "dark" ? "#0A0A0A" : "#FFFFFF";
  const textHex = theme === "dark" ? "#FFFFFF" : "#1A1A1A";
  const descHex = theme === "dark" ? "#B0B0B0" : "#4A4A4A";
  const borderHex =
    theme === "dark" ? "rgba(230, 57, 70, 0.15)" : "rgba(26, 26, 26, 0.08)";

  // Style helper for nodes status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "#FFC107"; // amber
      case "Completed":
        return "#4CAF50"; // emerald
      case "Stuck":
        return "#E63946"; // ruby
      default:
        return theme === "dark" ? "#6B6B6B" : "#8A8A8A";
    }
  };

  // Compile SVGs and Lines
  let linePaths = "";
  nodes.forEach((node) => {
    node.prerequisites.forEach((preId) => {
      const fromNode = nodes.find((n) => n.id === preId);
      if (fromNode) {
        // Center offsets
        const x1 = fromNode.x + 110 - minX;
        const y1 = fromNode.y + 45 - minY;
        const x2 = node.x + 110 - minX;
        const y2 = node.y + 45 - minY;

        // Draw bezier
        const midY = (y1 + y2) / 2;
        const path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
        const color = getStatusColor(fromNode.status);
        linePaths += `<path d="${path}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" opacity="0.8" />`;
      }
    });
  });

  let nodeCards = "";
  nodes.forEach((node) => {
    const rx = node.x - minX;
    const ry = node.y - minY;
    const statusColor = getStatusColor(node.status);
    const cardBgHex = theme === "dark" ? "#1E1E1E" : "#F9F9F9";

    // Safe XML text
    const safeTitle = node.title
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const safeDesc =
      node.description
        .substring(0, 80)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;") + (node.description.length > 80 ? "..." : "");

    nodeCards += `
      <g transform="translate(${rx}, ${ry})">
        <!-- Node card border and background -->
        <rect width="220" height="90" rx="14" fill="${cardBgHex}" stroke="${borderHex}" stroke-width="1.5" />
        
        <!-- Status indicator dot/pill -->
        <rect x="15" y="16" width="10" height="10" rx="5" fill="${statusColor}" />
        
        <!-- Node Title -->
        <text x="32" y="25" font-family="'Orbitron', sans-serif" font-weight="900" font-size="12" fill="${textHex}">${safeTitle}</text>
        
        <!-- Status Label -->
        <text x="15" y="44" font-family="sans-serif" font-size="9" fill="${statusColor}" font-weight="bold">${node.status.toUpperCase()}</text>
        
        <!-- Description -->
        <text x="15" y="60" font-family="sans-serif" font-size="9" fill="${descHex}" width="190">
          <tspan x="15" dy="0">${safeDesc.substring(0, 35)}</tspan>
          <tspan x="15" dy="12">${safeDesc.substring(35, 70)}</tspan>
        </text>
      </g>
    `;
  });

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&amp;display=swap');
        text { font-family: system-ui, -apple-system, sans-serif; }
      </style>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="${bgHex}" />
      
      <!-- Subtle grid patterns -->
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${theme === "dark" ? "rgba(230,57,70,0.03)" : "rgba(0,0,0,0.02)"}" stroke-width="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      
      <!-- Title Block -->
      <g transform="translate(40, 50)">
        <text x="0" y="0" font-family="'Orbitron', sans-serif" font-weight="900" font-size="24" fill="${textHex}">${title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>
        <text x="0" y="24" font-family="sans-serif" font-size="12" fill="${descHex}">${description.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>
      </g>
      
      <!-- Graph content offset below title -->
      <g transform="translate(0, 60)">
        <!-- Connecting paths -->
        ${linePaths}
        
        <!-- Node Cards -->
        ${nodeCards}
      </g>
    </svg>
  `;

  return svgString.trim();
};

/**
 * Triggers client-side browser download of vector SVG image.
 */
export const downloadSVG = (
  title: string,
  description: string,
  nodes: RoadmapNode[],
  theme: "dark" | "light"
) => {
  const svgStr = buildStandaloneSVG(title, description, nodes, theme);
  const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-canvas.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Converts roadmap SVG to a rasterized PNG file and downloads it in the user's browser.
 */
export const downloadPNG = (
  title: string,
  description: string,
  nodes: RoadmapNode[],
  theme: "dark" | "light"
) => {
  const svgStr = buildStandaloneSVG(title, description, nodes, theme);

  // Parse width and height from the SVG
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgStr, "image/svg+xml");
  const svgEl = doc.documentElement;
  const width = parseFloat(svgEl.getAttribute("width") || "1200");
  const height = parseFloat(svgEl.getAttribute("height") || "1000");

  // Convert SVG string to Data URL
  const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    // Set high-resolution output scaling
    canvas.width = width * 1.5;
    canvas.height = height * 1.5;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Clear canvas
      ctx.fillStyle = theme === "dark" ? "#0A0A0A" : "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render scaling
      ctx.scale(1.5, 1.5);
      ctx.drawImage(image, 0, 0);

      // Export as Data URL
      try {
        const pngUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-canvas.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("PNG canvas security or export error:", err);
      }
    }
    URL.revokeObjectURL(url);
  };
  image.src = url;
};
