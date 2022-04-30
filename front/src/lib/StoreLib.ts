import {InjectionKey} from 'vue'
import {createStore, useStore as baseUseStore, Store, StoreOptions} from 'vuex'
import storeOptions from '../store';

// eslint-disable-next-line symbol-description
export const key: InjectionKey<Store<any>> = Symbol()
export const store = createStore<any>(storeOptions);

export function useStore(): Store<any> {
  return baseUseStore(key)
}
