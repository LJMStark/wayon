import * as migration_20260422_130902 from './20260422_130902';
import * as migration_20260427_233442 from './20260427_233442';
import * as migration_20260508_120000 from './20260508_120000';
import * as migration_20260511_080000 from './20260511_080000';
import * as migration_20260511_090000 from './20260511_090000';
import * as migration_20260511_100000 from './20260511_100000';
import * as migration_20260511_110000 from './20260511_110000';
import * as migration_20260511_120000 from './20260511_120000';

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
  {
    up: migration_20260511_080000.up,
    down: migration_20260511_080000.down,
    name: '20260511_080000'
  },
  {
    up: migration_20260511_090000.up,
    down: migration_20260511_090000.down,
    name: '20260511_090000'
  },
  {
    up: migration_20260511_100000.up,
    down: migration_20260511_100000.down,
    name: '20260511_100000'
  },
  {
    up: migration_20260511_110000.up,
    down: migration_20260511_110000.down,
    name: '20260511_110000'
  },
  {
    up: migration_20260511_120000.up,
    down: migration_20260511_120000.down,
    name: '20260511_120000'
  },
];
