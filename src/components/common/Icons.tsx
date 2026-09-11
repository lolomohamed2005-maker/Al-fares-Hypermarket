import React from 'react';
import {
  Wheat,
  Coffee,
  Milk,
  Cake,
  Popcorn,
  Apple,
  Beef,
  Sparkles,
  Heart,
  Baby,
  Home,
  Package,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'Wheat':
      return <Wheat {...props} />;
    case 'Coffee':
      return <Coffee {...props} />;
    case 'Milk':
      return <Milk {...props} />;
    case 'Cake':
      return <Cake {...props} />;
    case 'Popcorn':
      return <Popcorn {...props} />;
    case 'Apple':
      return <Apple {...props} />;
    case 'Beef':
      return <Beef {...props} />;
    case 'Sparkles':
      return <Sparkles {...props} />;
    case 'Heart':
      return <Heart {...props} />;
    case 'Baby':
      return <Baby {...props} />;
    case 'Home':
      return <Home {...props} />;
    default:
      return <Package {...props} />;
  }
};

export const DynamicIcon = CategoryIcon;
