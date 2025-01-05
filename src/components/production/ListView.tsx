import React, { useMemo } from 'react';
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

export function ListView(props: ListViewProps) {
  const getAllNodesWithRelationships = useMemo(() => {
    const allNodes: ProductionNode[] = [];
    
    const processNode = (node: ProductionNode, parent: ProductionNode | null) => {
      if (node.itemId !== 'root') {
        const nodeWithParent = {
          ...node,
          parent: parent
        };
        allNodes.push(nodeWithParent);
        node.children.forEach(child => processNode(child, node));
      } else {
        node.children.forEach(child => processNode(child, null));
      }
    };

    props.nodes.forEach(node => processNode(node, null));
    return allNodes;
  }, [props.nodes]);

  const { consumptionData, accumulatedNodes, enhancedNodes } = useMemo(() => {
    const consumption = calculateConsumption(getAllNodesWithRelationships);
    const accumulated = accumulateNodes(props.nodes, props.items, props.recipes);
    
    const enhanced = accumulated.map(node => ({
      ...node,
      relationships: {
        producedFor: node.relationships?.producedFor || [],
        totalProduction: node.rate + (node.manualRate || 0)
      }
    }));

    return { consumptionData: consumption, accumulatedNodes: accumulated, enhancedNodes: enhanced };
  }, [getAllNodesWithRelationships, props.nodes, props.items, props.recipes]);

  const handleRecipeChange = (nodeId: string, newRecipeId: string) => {
    const node = accumulatedNodes.find(n => n.sourceNodes.includes(nodeId));
    if (node) {
      node.sourceNodes.forEach(sourceId => {
        props.onRecipeChange(sourceId, newRecipeId);
      });
    }
  };

  const Row = React.memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const node = enhancedNodes[index];
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
  });

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
              itemSize={props.detailLevel === 'compact' ? 80 : 160}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </ListContent>
    </StyledListContainer>
  );
} 