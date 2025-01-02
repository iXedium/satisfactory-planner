import { ProductionNode, NodeConsumption, ConsumptionData } from '../types/types';

interface NodeWithParent extends ProductionNode {
  parent?: ProductionNode | null;
}

export function calculateConsumption(allNodes: NodeWithParent[]): Map<string, NodeConsumption> {
  // Filter out root node and null/undefined nodes
  const validNodes = allNodes.filter(node => 
    node && node.itemId && node.itemId !== 'root'
  );

  // First pass: calculate total production for each item
  const productionMap = new Map<string, number>();
  validNodes.forEach(node => {
    const current = productionMap.get(node.itemId) || 0;
    const totalRate = node.rate + (node.manualRate || 0);
    productionMap.set(node.itemId, current + totalRate);
  });

  // Create consumption map
  const consumptionMap = new Map<string, NodeConsumption>();

  // Initialize all items with empty consumption data
  validNodes.forEach(node => {
    if (!consumptionMap.has(node.itemId)) {
      consumptionMap.set(node.itemId, {
        consumers: [],
        storage: null,
        totalProduction: productionMap.get(node.itemId) || 0
      });
    }
  });

  // Track consumption relationships using parent references
  validNodes.forEach(node => {
    if (node.parent) {
      const consumption = consumptionMap.get(node.itemId);
      if (consumption) {
        // Add the parent as a consumer
        const amount = node.rate + (node.manualRate || 0);
        const totalProduction = productionMap.get(node.itemId) || 0;
        consumption.consumers.push({
          itemId: node.parent.itemId,
          amount,
          percentage: (amount / totalProduction) * 100,
          percentageWithStorage: 0
        });
      }
    }
  });

  // Calculate storage and final percentages
  consumptionMap.forEach((consumption) => {
    const totalConsumed = consumption.consumers.reduce((sum, c) => sum + c.amount, 0);
    const storageAmount = consumption.totalProduction - totalConsumed;

    if (storageAmount > 0.01) {
      consumption.storage = {
        amount: storageAmount,
        percentage: (storageAmount / consumption.totalProduction) * 100
      };

      // Update percentages with storage
      consumption.consumers.forEach(consumer => {
        consumer.percentageWithStorage = (consumer.amount / consumption.totalProduction) * 100;
      });
    }
  });

  return consumptionMap;
}
