import React, { useMemo, useCallback } from 'react';
import { ProductionNode, Item, Recipe, AccumulatedNodeUI } from '../../types/types';
import { accumulateNodes } from '../../utils/nodeAccumulator';
import { calculateConsumption } from '../../utils/consumptionTracker';
import { ProductionNode as ProductionNodeComponent } from './ProductionNode';
import { Box, Paper, styled } from '@mui/material';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const StyledListContainer = styled(Paper)(({ theme }) => ({
  height: '100%',
  backgroundColor: theme.palette.background.default,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}));

const ListContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'hidden',
  padding: theme.spacing(2),
}));

interface ListViewProps {
  nodes: ProductionNode[];
  items: Map<string, Item>;
  recipes: Map<string, Recipe>;
  onRecipeChange: (nodeId: string, recipeId: string) => void;
  onManualRateChange: (nodeId: string, rate: number) => void;
  onMachineCountChange: (nodeId: string, count: number) => void;
  machineOverrides: Map<string, number>;
  manualRates: Map<string, number>;
  detailLevel: 'compact' | 'normal' | 'detailed';
}

interface AutoSizerProps {
  height: number;
  width: number;
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    nodes: AccumulatedNodeUI[];
    props: ListViewProps;
    handleRecipeChange: (nodeId: string, newRecipeId: string) => void;
  };
}

// Add interface for node with parent
interface ProductionNodeWithParent extends ProductionNode {
  parent: ProductionNode | null;
}

// Memoize the row component
const Row = React.memo(function Row({ index, style, data }: RowProps) {
  const { nodes, props, handleRecipeChange } = data;
  const node = nodes[index];
  
  return (
    <div style={style}>
      <ProductionNodeComponent
        key={`${node.itemId}-${node.recipeId}`}
        node={node}
        onRecipeChange={handleRecipeChange}
        onManualRateChange={props.onManualRateChange}
        onMachineCountChange={props.onMachineCountChange}
        machineOverrides={props.machineOverrides}
        manualRates={props.manualRates}
        detailLevel={props.detailLevel}
        isAccumulated={true}
        sourceCount={node.sourceNodes.length}
        itemsMap={props.items}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better memoization
  const prevNode = prevProps.data.nodes[prevProps.index];
  const nextNode = nextProps.data.nodes[nextProps.index];
  const prevProps_ = prevProps.data.props;
  const nextProps_ = nextProps.data.props;
  
  return (
    prevNode === nextNode &&
    prevProps_.detailLevel === nextProps_.detailLevel &&
    prevProps_.machineOverrides === nextProps_.machineOverrides &&
    prevProps_.manualRates === nextProps_.manualRates
  );
});

export function ListView(props: ListViewProps) {
  // Calculate item size based on detail level - moved to top
  const getItemSize = useCallback(() => {
    switch (props.detailLevel) {
      case 'compact': return 80;
      case 'detailed': return 200;
      default: return 160;
    }
  }, [props.detailLevel]);

  // Memoize node processing - only recalculate when nodes structure changes
  const allNodesWithRelationships = useMemo(() => {
    const allNodes: ProductionNodeWithParent[] = [];
    const processNode = (node: ProductionNode, parent: ProductionNode | null) => {
      if (node.itemId !== 'root') {
        allNodes.push({ ...node, parent } as ProductionNodeWithParent);
        node.children.forEach(child => processNode(child, node));
      } else {
        node.children.forEach(child => processNode(child, null));
      }
    };
    props.nodes.forEach(node => processNode(node, null));
    return allNodes;
  }, [props.nodes]);

  // Memoize consumption and accumulation calculations
  const { consumptionData, accumulatedNodes, enhancedNodes } = useMemo(() => {
    const consumption = calculateConsumption(allNodesWithRelationships);
    const accumulated = accumulateNodes(props.nodes, props.items, props.recipes);
    
    const enhanced = accumulated.map(node => ({
      ...node,
      relationships: {
        producedFor: node.relationships?.producedFor || [],
        totalProduction: node.rate + (node.manualRate || 0)
      }
    }));

    return { consumptionData: consumption, accumulatedNodes: accumulated, enhancedNodes: enhanced };
  }, [
    allNodesWithRelationships,
    props.nodes,
    props.items,
    props.recipes
  ]);

  // Memoize recipe change handler
  const handleRecipeChange = useCallback((nodeId: string, newRecipeId: string) => {
    const node = accumulatedNodes.find(n => n.sourceNodes.includes(nodeId));
    if (node) {
      node.sourceNodes.forEach(sourceId => {
        props.onRecipeChange(sourceId, newRecipeId);
      });
    }
  }, [accumulatedNodes, props.onRecipeChange]);

  // Memoize list data to prevent unnecessary Row re-renders
  const listData = useMemo(() => ({
    nodes: enhancedNodes,
    props,
    handleRecipeChange
  }), [enhancedNodes, props, handleRecipeChange]);

  if (accumulatedNodes.length === 0) {
    return (
      <StyledListContainer elevation={0}>
        <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
          No production nodes to display
        </Box>
      </StyledListContainer>
    );
  }

  return (
    <StyledListContainer elevation={0}>
      <ListContent>
        <AutoSizer>
          {({ height, width }: AutoSizerProps) => (
            <List
              height={height}
              width={width}
              itemCount={enhancedNodes.length}
              itemSize={getItemSize()}
              itemData={listData}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </ListContent>
    </StyledListContainer>
  );
} 