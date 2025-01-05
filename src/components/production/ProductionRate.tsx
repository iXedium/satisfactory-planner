import React from 'react';
import { Box, TextField, IconButton, Typography, Tooltip } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

interface ProductionRateProps {
  totalRate: number;
  manualRate: number;
  onManualRateChange: (rate: number) => void;
  onOptimalRateClick: () => void;
  onClearRate: () => void;
  detailLevel: 'compact' | 'normal' | 'detailed';
}

export function ProductionRate({
  totalRate,
  manualRate,
  onManualRateChange,
  onOptimalRateClick,
  onClearRate,
  detailLevel
}: ProductionRateProps) {
  return (
    <Box 
      className="production-rate" 
      onClick={e => e.stopPropagation()}
      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
    >
      <Typography variant="body1" color="text.primary">
        {totalRate.toFixed(2)}/min
      </Typography>
      {detailLevel !== 'compact' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Clear manual rate">
            <IconButton size="small" onClick={onClearRate}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <TextField
            type="number"
            size="small"
            value={manualRate || 0}
            onChange={(e) => onManualRateChange(parseFloat(e.target.value) || 0)}
            onWheel={(e) => e.currentTarget.blur()}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            placeholder="Add rate..."
            inputProps={{
              min: "0",
              step: "0.1",
              style: { width: '80px' }
            }}
          />
          <Tooltip title="Set manual rate to achieve 100% efficiency">
            <IconButton size="small" onClick={onOptimalRateClick}>
              <ArrowUpwardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
} 