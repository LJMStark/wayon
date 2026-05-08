import * as migration_20260422_130902 from './20260422_130902';
import * as migration_20260427_233442 from './20260427_233442';
import * as migration_20260508_120000 from './20260508_120000';

export const migrations = [
  {
    up: migration_20260422_130902.up,
    down: migration_20260422_130902.down,
    name: '20260422_130902'
  },
  {
    up: migration_20260427_233442.up,
    down: migration_20260427_233442.down,
    name: '20260427_233442'
  },
  {
    up: migration_20260508_120000.up,
    down: migration_20260508_120000.down,
    name: '20260508_120000'
  },
];
