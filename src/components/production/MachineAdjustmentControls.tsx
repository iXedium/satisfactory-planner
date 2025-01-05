import React from 'react';
import { Recipe } from '../../types/types';
import { ItemIcon } from '../ui/ItemIcon';
import { Button, ButtonGroup, Typography, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface MachineAdjustmentControlsProps {
  machineCount: number;
  efficiency: string;
  onMachineCountChange: (count: number) => void;
  producer?: string;
  nominalRate?: number;
  detailLevel: 'compact' | 'normal' | 'detailed';
}

export function MachineAdjustmentControls({
  machineCount,
  efficiency,
  onMachineCountChange,
  producer,
  nominalRate,
  detailLevel
}: MachineAdjustmentControlsProps) {
  const getEfficiencyColor = (efficiency: number): string => {
    if (efficiency === 100) return 'success.main';
    if (efficiency < 100) return 'warning.main';
    return 'error.main';
  };

  const formatBuildingName = (name: string): string => {
    return name.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (detailLevel === 'compact') return null;

  return (
    <Box 
      className="building-container" 
      onClick={e => e.stopPropagation()}
      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
    >
      {detailLevel === 'detailed' && producer && (
        <ItemIcon iconId={producer.toLowerCase()} size={32} />
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {producer && (
          <Typography variant="body2" color="text.primary">
            {formatBuildingName(producer)}
          </Typography>
        )}
        {nominalRate && (
          <Typography variant="caption" color="text.secondary">
            ({nominalRate.toFixed(2)}/min)
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ButtonGroup size="small" variant="outlined">
            <Button
              onClick={() => onMachineCountChange(machineCount - 1)}
              disabled={machineCount <= 1}
            >
              <RemoveIcon fontSize="small" />
            </Button>
            <Button disabled sx={{ px: 2 }}>
              {machineCount}
            </Button>
            <Button
              onClick={() => onMachineCountChange(machineCount + 1)}
            >
              <AddIcon fontSize="small" />
            </Button>
          </ButtonGroup>
          <Typography 
            variant="body2" 
            sx={{ color: getEfficiencyColor(parseFloat(efficiency)) }}
          >
            {efficiency}%
          </Typography>
        </Box>
      </Box>
    </Box>
  );
} 