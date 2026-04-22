import * as migration_20260422_130902 from './20260422_130902';

export const migrations = [
  {
    up: migration_20260422_130902.up,
    down: migration_20260422_130902.down,
    name: '20260422_130902'
  },
];
