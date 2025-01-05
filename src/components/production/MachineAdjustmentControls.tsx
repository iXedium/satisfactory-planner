import React from 'react';
import { Recipe } from '../../types/types';
import { ItemIcon } from '../ui/ItemIcon';
import { Button, ButtonGroup, Typography, Box, Paper, styled } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const StyledControls = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  '&:hover': {
    backgroundColor: theme.palette.background.default,
  },
}));

const StyledButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  '& .MuiButton-root': {
    borderColor: theme.palette.divider,
    color: theme.palette.text.primary,
    '&:hover:not(:disabled)': {
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.action.hover,
    },
    '&.Mui-disabled': {
      borderColor: theme.palette.divider,
      color: theme.palette.text.disabled,
    },
  },
}));

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
    <StyledControls elevation={0} onClick={e => e.stopPropagation()}>
      {detailLevel === 'detailed' && producer && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ItemIcon iconId={producer.toLowerCase()} size={32} />
        </Box>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {producer && (
          <Typography variant="subtitle2" color="text.primary">
            {formatBuildingName(producer)}
          </Typography>
        )}
        {nominalRate && (
          <Typography variant="caption" color="text.secondary">
            Nominal rate: {nominalRate.toFixed(2)}/min
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
          <StyledButtonGroup size="small" variant="outlined">
            <Button
              onClick={() => onMachineCountChange(machineCount - 1)}
              disabled={machineCount <= 1}
              title="Decrease machine count"
            >
              <RemoveIcon fontSize="small" />
            </Button>
            <Button 
              disabled 
              sx={{ 
                px: 2,
                minWidth: '48px',
                fontWeight: 'medium',
              }}
            >
              {machineCount}
            </Button>
            <Button
              onClick={() => onMachineCountChange(machineCount + 1)}
              title="Increase machine count"
            >
              <AddIcon fontSize="small" />
            </Button>
          </StyledButtonGroup>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: getEfficiencyColor(parseFloat(efficiency)),
              fontWeight: 'medium',
              minWidth: '60px',
              textAlign: 'right'
            }}
          >
            {efficiency}%
          </Typography>
        </Box>
      </Box>
    </StyledControls>
  );
} 