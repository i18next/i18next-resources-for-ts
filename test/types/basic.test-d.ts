import {
  tocForResources,
  mergeResources,
  mergeResourcesAsInterface,
  Merged
} from '../../'
import { expectType } from 'tsd'

expectType<string>(tocForResources([{ name: 'ns1', path: '/some/path' }], '/some'))
expectType<Merged>(mergeResources([{ name: 'ns1', resources: { key: 'val' } }]))
expectType<string>(mergeResourcesAsInterface([{ name: 'ns1', resources: { key: 'val' } }]))
