// export interface IQueryable<T> {
//     where(predicate: (item: T) => boolean): IQueryable<T>;
//     select<U>(selector: (item: T) => U): IQueryable<U>;
//     orderBy<K>(keySelector: (item: T) => K): IQueryable<T>;
//     orderByDescending<K>(keySelector: (item: T) => K): IQueryable<T>;
//     toArray(): T[];
//   }
  
//   export class Query<T> implements IQueryable<T> {
//     constructor(private readonly data: T[]) {}
  
//     where(predicate: (item: T) => boolean): Query<T> {
//       return new Query(this.data.filter(predicate));
//     }
  
//     select<U>(selector: (item: T) => U): Query<U> {
//       return new Query(this.data.map(selector));
//     }
  
//     orderBy<K>(keySelector: (item: T) => K): Query<T> {
//       return new Query([...this.data].sort((a, b) => {
//         const aKey = keySelector(a);
//         const bKey = keySelector(b);
//         return aKey > bKey ? 1 : aKey < bKey ? -1 : 0;
//       }));
//     }
  
//     orderByDescending<K>(keySelector: (item: T) => K): Query<T> {
//       return new Query([...this.data].sort((a, b) => {
//         const aKey = keySelector(a);
//         const bKey = keySelector(b);
//         return aKey < bKey ? 1 : aKey > bKey ? -1 : 0;
//       }));
//     }
  
//     toArray(): T[] {
//       return this.data;
//     }
//   }
  