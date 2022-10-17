export const formatLabel = (label: string): string =>
  label
    .replaceAll('_', ' ')
    .split(' ')
    .filter(v => !!v)
    .map(v => v[0].toUpperCase() + v.substring(1))
    .join(' ');
