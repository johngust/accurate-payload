import * as migration_20260217_061142_initial from './20260217_061142_initial';

export const migrations = [
  {
    up: migration_20260217_061142_initial.up,
    down: migration_20260217_061142_initial.down,
    name: '20260217_061142_initial'
  },
];
