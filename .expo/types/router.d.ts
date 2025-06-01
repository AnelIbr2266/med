/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(authentificated)` | `/(authentificated)/` | `/(authentificated)/(tabs)` | `/(authentificated)/(tabs)/apteki` | `/(authentificated)/(tabs)/karta` | `/(authentificated)/(tabs)/main` | `/(authentificated)/(tabs)/user_info` | `/(authentificated)/(tabs)/visity` | `/(authentificated)/apteki` | `/(authentificated)/karta` | `/(authentificated)/location` | `/(authentificated)/main` | `/(authentificated)/migration` | `/(authentificated)/user_info` | `/(authentificated)/visity` | `/(tabs)` | `/(tabs)/apteki` | `/(tabs)/karta` | `/(tabs)/main` | `/(tabs)/user_info` | `/(tabs)/visity` | `/_sitemap` | `/apteki` | `/karta` | `/location` | `/login` | `/main` | `/migration` | `/user_info` | `/visity`;
      DynamicRoutes: `/(authentificated)/(vizity)/close/${Router.SingleRoutePart<T>}` | `/(authentificated)/(vizity)/completed/${Router.SingleRoutePart<T>}` | `/(authentificated)/(vizity)/not_completed/${Router.SingleRoutePart<T>}` | `/(authentificated)/apteki/${Router.SingleRoutePart<T>}` | `/(authentificated)/close/${Router.SingleRoutePart<T>}` | `/(authentificated)/completed/${Router.SingleRoutePart<T>}` | `/(authentificated)/not_completed/${Router.SingleRoutePart<T>}` | `/(authentificated)/vizity/${Router.SingleRoutePart<T>}` | `/(vizity)/close/${Router.SingleRoutePart<T>}` | `/(vizity)/completed/${Router.SingleRoutePart<T>}` | `/(vizity)/not_completed/${Router.SingleRoutePart<T>}` | `/apteki/${Router.SingleRoutePart<T>}` | `/close/${Router.SingleRoutePart<T>}` | `/completed/${Router.SingleRoutePart<T>}` | `/not_completed/${Router.SingleRoutePart<T>}` | `/vizity/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/(authentificated)/(vizity)/close/[id]` | `/(authentificated)/(vizity)/completed/[id]` | `/(authentificated)/(vizity)/not_completed/[id]` | `/(authentificated)/apteki/[id]` | `/(authentificated)/close/[id]` | `/(authentificated)/completed/[id]` | `/(authentificated)/not_completed/[id]` | `/(authentificated)/vizity/[id]` | `/(vizity)/close/[id]` | `/(vizity)/completed/[id]` | `/(vizity)/not_completed/[id]` | `/apteki/[id]` | `/close/[id]` | `/completed/[id]` | `/not_completed/[id]` | `/vizity/[id]`;
    }
  }
}
