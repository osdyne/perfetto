import { type AppImpl } from '../../ui/src/core/app_impl';

declare interface Window {
  Perfetto: typeof AppImpl;
}
