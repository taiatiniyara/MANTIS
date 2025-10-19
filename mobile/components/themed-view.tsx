import { View, type ViewProps } from 'react-native';
import { Colors } from '@/constants/theme';

export type ThemedViewProps = ViewProps & {
  backgroundColor?: string;
  variant?: 'default' | 'secondary' | 'tertiary' | 'card';
};

export function ThemedView({ 
  style, 
  backgroundColor, 
  variant = 'default',
  ...otherProps 
}: ThemedViewProps) {
  let bgColor = backgroundColor;
  
  if (!bgColor) {
    switch (variant) {
      case 'secondary':
        bgColor = Colors.backgroundSecondary;
        break;
      case 'tertiary':
        bgColor = Colors.backgroundTertiary;
        break;
      case 'card':
        bgColor = Colors.card;
        break;
      default:
        bgColor = Colors.background;
    }
  }

  return <View style={[{ backgroundColor: bgColor }, style]} {...otherProps} />;
}
