import * as migration_20260624_091525 from './20260624_091525';
import * as migration_20260624_092636 from './20260624_092636';

export const migrations = [
  {
    up: migration_20260624_091525.up,
    down: migration_20260624_091525.down,
    name: '20260624_091525',
  },
  {
    up: migration_20260624_092636.up,
    down: migration_20260624_092636.down,
    name: '20260624_092636'
  },
];
