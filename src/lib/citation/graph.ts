import type { PrecedentEdge } from "@/types/legal";

export interface CitationNode {
  id: string;
  inboundWeight: number;
  outboundWeight: number;
  degree: number;
  rank: number;
}

export function rankCitationGraph(edges: PrecedentEdge[]): CitationNode[] {
  const nodes = new Map<string, CitationNode>();

  for (const edge of edges) {
    const source = nodes.get(edge.sourceId) ?? { id: edge.sourceId, inboundWeight: 0, outboundWeight: 0, degree: 0, rank: 0 };
    const target = nodes.get(edge.targetId) ?? { id: edge.targetId, inboundWeight: 0, outboundWeight: 0, degree: 0, rank: 0 };
    const weight = Number.isFinite(edge.weight) && edge.weight > 0 ? edge.weight : 0;

    source.outboundWeight += weight;
    source.degree += 1;
    target.inboundWeight += weight;
    target.degree += 1;
    nodes.set(source.id, source);
    nodes.set(target.id, target);
  }

  const nodeList = Array.from(nodes.values());
  const total = nodeList.reduce((sum, node) => sum + node.inboundWeight + node.outboundWeight, 0);
  for (const node of nodeList) {
    node.rank = total > 0 ? (node.inboundWeight * 2 + node.outboundWeight) / total : 0;
  }

  return nodeList.sort((a, b) => b.rank - a.rank || a.id.localeCompare(b.id));
}
