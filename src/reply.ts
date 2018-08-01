/**
 * Return type for various [Sink](#sink) functions. Indicates whether or not the sink
 * desires more input from its source. See [`Bacon.fromBinder`](#frombinder) for example.
 */
export enum Reply {
  more = "<more>",
  noMore = "<no-more>"
}

/**
 * Reply for "more data, please".
 */
export const more: Reply = Reply.more
/**
 * Reply for "no more data, please".
 */
export const noMore: Reply = Reply.noMore
