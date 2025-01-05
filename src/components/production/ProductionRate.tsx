import React from 'react';
import { Box, TextField, IconButton, Typography, Tooltip, Paper, styled } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const StyledRateContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  '&:hover': {
    backgroundColor: theme.palette.background.default,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    backgroundColor: theme.palette.background.default,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '& input': {
      textAlign: 'right',
      paddingRight: theme.spacing(1),
    },
  },
}));

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
    <StyledRateContainer 
      elevation={0}
      onClick={e => e.stopPropagation()}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <Typography 
          variant="subtitle2" 
          color="text.secondary"
          sx={{ fontSize: '0.75rem' }}
        >
          Total Rate
        </Typography>
        <Typography 
          variant="h6" 
          color="text.primary"
          sx={{ 
            fontWeight: 'medium',
            lineHeight: 1.2
          }}
        >
          {totalRate.toFixed(2)}/min
        </Typography>
      </Box>

      {detailLevel !== 'compact' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Clear manual rate">
            <span>
              <IconButton 
                size="small" 
                onClick={onClearRate}
                disabled={!manualRate}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'error.main',
                  },
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <StyledTextField
            type="number"
            size="small"
            value={manualRate || ''}
            onChange={(e) => onManualRateChange(parseFloat(e.target.value) || 0)}
            onWheel={(e) => e.currentTarget.blur()}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            placeholder="Manual rate..."
            inputProps={{
              min: "0",
              step: "0.1",
              style: { 
                width: '80px',
                textAlign: 'right',
              }
            }}
          />

          <Tooltip title="Set manual rate to achieve 100% efficiency">
            <span>
              <IconButton 
                size="small" 
                onClick={onOptimalRateClick}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'success.main',
                  },
                }}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}
    </StyledRateContainer>
  );
} 