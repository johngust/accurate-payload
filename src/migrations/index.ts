import * as migration_20260217_061142_initial from './20260217_061142_initial';
import * as migration_20260220_103222_category_parent from './20260220_103222_category_parent';

export const migrations = [
  {
    up: migration_20260217_061142_initial.up,
    down: migration_20260217_061142_initial.down,
    name: '20260217_061142_initial',
  },
  {
    up: migration_20260220_103222_category_parent.up,
    down: migration_20260220_103222_category_parent.down,
    name: '20260220_103222_category_parent'
  },
];
