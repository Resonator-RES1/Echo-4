import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { LoreEntry, VoiceProfile } from '../../types';

interface SemanticGraphProps {
    loreEntries: LoreEntry[];
    voiceProfiles: VoiceProfile[];
    onNodeClick?: (id: string, type: 'lore' | 'voice') => void;
}

interface GraphNode extends d3.SimulationNodeDatum {
    id: string;
    label: string;
    type: 'lore' | 'voice';
    category?: string;
    radius: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
    source: string | GraphNode;
    target: string | GraphNode;
    label?: string;
}

export const SemanticGraph: React.FC<SemanticGraphProps> = ({ loreEntries, voiceProfiles, onNodeClick }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!svgRef.current || !containerRef.current) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        // Clear previous graph
        d3.select(svgRef.current).selectAll('*').remove();

        const nodes: GraphNode[] = [];
        const links: GraphLink[] = [];

        // Add Lore Nodes
        loreEntries.forEach(entry => {
            nodes.push({
                id: entry.id,
                label: entry.title,
                type: 'lore',
                category: entry.categoryId,
                radius: 12
            });

            // Add links from relationships
            if (entry.relationships) {
                entry.relationships.forEach(rel => {
                    links.push({
                        source: entry.id,
                        target: rel.targetId,
                        label: rel.type
                    });
                });
            }
        });

        // Add Voice Nodes
        voiceProfiles.forEach(voice => {
            nodes.push({
                id: voice.id,
                label: voice.name,
                type: 'voice',
                category: voice.archetype,
                radius: 16
            });

            // Add links from relationships
            if (voice.relationships) {
                voice.relationships.forEach(rel => {
                    links.push({
                        source: voice.id,
                        target: rel.targetId,
                        label: rel.type
                    });
                });
            }
        });

        // Filter links to only include those where both source and target exist
        const validLinks = links.filter(link => 
            nodes.some(n => n.id === link.source) && nodes.some(n => n.id === link.target)
        );

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .call(d3.zoom<SVGSVGElement, unknown>().on('zoom', (event) => {
                g.attr('transform', event.transform);
            }))
            .append('g');

        const g = svg.append('g');

        const simulation = d3.forceSimulation<GraphNode>(nodes)
            .force('link', d3.forceLink<GraphNode, GraphLink>(validLinks).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-200))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collide', d3.forceCollide().radius(d => (d as GraphNode).radius + 10));

        // Draw links
        const link = g.append('g')
            .attr('stroke', 'rgba(255, 255, 255, 0.1)')
            .attr('stroke-opacity', 0.6)
            .selectAll('line')
            .data(validLinks)
            .join('line')
            .attr('stroke-width', 1.5);

        // Draw nodes
        const node = g.append('g')
            .selectAll('g')
            .data(nodes)
            .join('g')
            .call(d3.drag<SVGGElement, GraphNode>()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended) as any)
            .on('click', (event, d) => {
                if (onNodeClick) onNodeClick(d.id, d.type);
            });

        // Node circles
        node.append('circle')
            .attr('r', d => d.radius)
            .attr('fill', d => d.type === 'voice' ? 'var(--color-primary)' : 'var(--color-amber-500)')
            .attr('stroke', 'rgba(255, 255, 255, 0.2)')
            .attr('stroke-width', 2)
            .attr('class', 'cursor-pointer hover:opacity-80 transition-opacity');

        // Node labels
        node.append('text')
            .text(d => d.label)
            .attr('x', d => d.radius + 4)
            .attr('y', 4)
            .attr('fill', 'rgba(255, 255, 255, 0.7)')
            .attr('font-size', '10px')
            .attr('font-family', 'Inter, sans-serif')
            .attr('class', 'pointer-events-none select-none');

        simulation.on('tick', () => {
            link
                .attr('x1', d => (d.source as GraphNode).x!)
                .attr('y1', d => (d.source as GraphNode).y!)
                .attr('x2', d => (d.target as GraphNode).x!)
                .attr('y2', d => (d.target as GraphNode).y!);

            node
                .attr('transform', d => `translate(${d.x},${d.y})`);
        });

        function dragstarted(event: any, d: GraphNode) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event: any, d: GraphNode) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event: any, d: GraphNode) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return () => {
            simulation.stop();
        };
    }, [loreEntries, voiceProfiles, onNodeClick]);

    return (
        <div ref={containerRef} className="w-full h-full min-h-[300px] bg-surface-container-lowest rounded-lg border border-outline-variant/10 overflow-hidden relative">
            <svg ref={svgRef} className="w-full h-full" />
            <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Voice Profiles</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Lore Entries</span>
                </div>
            </div>
        </div>
    );
};
