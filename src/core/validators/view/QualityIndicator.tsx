import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface QualityIndicatorProps {
  score: number;
  completionPercent: number;
  showDetails?: boolean;
  onPress?: () => void;
}

export const QualityIndicator: React.FC<QualityIndicatorProps> = ({
  score,
  completionPercent,
  showDetails = true,
  onPress
}) => {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#48BB78'; // Verde
    if (score >= 60) return '#ED8936'; // Laranja
    return '#F56565'; // Vermelho
  };
  
  const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Excelente';
    if (score >= 80) return 'Muito Bom';
    if (score >= 70) return 'Bom';
    if (score >= 60) return 'Regular';
    return 'Precisa Melhorar';
  };
  
  const getCompletionColor = (percent: number): string => {
    if (percent >= 90) return '#48BB78';
    if (percent >= 70) return '#ED8936';
    return '#A0AEC0';
  };
  
  const Component = onPress ? TouchableOpacity : View;
  
  return (
    <Component 
      style={[styles.container, onPress && styles.pressable]} 
      onPress={onPress}
    >
      <View style={styles.row}>
        {/* Score de Qualidade */}
        <View style={styles.indicator}>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreText, { color: getScoreColor(score) }]}>
              {score}
            </Text>
          </View>
          <Text style={styles.label}>Qualidade</Text>
          {showDetails && (
            <Text style={[styles.sublabel, { color: getScoreColor(score) }]}>
              {getScoreLabel(score)}
            </Text>
          )}
        </View>
        
        {/* Completude */}
        <View style={styles.indicator}>
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${completionPercent}%`,
                  backgroundColor: getCompletionColor(completionPercent)
                }
              ]} 
            />
          </View>
          <Text style={styles.label}>Completude</Text>
          {showDetails && (
            <Text style={[styles.sublabel, { color: getCompletionColor(completionPercent) }]}>
              {completionPercent}%
            </Text>
          )}
        </View>
      </View>
      
      {onPress && (
        <Text style={styles.tapHint}>Toque para ver detalhes</Text>
      )}
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  pressable: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  indicator: {
    alignItems: 'center',
    flex: 1,
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressContainer: {
    width: 80,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A5568',
    marginTop: 8,
  },
  sublabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  tapHint: {
    fontSize: 11,
    color: '#A0AEC0',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});