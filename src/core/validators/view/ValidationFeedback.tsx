import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ValidationResult } from '../../../core/validators/interface/IValidator';

interface ValidationFeedbackProps {
  validation?: ValidationResult | null;
  fieldName?: string;
  showScore?: boolean;
  showOnlyErrors?: boolean;
  compact?: boolean;
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  validation,
  fieldName,
  showScore = false,
  showOnlyErrors = false,
  compact = false
}) => {
  if (!validation) return null;
  
  // Filtra por campo específico se informado
  const errors = fieldName 
    ? validation.errors.filter(e => e.field === fieldName)
    : validation.errors;
    
  const warnings = fieldName 
    ? validation.warnings.filter(w => w.field === fieldName)
    : validation.warnings;
    
  const info = fieldName 
    ? validation.info.filter(i => i.field === fieldName)
    : validation.info;
  
  if (errors.length === 0 && warnings.length === 0 && info.length === 0) {
    return null;
  }
  
  return (
    <View style={[styles.container, compact && styles.compact]}>
      {/* Erros */}
      {errors.map((error, index) => (
        <View key={`error-${index}`} style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <View style={styles.messageContainer}>
            <Text style={styles.errorMessage}>{error.message}</Text>
            {error.suggestion && !compact && (
              <Text style={styles.suggestion}>💡 {error.suggestion}</Text>
            )}
          </View>
        </View>
      ))}
      
      {/* Warnings */}
      {!showOnlyErrors && warnings.map((warning, index) => (
        <View key={`warning-${index}`} style={styles.warningContainer}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.messageContainer}>
            <Text style={styles.warningMessage}>{warning.message}</Text>
            {warning.suggestion && !compact && (
              <Text style={styles.suggestion}>💡 {warning.suggestion}</Text>
            )}
          </View>
        </View>
      ))}
      
      {/* Info */}
      {!showOnlyErrors && info.map((infoItem, index) => (
        <View key={`info-${index}`} style={styles.infoContainer}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={styles.messageContainer}>
            <Text style={styles.infoMessage}>{infoItem.message}</Text>
            {infoItem.improvement && !compact && (
              <Text style={styles.improvement}>✨ {infoItem.improvement}</Text>
            )}
          </View>
        </View>
      ))}
      
      {/* Score */}
      {showScore && validation.score !== undefined && (
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Qualidade:</Text>
          <View style={[styles.scoreBar, { width: `${validation.score}%` }]} />
          <Text style={styles.scoreText}>{validation.score}/100</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  compact: {
    marginVertical: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF5F5',
    borderLeftWidth: 3,
    borderLeftColor: '#F56565',
    padding: 12,
    marginBottom: 8,
    borderRadius: 4,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFAF0',
    borderLeftWidth: 3,
    borderLeftColor: '#ED8936',
    padding: 12,
    marginBottom: 8,
    borderRadius: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 3,
    borderLeftColor: '#4299E1',
    padding: 12,
    marginBottom: 8,
    borderRadius: 4,
  },
  messageContainer: {
    flex: 1,
    marginLeft: 8,
  },
  errorIcon: {
    fontSize: 16,
  },
  warningIcon: {
    fontSize: 16,
  },
  infoIcon: {
    fontSize: 16,
  },
  errorMessage: {
    color: '#C53030',
    fontSize: 14,
    fontWeight: '500',
  },
  warningMessage: {
    color: '#C05621',
    fontSize: 14,
    fontWeight: '500',
  },
  infoMessage: {
    color: '#2B6CB0',
    fontSize: 14,
    fontWeight: '500',
  },
  suggestion: {
    color: '#4A5568',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  improvement: {
    color: '#4A5568',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
    color: '#4A5568',
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#48BB78',
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3748',
  },
});