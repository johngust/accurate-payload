import * as migration_20260217_061142_initial from './20260217_061142_initial';
import * as migration_20260220_103222_category_parent from './20260220_103222_category_parent';
import * as migration_20260223_110459 from './20260223_110459';
import * as migration_20260225_175615 from './20260225_175615';

export const migrations = [
  {
    up: migration_20260217_061142_initial.up,
    down: migration_20260217_061142_initial.down,
    name: '20260217_061142_initial',
  },
  {
    up: migration_20260220_103222_category_parent.up,
    down: migration_20260220_103222_category_parent.down,
    name: '20260220_103222_category_parent',
  },
  {
    up: migration_20260223_110459.up,
    down: migration_20260223_110459.down,
    name: '20260223_110459',
  },
  {
    up: migration_20260225_175615.up,
    down: migration_20260225_175615.down,
    name: '20260225_175615'
  },
];
