import {
  tocForResources,
  mergeResources,
  Merged
} from '../../'
import { expectType } from 'tsd'

expectType<string>(tocForResources([{ name: 'ns1', path: '/some/path' }], '/some'))
expectType<Merged>(mergeResources([{ name: 'ns1', resources: { key: 'val' } }]))
